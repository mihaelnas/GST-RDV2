
"use client";

import React, { useState, useEffect, useMemo } from 'react';
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
import { Calendar as CalendarIcon, Clock, CalendarDays, CheckCircle2, Info, CalendarCheck, CalendarX, UserCheck, User, MailWarning } from 'lucide-react';
import { format, isPast, startOfDay, isEqual, set, getDay, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';
import type { DayOfWeek } from '@/app/doctor/availability/page';
import { sendPatientConfirmationEmail, sendDoctorAppointmentNotificationEmail } from '@/ai/flows/notificationFlow';
import type { AppointmentNotificationInput } from '@/ai/flows/notificationFlow';


interface Appointment {
  id: string;
  dateTime: Date;
  durationMinutes: number;
  isBooked: boolean;
  doctorId?: string;
  doctorName?: string;
  patientId?: string; // Simulate patient booking
  patientName?: string; // Simulate patient name
}

interface AppointmentSchedulerProps {
  isLoggedIn: boolean;
  // For simulation, if logged in, we might have a patient's info
  loggedInPatientInfo?: { id: string; name: string; email: string };
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  email: string; // Added for notifications
  weeklySchedule: DayOfWeek[];
  absences: Array<{ id: string; date: string; isFullDay: boolean; startTime?: string; endTime?: string; reason?: string }>;
}

const mockDoctorsData: Doctor[] = [
  {
    id: 'doc1',
    name: 'Dr. Alice Martin',
    specialty: 'Cardiologie',
    email: 'alice.martin@example.com',
    weeklySchedule: [
      { dayName: 'Lundi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Mardi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Mercredi', isWorkingDay: false, startTime: '', endTime: '' },
      { dayName: 'Jeudi', isWorkingDay: true, startTime: '10:00', endTime: '18:00' },
      { dayName: 'Vendredi', isWorkingDay: true, startTime: '09:00', endTime: '13:00' },
      { dayName: 'Samedi', isWorkingDay: false, startTime: '', endTime: '' },
      { dayName: 'Dimanche', isWorkingDay: false, startTime: '', endTime: '' },
    ],
    absences: [
      { id: 'absDoc1_1', date: format(new Date(new Date().setDate(new Date().getDate() + 3)), 'yyyy-MM-dd'), isFullDay: true, reason: 'Conférence' }
    ],
  },
  {
    id: 'doc2',
    name: 'Dr. Bernard Dubois',
    specialty: 'Pédiatrie',
    email: 'bernard.dubois@example.com',
    weeklySchedule: [
      { dayName: 'Lundi', isWorkingDay: true, startTime: '08:00', endTime: '12:00' },
      { dayName: 'Mardi', isWorkingDay: true, startTime: '08:00', endTime: '12:00' },
      { dayName: 'Mercredi', isWorkingDay: true, startTime: '13:00', endTime: '17:00' },
      { dayName: 'Jeudi', isWorkingDay: true, startTime: '13:00', endTime: '17:00' },
      { dayName: 'Vendredi', isWorkingDay: false, startTime: '', endTime: '' },
      { dayName: 'Samedi', isWorkingDay: true, startTime: '09:00', endTime: '12:00' },
      { dayName: 'Dimanche', isWorkingDay: false, startTime: '', endTime: '' },
    ],
    absences: [],
  },
  {
    id: 'doc3',
    name: 'Dr. Chloé Lambert',
    specialty: 'Dermatologie',
    email: 'chloe.lambert@example.com',
     weeklySchedule: [
      { dayName: 'Lundi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Mardi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Mercredi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Jeudi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Vendredi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
      { dayName: 'Samedi', isWorkingDay: false, startTime: '', endTime: '' },
      { dayName: 'Dimanche', isWorkingDay: false, startTime: '', endTime: '' },
    ],
    absences: [
       { id: 'absDoc3_1', date: format(new Date(), 'yyyy-MM-dd'), isFullDay: false, startTime: '14:00', endTime: '17:00', reason: 'Rendez-vous personnel' }
    ],
  },
];


const generateAppointmentsForDate = (
  date: Date,
  globalBookings: Appointment[],
  selectedDoctor?: Doctor
): Appointment[] => {
  const appointments: Appointment[] = [];
  const targetDate = startOfDay(date);

  const dayOfWeekIndex = getDay(targetDate);
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const currentDayName = dayNames[dayOfWeekIndex];

  if (isPast(targetDate) && !isEqual(targetDate, startOfDay(new Date()))) {
    return [];
  }

  if (!selectedDoctor) return [];

  let doctorWorkDay = selectedDoctor.weeklySchedule.find(d => d.dayName === currentDayName);

  if (!doctorWorkDay || !doctorWorkDay.isWorkingDay || !doctorWorkDay.startTime || !doctorWorkDay.endTime) {
    return [];
  }

  const fullDayAbsence = selectedDoctor.absences.find(abs =>
      isEqual(startOfDay(parse(abs.date, 'yyyy-MM-dd', new Date())), targetDate) && abs.isFullDay
  );
  if (fullDayAbsence) return [];

  const interval = 30;
  const [startHour, startMinute] = doctorWorkDay.startTime.split(':').map(Number);
  const [endHour, endMinute] = doctorWorkDay.endTime.split(':').map(Number);

  for (let hour = startHour; hour <= endHour; hour++) {
    const currentLoopMinuteStart = (hour === startHour) ? startMinute : 0;
    const currentLoopMinuteEnd = (hour === endHour) ? endMinute : 60;

    for (let minute = currentLoopMinuteStart; minute < currentLoopMinuteEnd; minute += interval) {
      const slotDateTime = set(targetDate, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });

      if (isEqual(targetDate, startOfDay(new Date())) && slotDateTime.getTime() <= new Date().getTime()) {
        continue;
      }

      let isPartialAbsence = false;
      const partialAbsence = selectedDoctor.absences.find(abs =>
        isEqual(startOfDay(parse(abs.date, 'yyyy-MM-dd', new Date())), targetDate) &&
        !abs.isFullDay && abs.startTime && abs.endTime
      );
      if (partialAbsence) {
        const absenceStartDateTime = set(targetDate, { hours: parseInt(partialAbsence.startTime!.split(':')[0]), minutes: parseInt(partialAbsence.startTime!.split(':')[1])});
        const absenceEndDateTime = set(targetDate, { hours: parseInt(partialAbsence.endTime!.split(':')[0]), minutes: parseInt(partialAbsence.endTime!.split(':')[1])});
        if (slotDateTime >= absenceStartDateTime && slotDateTime < absenceEndDateTime) {
          isPartialAbsence = true;
        }
      }
      if (isPartialAbsence) continue;

      const isAlreadyBooked = globalBookings.some(bookedApp =>
        isEqual(startOfDay(bookedApp.dateTime), targetDate) &&
        bookedApp.dateTime.getHours() === slotDateTime.getHours() &&
        bookedApp.dateTime.getMinutes() === slotDateTime.getMinutes() &&
        bookedApp.doctorId === selectedDoctor.id
      );

      appointments.push({
        id: format(slotDateTime, 'yyyyMMddHHmm') + `_doc${selectedDoctor.id}`,
        dateTime: slotDateTime,
        durationMinutes: interval,
        isBooked: isAlreadyBooked,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
      });
    }
  }
  return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
};


// Simulate logged-in patient info for demo
const SIMULATED_LOGGED_IN_PATIENT = {
  id: 'patientX',
  name: 'Patient Connecté',
  email: 'patient.connecte@example.com',
};


export default function AppointmentScheduler({ isLoggedIn }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allBookedAppointments, setAllBookedAppointments] = useState<Appointment[]>([]);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>(mockDoctorsData[0]?.id); // Default to first doctor
  const selectedDoctor = useMemo(() => mockDoctorsData.find(doc => doc.id === selectedDoctorId), [selectedDoctorId]);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [dialogAction, setDialogAction] = useState<'book' | 'cancel' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [animateId, setAnimateId] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<'booked' | 'cancelled' | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    setAppointments(generateAppointmentsForDate(selectedDate, allBookedAppointments, selectedDoctor));
  }, [selectedDate, allBookedAppointments, selectedDoctor]);

  const availableSlots = useMemo(() =>
    appointments.filter(app => !app.isBooked),
    [appointments]
  );

  const patientBookedSlots = useMemo(() =>
    allBookedAppointments
      .filter(app => app.isBooked && (isLoggedIn && app.patientId === SIMULATED_LOGGED_IN_PATIENT.id))
      .sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()),
    [allBookedAppointments, isLoggedIn]
  );

  const handleOpenDialog = (appointment: Appointment, action: 'book' | 'cancel') => {
    if (action === 'book') {
      if (!isLoggedIn) {
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour réserver un rendez-vous.",
          variant: "destructive",
        });
        router.push('/login');
        return;
      }
      if (!selectedDoctorId) {
        toast({
          title: "Médecin non sélectionné",
          description: "Veuillez d'abord sélectionner un médecin.",
          variant: "destructive",
        });
        return;
      }
    }
    setSelectedAppointment(appointment);
    setDialogAction(action);
    setShowDialog(true);
  };

  const handleConfirmDialog = async () => {
    if (!selectedAppointment || !dialogAction) return;

    setAnimateId(selectedAppointment.id);

    if (dialogAction === 'book') {
      if (!isLoggedIn || !selectedDoctor) {
        router.push('/login');
        setShowDialog(false);
        return;
      }
      const bookedAppointmentData: Appointment = {
        ...selectedAppointment,
        isBooked: true,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        patientId: SIMULATED_LOGGED_IN_PATIENT.id, // Simulate with logged-in patient
        patientName: SIMULATED_LOGGED_IN_PATIENT.name,
      };
      setAllBookedAppointments(prev => [...prev, bookedAppointmentData]);
      setAnimationType('booked');
      toast({
        title: "Rendez-vous Confirmé!",
        description: `Votre rendez-vous avec ${selectedDoctor.name} pour le ${format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })} est confirmé.`,
        className: "bg-accent text-accent-foreground"
      });

      // Prepare notification data
      const notificationInput: AppointmentNotificationInput = {
        patientName: SIMULATED_LOGGED_IN_PATIENT.name,
        patientEmail: SIMULATED_LOGGED_IN_PATIENT.email,
        doctorName: selectedDoctor.name,
        doctorEmail: selectedDoctor.email, // Ensure doctors have emails in mockDoctorsData
        appointmentDateTime: selectedAppointment.dateTime,
        appointmentId: selectedAppointment.id,
      };

      try {
        const patientEmailResult = await sendPatientConfirmationEmail(notificationInput);
        toast({ title: "Notification Patient", description: patientEmailResult.message });
        const doctorEmailResult = await sendDoctorAppointmentNotificationEmail(notificationInput);
        toast({ title: "Notification Médecin", description: doctorEmailResult.message });
      } catch (error) {
        console.error("Failed to send notifications:", error);
        toast({ title: "Erreur de Notification", description: "Impossible d'envoyer les notifications par e-mail.", variant: "destructive" });
      }


    } else if (dialogAction === 'cancel') {
      setAllBookedAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
      setAnimationType('cancelled');
      toast({
        title: "Rendez-vous Annulé",
        description: `Votre rendez-vous avec ${selectedAppointment.doctorName || 'le médecin'} pour le ${format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })} a été annulé.`,
        variant: "destructive"
      });
    }

    setTimeout(() => {
      setAnimateId(null);
      setAnimationType(null);
    }, 600);

    setShowDialog(false);
    setSelectedAppointment(null);
    setDialogAction(null);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedAppointment(null);
    setDialogAction(null);
  }

  const getSlotEndTime = (dateTime: Date, durationMinutes: number): Date => {
    return new Date(dateTime.getTime() + durationMinutes * 60000);
  };

  return (
    <div className="space-y-12">
      <Card className="bg-card shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-muted/30 p-6 border-b">
            <CardTitle className="text-2xl font-headline text-primary flex items-center">
                <CalendarIcon className="mr-3 h-6 w-6" />
                Planifier votre Rendez-vous
            </CardTitle>
            <CardDescription>
                {isLoggedIn ? "Choisissez un médecin, une date et un créneau horaire." : "Connectez-vous pour choisir un médecin, une date et un créneau horaire."}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary"/>
                    Sélectionnez un médecin :
                </h3>
                <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                    <SelectTrigger className="w-full sm:w-[320px] text-base py-3 shadow-sm">
                        <SelectValue placeholder="Choisir un médecin" />
                    </SelectTrigger>
                    <SelectContent>
                        {mockDoctorsData.map(doc => (
                            <SelectItem key={doc.id} value={doc.id}>
                                {doc.name} - {doc.specialty}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground flex items-center">
                    <CalendarDays className="mr-2 h-5 w-5 text-primary"/>
                    Sélectionnez une date :
                </h3>
                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-full sm:w-[320px] justify-start text-left font-normal text-base py-3 shadow-sm",
                        !selectedDate && "text-muted-foreground"
                    )}
                    >
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
                        const today = startOfDay(new Date());
                        const newSelectedDay = startOfDay(date);
                        if (newSelectedDay >= today) {
                            setSelectedDate(date);
                            setPopoverOpen(false);
                        } else {
                            toast({
                            title: "Date non valide",
                            description: "Veuillez sélectionner une date future ou aujourd'hui.",
                            variant: "destructive"
                            });
                        }
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
                <div className="flex items-center gap-2 mb-4">
                <Clock className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                    Horaires disponibles pour {selectedDoctor ? selectedDoctor.name : 'le médecin sélectionné'} le {format(selectedDate, "eeee d MMMM yyyy", { locale: fr })}
                </h3>
                </div>
                {!selectedDoctorId && (
                     <div className="p-6 text-center col-span-full bg-muted/50 rounded-md">
                        <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-md text-muted-foreground">Veuillez d'abord sélectionner un médecin pour voir les créneaux disponibles.</p>
                    </div>
                )}
                {selectedDoctorId && availableSlots.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableSlots.map(app => (
                    <Card
                        key={app.id}
                        className={cn(
                        "shadow-md hover:shadow-lg transition-all duration-300 flex flex-col text-center group",
                        animateId === app.id && animationType === 'booked' ? "animate-out fade-out-50 duration-500" : "animate-in fade-in-0 duration-500"
                        )}
                    >
                        <CardHeader className="pb-2 pt-4 flex-grow">
                        <CardTitle className="text-lg font-medium">
                            {format(app.dateTime, 'HH:mm', { locale: fr })}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {format(getSlotEndTime(app.dateTime, app.durationMinutes), 'HH:mm', { locale: fr })}
                        </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-3">
                        <Button
                            variant={isLoggedIn ? "default" : "secondary"}
                            size="sm"
                            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground group-hover:scale-105 transition-transform"
                            onClick={() => handleOpenDialog(app, 'book')}
                            disabled={!isLoggedIn && false}
                        >
                            <CalendarCheck className="mr-2 h-4 w-4" />
                            {isLoggedIn ? "Réserver" : "Se connecter"}
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                )}
                {selectedDoctorId && availableSlots.length === 0 && (
                <div className="p-6 text-center col-span-full bg-muted/50 rounded-md">
                    <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground">Aucun créneau disponible pour {selectedDoctor?.name} le {format(selectedDate, "eeee d MMMM yyyy", { locale: fr })}.</p>
                    <p className="text-xs text-muted-foreground mt-1">Veuillez essayer une autre date ou un autre médecin.</p>
                </div>
                )}
                 {!isLoggedIn && (
                    <div className="mt-6 p-4 text-sm text-center bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md flex items-center justify-center">
                        <MailWarning className="mr-2 h-5 w-5" />
                        Connectez-vous pour activer les notifications par e-mail pour vos rendez-vous.
                    </div>
                )}
            </div>
        </CardContent>
      </Card>

      {isLoggedIn && patientBookedSlots.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-headline font-semibold">Mes rendez-vous Confirmés</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {patientBookedSlots.map(app => (
              <Card
                key={app.id}
                className={cn(
                  "shadow-lg border-l-4 border-primary bg-card flex flex-col",
                  animateId === app.id && animationType === 'cancelled' ? "animate-out fade-out-50 duration-500" : "animate-in fade-in-0 duration-500"
                )}
              >
                <CardHeader className="flex-grow pb-3">
                  <CardTitle className="flex items-center text-xl">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                     {format(app.dateTime, 'HH:mm', { locale: fr })} - {format(getSlotEndTime(app.dateTime, app.durationMinutes), 'HH:mm', { locale: fr })}
                  </CardTitle>
                  <CardDescription>{format(app.dateTime, 'PPPP', { locale: fr })}</CardDescription>
                  {app.doctorName && <CardDescription className="text-sm font-medium text-primary pt-1">Avec: {app.doctorName}</CardDescription>}
                </CardHeader>
                <CardContent className="flex items-center flex-grow py-2">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-accent" />
                  <p className="text-sm font-semibold text-accent">Confirmé</p>
                </CardContent>
                <CardFooter className="p-4">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => handleOpenDialog(app, 'cancel')}
                  >
                    <CalendarX className="mr-2 h-4 w-4" />
                    Annuler
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {isLoggedIn && patientBookedSlots.length === 0 && (
         <Card className="p-8 text-center mt-10 bg-muted/30 rounded-lg">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Vous n'avez aucun rendez-vous programmé pour le moment.</p>
            <p className="text-sm text-muted-foreground mt-1">Utilisez le calendrier ci-dessus pour en planifier un.</p>
          </Card>
      )}

      {!isLoggedIn && (
        <Card className="p-8 text-center mt-10 bg-muted/30 rounded-lg">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">Connectez-vous pour voir vos rendez-vous et en programmer de nouveaux.</p>
        </Card>
      )}


      {selectedAppointment && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline text-xl">
                {dialogAction === 'book' ? 'Confirmation de réservation' : "Confirmation d'annulation"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Voulez-vous vraiment {dialogAction === 'book' ? `réserver ce créneau avec ${selectedAppointment.doctorName || 'le médecin sélectionné'}` : 'annuler ce créneau'} pour le <br />
                <span className="font-semibold text-foreground">{format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-4">
              <AlertDialogCancel onClick={handleCloseDialog}>Non, retour</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDialog}
                className={cn(
                  dialogAction === 'book' ? 'bg-primary hover:bg-primary/90' : 'bg-destructive hover:bg-destructive/90',
                  'text-primary-foreground'
                )}
              >
                Oui, {dialogAction === 'book' ? 'confirmer la réservation' : "confirmer l'annulation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
