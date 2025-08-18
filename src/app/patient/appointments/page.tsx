
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { CalendarClock, ArrowLeft, BadgeCheck, BadgeX, BadgeHelp, Loader2, CalendarX } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { listAppointmentsByPatient, deleteAppointment, type BookedAppointment } from '@/ai/flows/appointmentManagementFlow';

// This would come from an auth context in a real app
const SIMULATED_LOGGED_IN_PATIENT = {
  id: '3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a', // Jean Dupont's ID from schema.sql
  name: 'Jean Dupont',
};

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  
  const [appointments, setAppointments] = useState<BookedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    // In a real app, you'd get the patient ID from the session/auth context
    const patientId = SIMULATED_LOGGED_IN_PATIENT.id; 
    try {
        const patientAppointments = await listAppointmentsByPatient(patientId);
        setAppointments(patientAppointments);
    } catch (error) {
        console.error("Failed to fetch patient's appointments:", error);
        toast({ title: "Erreur", description: "Impossible de charger vos rendez-vous.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);


  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const result = await deleteAppointment(appointmentId);
      if (result.success) {
        toast({
          title: "Rendez-vous Annulé",
          description: "Votre rendez-vous a bien été annulé.",
          variant: "destructive",
        });
        fetchAppointments(); // Refresh the list
      } else {
        throw new Error(result.message || "La suppression a échoué silencieusement.");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast({ title: "Erreur", description: "Impossible d'annuler le rendez-vous.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><BadgeCheck className="mr-1 h-4 w-4" />Confirmé</Badge>;
      case 'Annulé':
        return <Badge variant="destructive"><BadgeX className="mr-1 h-4 w-4" />Annulé</Badge>;
      case 'En attente':
        return <Badge variant="secondary" className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900"><BadgeHelp className="mr-1 h-4 w-4" />En attente</Badge>;
      case 'Payée':
        return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600 text-white"><BadgeCheck className="mr-1 h-4 w-4" />Payée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <CalendarClock className="mr-3 h-8 w-8" /> Mes Rendez-vous
          </h2>
          <p className="text-muted-foreground">Consultez l'historique de vos consultations.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
             <CardTitle>Rendez-vous à venir et passés</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Chargement de vos rendez-vous...</p>
                </div>
            ) : appointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date et Heure</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{format(parseISO(app.dateTime), "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}</TableCell>
                    <TableCell>{app.doctorName}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right">
                       {(app.status === 'En attente' || app.status === 'Confirmé') && (
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" title="Annuler le rendez-vous">
                              <CalendarX className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir annuler ce rendez-vous avec {app.doctorName} le {format(parseISO(app.dateTime), "d MMM yyyy 'à' HH:mm", { locale: fr })}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Non</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelAppointment(app.id)}>Oui, annuler</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <p className="text-muted-foreground text-center py-6">Vous n'avez aucun rendez-vous pour le moment.</p>
            )}
          </CardContent>
        </Card>
        
        <CardFooter className="mt-8 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/patient/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Tableau de Bord
            </Link>
          </Button>
        </CardFooter>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
