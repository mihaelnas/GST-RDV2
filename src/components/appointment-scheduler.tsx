
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, CalendarDays, Info, CalendarCheck, User, MailWarning, Loader2 } from 'lucide-react';
import { format, isPast, startOfDay, isEqual, set, getDay, parseISO, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import { sendPatientConfirmationEmail, sendDoctorAppointmentNotificationEmail } from '@/ai/flows/notificationFlow';
import type { AppointmentNotificationInput } from '@/ai/flows/notificationFlow';
import { listDoctors, type Doctor } from '@/ai/flows/doctorManagementFlow';
import { listAppointments, createAppointment, type AppointmentCreateInput } from '@/ai/flows/appointmentManagementFlow';
import type { BookedAppointment } from '@/ai/flows/appointmentManagementFlow';
import { getDoctorAvailability, type DoctorAvailability } from '@/ai/flows/availabilityFlow';
import type { LoginOutput } from '@/ai/schemas/authSchemas';


interface AppointmentSlot {
  id: string;
  dateTime: Date;
  isBooked: boolean;
  doctorId?: string;
  doctorName?: string;
}

interface AppointmentSchedulerProps {
  isLoggedIn: boolean;
}

const generateAppointmentsForDate = (
  date: Date,
  globalBookings: BookedAppointment[],
  selectedDoctor?: Doctor,
  doctorAvailability?: DoctorAvailability
): AppointmentSlot[] => {
  const appointments: AppointmentSlot[] = [];
  const targetDate = startOfDay(date);
  const dayOfWeekIndex = getDay(targetDate); // Sunday = 0, Monday = 1...
  const isoDayOfWeek = dayOfWeekIndex === 0 ? 7 : dayOfWeekIndex; // Convert to ISO standard: Monday = 1, Sunday = 7

  if (isPast(targetDate) && !isEqual(targetDate, startOfDay(new Date()))) return [];
  if (!selectedDoctor || !doctorAvailability) return [];
  
  const schedule = doctorAvailability;

  let doctorWorkDay = schedule.weeklySchedule.find((d:any) => d.dayOfWeek === isoDayOfWeek);

  if (!doctorWorkDay || !doctorWorkDay.isWorkingDay || !doctorWorkDay.startTime || !doctorWorkDay.endTime) return [];

  // Check for full-day absences
  const fullDayAbsence = schedule.absences.find((abs:any) => isEqual(startOfDay(parseISO(abs.date)), targetDate) && abs.isFullDay);
  if (fullDayAbsence) return [];

  const interval = 30;
  const [startHour, startMinute] = doctorWorkDay.startTime.split(':').map(Number);
  const [endHour, endMinute] = doctorWorkDay.endTime.split(':').map(Number);

  for (let hour = startHour; hour <= endHour; hour++) {
    const currentLoopMinuteStart = (hour === startHour) ? startMinute : 0;
    const currentLoopMinuteEnd = (hour === endHour) ? endMinute : 60;
    for (let minute = currentLoopMinuteStart; minute < currentLoopMinuteEnd; minute += interval) {
      const slotDateTime = set(targetDate, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });
      if (isEqual(targetDate, startOfDay(new Date())) && slotDateTime.getTime() <= new Date().getTime()) continue;

      // Check for partial absences
      let isPartialAbsence = false;
      const partialAbsences = schedule.absences.filter((abs:any) => isEqual(startOfDay(parseISO(abs.date)), targetDate) && !abs.isFullDay && abs.startTime && abs.endTime);
      for(const partialAbsence of partialAbsences) {
        const absenceStartDateTime = set(targetDate, { hours: parseInt(partialAbsence.startTime!.split(':')[0]), minutes: parseInt(partialAbsence.startTime!.split(':')[1])});
        const absenceEndDateTime = set(targetDate, { hours: parseInt(partialAbsence.endTime!.split(':')[0]), minutes: parseInt(partialAbsence.endTime!.split(':')[1])});
        if (slotDateTime >= absenceStartDateTime && slotDateTime < absenceEndDateTime) {
          isPartialAbsence = true;
          break;
        }
      }
      if (isPartialAbsence) continue;

      const isAlreadyBooked = globalBookings.some(bookedApp => 
        bookedApp.doctorId === selectedDoctor.id && 
        isEqual(parseISO(bookedApp.dateTime), slotDateTime)
      );

      appointments.push({
        id: format(slotDateTime, 'yyyyMMddHHmm') + `_doc${selectedDoctor.id}`,
        dateTime: slotDateTime,
        isBooked: isAlreadyBooked,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.fullName,
      });
    }
  }
  return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
};

export default function AppointmentScheduler({ isLoggedIn }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<AppointmentSlot[]>([]);
  const [allBookedAppointments, setAllBookedAppointments] = useState<BookedAppointment[]>([]);
  
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<Record<string, DoctorAvailability>>({});
  
  const selectedDoctor = useMemo(() => allDoctors.find(doc => doc.id === selectedDoctorId), [selectedDoctorId, allDoctors]);
  const selectedDoctorAvailability = useMemo(() => selectedDoctorId ? doctorAvailabilities[selectedDoctorId] : undefined, [selectedDoctorId, doctorAvailabilities]);

  const [patient, setPatient] = useState<LoginOutput | null>(null);

  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentSlot | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [animateId, setAnimateId] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const userJson = sessionStorage.getItem('loggedInUser');
    if (userJson) {
      setPatient(JSON.parse(userJson));
    } else {
      setPatient(null);
    }
  }, [isLoggedIn]);

  const fetchDoctors = useCallback(async () => {
      setIsLoadingDoctors(true);
      try {
        const fetchedDoctors = await listDoctors();
        setAllDoctors(fetchedDoctors);
        if (fetchedDoctors.length > 0) {
          setSelectedDoctorId(fetchedDoctors[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger la liste des médecins.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingDoctors(false);
      }
  }, [toast]);

  const fetchAllBookedAppointments = useCallback(async () => {
    try {
      const bookings = await listAppointments();
      setAllBookedAppointments(bookings.map(b => ({...b, dateTime: b.dateTime})));
    } catch (error) {
        console.error("Failed to fetch booked appointments:", error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les rendez-vous existants.",
          variant: "destructive"
        });
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
    fetchAllBookedAppointments();
  }, [fetchDoctors, fetchAllBookedAppointments]);

  // Fetch availability for the selected doctor
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDoctorId || doctorAvailabilities[selectedDoctorId]) return;
      setIsLoadingSlots(true);
      try {
        const availability = await getDoctorAvailability(selectedDoctorId);
        setDoctorAvailabilities(prev => ({ ...prev, [selectedDoctorId]: availability }));
      } catch (error) {
        console.error(`Failed to fetch availability for doctor ${selectedDoctorId}:`, error);
        toast({ title: "Erreur", description: `Impossible de charger les disponibilités du médecin.`, variant: "destructive" });
      } finally {
        setIsLoadingSlots(false);
      }
    };
    fetchAvailability();
  }, [selectedDoctorId, toast, doctorAvailabilities]);

  useEffect(() => {
    if (selectedDoctor && selectedDoctorAvailability) {
        const generatedSlots = generateAppointmentsForDate(selectedDate, allBookedAppointments, selectedDoctor, selectedDoctorAvailability);
        setAvailableSlots(generatedSlots);
    } else {
        setAvailableSlots([]);
    }
  }, [selectedDate, allBookedAppointments, selectedDoctor, selectedDoctorAvailability]);


  const handleOpenDialog = (appointment: AppointmentSlot) => {
    if (!isLoggedIn) {
        toast({ title: "Authentification requise", description: "Veuillez vous connecter pour réserver.", variant: "destructive" });
        router.push('/login');
        return;
    }
    if (!selectedDoctorId) {
        toast({ title: "Médecin non sélectionné", description: "Veuillez sélectionner un médecin.", variant: "destructive" });
        return;
    }
    setSelectedAppointment(appointment);
    setShowDialog(true);
  };

  const handleConfirmDialog = async () => {
    if (!selectedAppointment || !patient || !selectedDoctor) return;
    
    setIsConfirming(true);
    setAnimateId(selectedAppointment.id);
      
      try {
        const appointmentInput: AppointmentCreateInput = {
          dateTime: selectedAppointment.dateTime.toISOString(),
          patientId: patient.id,
          doctorId: selectedDoctor.id
        };

        const newAppointment = await createAppointment(appointmentInput);
        
        toast({ title: "Rendez-vous Confirmé!", description: `Rendez-vous avec ${selectedDoctor.fullName} le ${format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })} confirmé.`, className: "bg-accent text-accent-foreground" });
        
        const notificationInput: AppointmentNotificationInput = {
          patientName: patient.fullName, patientEmail: patient.email,
          doctorName: selectedDoctor.fullName, doctorEmail: selectedDoctor.email,
          appointmentDateTime: selectedAppointment.dateTime.toISOString(), appointmentId: newAppointment.id,
        };
        await sendPatientConfirmationEmail(notificationInput);
        await sendDoctorAppointmentNotificationEmail(notificationInput);

        fetchAllBookedAppointments();

      } catch (error) {
        console.error("Failed to book appointment:", error);
        toast({ title: "Erreur", description: "Impossible de réserver le rendez-vous.", variant: "destructive" });
      } finally {
          setIsConfirming(false);
          setShowDialog(false);
          setSelectedAppointment(null);
          setTimeout(() => { setAnimateId(null); }, 600);
      }
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="space-y-12">
      <Card className="bg-card shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-2xl font-headline text-primary flex items-center"><CalendarIcon className="mr-3 h-6 w-6" />Planifier votre Rendez-vous</CardTitle>
            <CardDescription>{isLoggedIn ? "Choisissez un médecin, une date et un créneau horaire." : "Choisissez un médecin et une date pour voir les créneaux disponibles."}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center"><User className="mr-2 h-5 w-5 text-primary"/>Sélectionnez un médecin :</h3>
                {isLoadingDoctors ? <Loader2 className="h-6 w-6 animate-spin"/> :
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger className="w-full sm:w-[320px] text-base py-3 shadow-sm"><SelectValue placeholder="Choisir un médecin" /></SelectTrigger>
                    <SelectContent>{allDoctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.fullName} - {doc.specialty}</SelectItem>)}</SelectContent>
                </Select>}
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center"><CalendarDays className="mr-2 h-5 w-5 text-primary"/>Sélectionnez une date :</h3>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button variant={"outline"} className={cn("w-full sm:w-[320px] justify-start text-left font-normal text-base py-3 shadow-sm",!selectedDate && "text-muted-foreground")} disabled={!selectedDoctorId}>
                        <CalendarDays className="mr-3 h-5 w-5 text-primary" />
                        {selectedDate ? format(selectedDate, "PPPP", { locale: fr }) : <span>Choisissez une date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar 
                        mode="single" 
                        selected={selectedDate} 
                        onSelect={(date) => {
                            if (date) {
                                setSelectedDate(date);
                                setPopoverOpen(false);
                            }
                        }}
                        disabled={(date) => isPast(date) && !isEqual(startOfDay(date), startOfDay(new Date()))} 
                        initialFocus 
                        locale={fr}
                    />
                </PopoverContent>
                </Popover>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-4"><Clock className="h-6 w-6 text-primary" /><h3 className="text-lg font-semibold text-foreground">Horaires disponibles</h3></div>
                {!selectedDoctorId ? <div className="p-6 text-center col-span-full bg-muted/50 rounded-md"><Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" /><p className="text-md text-muted-foreground">Veuillez d'abord sélectionner un médecin.</p></div>
                : isLoadingSlots ? <div className="p-6 text-center col-span-full"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>
                : availableSlots.filter(app => !app.isBooked).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableSlots.filter(app => !app.isBooked).map(app => (
                    <Card key={app.id} className={cn("shadow-md hover:shadow-lg transition-all duration-300 flex flex-col text-center group", animateId === app.id ? "animate-out fade-out-50 duration-500" : "animate-in fade-in-0 duration-500")}>
                        <CardHeader className="pb-2 pt-4 flex-grow"><CardTitle className="text-lg font-medium">{format(app.dateTime, 'HH:mm', { locale: fr })}</CardTitle></CardHeader>
                        <CardFooter className="p-3">
                        <Button variant={isLoggedIn ? "default" : "secondary"} size="sm" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group-hover:scale-105 transition-transform" onClick={() => handleOpenDialog(app)}>
                            <CalendarCheck className="mr-2 h-4 w-4" />{isLoggedIn ? "Réserver" : "Se connecter"}
                        </Button>
                        </CardFooter>
                    </Card>))}
                </div>)
                : <div className="p-6 text-center col-span-full bg-muted/50 rounded-md"><Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" /><p className="text-md text-muted-foreground">Aucun créneau disponible pour {selectedDoctor?.fullName} le {format(selectedDate, "eeee d MMMM yyyy", { locale: fr })}.</p></div>}
                 {!isLoggedIn && <div className="mt-6 p-4 text-sm text-center bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md flex items-center justify-center"><MailWarning className="mr-2 h-5 w-5" />Connectez-vous pour activer les notifications par e-mail.</div>}
            </div>
        </CardContent>
      </Card>
      
      {selectedAppointment && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline text-xl">Confirmation de réservation</AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Voulez-vous vraiment réserver ce créneau avec <span className="font-semibold text-foreground">{selectedDoctor?.fullName}</span> le <br />
                <span className="font-semibold text-foreground">{format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel onClick={handleCloseDialog} disabled={isConfirming}>Non, retour</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDialog} disabled={isConfirming} className='bg-primary hover:bg-primary/90 text-primary-foreground'>
                {isConfirming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Oui, confirmer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
