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
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { Clock, CalendarDays, CheckCircle2, Info, CalendarCheck, CalendarX } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  dateTime: Date;
  durationMinutes: number;
  isBooked: boolean;
}

const generateInitialAppointments = (): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  
  const startTime = 9; 
  const endTime = 17; 
  const interval = 30;

  for (let hour = startTime; hour < endTime; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const slotTime = new Date(today);
      slotTime.setHours(hour, minute, 0, 0);
      // Ensure slots are in the future for today
      if (slotTime.getTime() > new Date().getTime()) {
        appointments.push({
          id: `${hour.toString().padStart(2, '0')}${minute.toString().padStart(2, '0')}`,
          dateTime: slotTime,
          durationMinutes: interval,
          isBooked: false,
        });
      }
    }
  }
  return appointments;
};

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [dialogAction, setDialogAction] = useState<'book' | 'cancel' | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  // For animation hints
  const [animateId, setAnimateId] = useState<string | null>(null);
  const [animationType, setAnimationType] = useState<'booked' | 'cancelled' | null>(null);


  useEffect(() => {
    setAppointments(generateInitialAppointments());
  }, []);

  const availableSlots = useMemo(() => 
    appointments.filter(app => !app.isBooked).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()), 
    [appointments]
  );
  const bookedSlots = useMemo(() => 
    appointments.filter(app => app.isBooked).sort((a,b) => a.dateTime.getTime() - b.dateTime.getTime()), 
    [appointments]
  );

  const handleOpenDialog = (appointment: Appointment, action: 'book' | 'cancel') => {
    setSelectedAppointment(appointment);
    setDialogAction(action);
    setShowDialog(true);
  };

  const handleConfirmDialog = () => {
    if (!selectedAppointment || !dialogAction) return;

    setAnimateId(selectedAppointment.id);

    if (dialogAction === 'book') {
      setAppointments(prev => prev.map(app => app.id === selectedAppointment.id ? { ...app, isBooked: true } : app));
      setAnimationType('booked');
      toast({
        title: "Rendez-vous Confirmé!",
        description: `Votre rendez-vous pour ${format(selectedAppointment.dateTime, 'HH:mm', { locale: fr })} est confirmé.`,
        className: "bg-accent text-accent-foreground"
      });
    } else if (dialogAction === 'cancel') {
      setAppointments(prev => prev.map(app => app.id === selectedAppointment.id ? { ...app, isBooked: false } : app));
      setAnimationType('cancelled');
      toast({
        title: "Rendez-vous Annulé",
        description: `Votre rendez-vous pour ${format(selectedAppointment.dateTime, 'HH:mm', { locale: fr })} a été annulé.`,
        variant: "destructive"
      });
    }
    
    setTimeout(() => {
      setAnimateId(null);
      setAnimationType(null);
    }, 600); // Duration of animation

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
      <section>
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-headline font-semibold">Horaires disponibles</h2>
        </div>
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableSlots.map(app => (
              <Card 
                key={app.id} 
                className={cn(
                  "shadow-lg hover:shadow-xl transition-shadow duration-300",
                  animateId === app.id && animationType === 'booked' ? "animate-out fade-out-50 duration-500" : "animate-in fade-in-0 duration-500"
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                    {format(app.dateTime, 'HH:mm', { locale: fr })} - {format(getSlotEndTime(app.dateTime, app.durationMinutes), 'HH:mm', { locale: fr })}
                  </CardTitle>
                  <CardDescription>{format(app.dateTime, 'eeee d MMMM yyyy', { locale: fr })}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Statut: <span className="font-semibold text-accent">Disponible</span></p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default" 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" 
                    onClick={() => handleOpenDialog(app, 'book')}
                  >
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Réserver
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun créneau disponible pour le moment.</p>
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-headline font-semibold">Mes rendez-vous</h2>
        </div>
        {bookedSlots.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bookedSlots.map(app => (
              <Card 
                key={app.id} 
                className={cn(
                  "shadow-lg border-primary",
                  animateId === app.id && animationType === 'cancelled' ? "animate-out fade-out-50 duration-500" : "animate-in fade-in-0 duration-500"
                )}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-xl">
                    <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                    {format(app.dateTime, 'HH:mm', { locale: fr })} - {format(getSlotEndTime(app.dateTime, app.durationMinutes), 'HH:mm', { locale: fr })}
                  </CardTitle>
                  <CardDescription>{format(app.dateTime, 'PPPP', { locale: fr })}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                  <p className="text-sm font-semibold text-green-600">Confirmé</p>
                </CardContent>
                <CardFooter>
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
        ) : (
           <Card className="p-6 text-center">
            <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Vous n'avez aucun rendez-vous programmé.</p>
          </Card>
        )}
      </section>

      {selectedAppointment && (
        <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-headline">
                {dialogAction === 'book' ? 'Confirmation de réservation' : "Confirmation d'annulation"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Voulez-vous vraiment {dialogAction === 'book' ? 'réserver' : 'annuler'} ce créneau pour le <br />
                <span className="font-semibold">{format(selectedAppointment.dateTime, 'eeee d MMMM yyyy', { locale: fr })}</span> à <span className="font-semibold">{format(selectedAppointment.dateTime, 'HH:mm', { locale: fr })}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
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
