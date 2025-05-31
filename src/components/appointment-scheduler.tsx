
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
import { Calendar as CalendarIcon, Clock, CalendarDays, CheckCircle2, Info, CalendarCheck, CalendarX, UserCheck } from 'lucide-react';
import { format, isPast, startOfDay, isEqual, set } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useRouter } from 'next/navigation';

interface Appointment {
  id: string;
  dateTime: Date;
  durationMinutes: number;
  isBooked: boolean;
}

interface AppointmentSchedulerProps {
  isLoggedIn: boolean;
}

const generateAppointmentsForDate = (date: Date, globalBookings: Appointment[]): Appointment[] => {
  const appointments: Appointment[] = [];
  const targetDate = startOfDay(date); 

  const startTime = 9;
  const endTime = 17;
  const interval = 30;

  if (isPast(targetDate) && !isEqual(targetDate, startOfDay(new Date()))) {
      return [];
  }

  for (let hour = startTime; hour < endTime; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const slotDateTime = set(targetDate, { hours: hour, minutes: minute, seconds: 0, milliseconds: 0 });

      if (isEqual(targetDate, startOfDay(new Date())) && slotDateTime.getTime() <= new Date().getTime()) {
        continue; 
      }

      const isAlreadyBooked = globalBookings.some(bookedApp => 
        isEqual(bookedApp.dateTime, slotDateTime)
      );

      appointments.push({
        id: format(slotDateTime, 'yyyyMMddHHmm'), 
        dateTime: slotDateTime,
        durationMinutes: interval,
        isBooked: isAlreadyBooked,
      });
    }
  }
  return appointments.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
};

export default function AppointmentScheduler({ isLoggedIn }: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allBookedAppointments, setAllBookedAppointments] = useState<Appointment[]>([]);
  
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [dialogAction, setDialogAction] = useState<'book' | 'cancel' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [animateId, setAnimateId] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<'booked' | 'cancelled' | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);


  useEffect(() => {
    setAppointments(generateAppointmentsForDate(selectedDate, allBookedAppointments));
  }, [selectedDate, allBookedAppointments]);

  const availableSlots = useMemo(() => 
    appointments.filter(app => !app.isBooked), 
    [appointments]
  );

  const bookedSlots = useMemo(() => 
    allBookedAppointments.sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()), 
    [allBookedAppointments]
  );

  const handleOpenDialog = (appointment: Appointment, action: 'book' | 'cancel') => {
    if (action === 'book' && !isLoggedIn) {
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour réserver un rendez-vous.",
        variant: "destructive",
      });
      router.push('/login');
      return;
    }
    setSelectedAppointment(appointment);
    setDialogAction(action);
    setShowDialog(true);
  };

  const handleConfirmDialog = () => {
    if (!selectedAppointment || !dialogAction) return;

    setAnimateId(selectedAppointment.id);

    if (dialogAction === 'book') {
      if (!isLoggedIn) { // Double check, bien que handleOpenDialog devrait l'attraper
        router.push('/login');
        setShowDialog(false);
        return;
      }
      setAllBookedAppointments(prev => [...prev, { ...selectedAppointment, isBooked: true }]);
      setAnimationType('booked');
      toast({
        title: "Rendez-vous Confirmé!",
        description: `Votre rendez-vous pour le ${format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })} est confirmé. Un email de confirmation vous sera envoyé.`,
        className: "bg-accent text-accent-foreground"
      });
    } else if (dialogAction === 'cancel') {
      setAllBookedAppointments(prev => prev.filter(app => app.id !== selectedAppointment.id));
      setAnimationType('cancelled');
      toast({
        title: "Rendez-vous Annulé",
        description: `Votre rendez-vous pour le ${format(selectedAppointment.dateTime, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })} a été annulé.`,
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
                {isLoggedIn ? "Choisissez une date et un créneau horaire pour votre consultation." : "Connectez-vous pour choisir une date et un créneau horaire."}
            </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">Sélectionnez une date :</h3>
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
                    Horaires disponibles pour le {format(selectedDate, "eeee d MMMM yyyy", { locale: fr })}
                </h3>
                </div>
                {availableSlots.length > 0 ? (
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
                            disabled={!isLoggedIn && false} // False pour ne pas griser visuellement mais la logique de redirection s'appliquera
                        >
                            <CalendarCheck className="mr-2 h-4 w-4" />
                            {isLoggedIn ? "Réserver" : "Se connecter"}
                        </Button>
                        </CardFooter>
                    </Card>
                    ))}
                </div>
                ) : (
                <div className="p-6 text-center col-span-full bg-muted/50 rounded-md">
                    <Info className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-md text-muted-foreground">Aucun créneau disponible pour le {format(selectedDate, "eeee d MMMM yyyy", { locale: fr })}.</p>
                    <p className="text-xs text-muted-foreground mt-1">Veuillez essayer une autre date.</p>
                </div>
                )}
            </div>
        </CardContent>
      </Card>

      {isLoggedIn && bookedSlots.length > 0 && (
        <section className="mt-12">
          <div className="flex items-center gap-3 mb-6">
            <UserCheck className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-headline font-semibold">Mes rendez-vous Confirmés</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {bookedSlots.map(app => (
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
      
      {isLoggedIn && bookedSlots.length === 0 && (
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
                Voulez-vous vraiment {dialogAction === 'book' ? 'réserver' : 'annuler'} ce créneau pour le <br />
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
