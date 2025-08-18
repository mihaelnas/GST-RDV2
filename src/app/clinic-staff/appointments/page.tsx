
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarClock, Filter, ArrowLeft, BadgeCheck, BadgeX, BadgeHelp, Edit, Ban, Loader2 } from 'lucide-react';
import { format, parseISO, startOfDay, isEqual } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { listDoctors, type Doctor } from '@/ai/flows/doctorManagementFlow';
import { listAppointments, updateAppointmentStatus, type AppointmentDetails } from '@/ai/flows/appointmentManagementFlow';

const statusList = ['Tous les statuts', 'Confirmé', 'Annulé', 'En attente'];

export default function ViewAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);

  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('Tous les médecins');
  const [filterStatus, setFilterStatus] = useState('Tous les statuts');

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedAppointments = await listAppointments();
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast({ title: "Erreur", description: "Impossible de charger la liste des rendez-vous.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const fetchClinicDoctors = async () => {
      setIsLoadingDoctors(true);
      try {
        const fetchedDoctors = await listDoctors();
        setAllDoctors(fetchedDoctors);
      } catch (error) {
        console.error("Failed to fetch doctors for filter:", error);
        toast({ title: "Erreur", description: "Impossible de charger la liste des médecins.", variant: "destructive" });
      } finally {
        setIsLoadingDoctors(false);
      }
    };
    fetchClinicDoctors();
    fetchAppointments();
  }, [toast, fetchAppointments]);

  const doctorsListForFilter = useMemo(() => {
    return ['Tous les médecins', ...allDoctors.map(doc => doc.fullName)];
  }, [allDoctors]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(app => {
      const appointmentDate = startOfDay(parseISO(app.dateTime));
      const inputDate = filterDate ? startOfDay(parseISO(filterDate)) : null;
      
      const dateMatch = !inputDate || isEqual(appointmentDate, inputDate);
      const doctorMatch = filterDoctor === 'Tous les médecins' || app.doctorName === filterDoctor;
      const statusMatch = filterStatus === 'Tous les statuts' || app.status === filterStatus;
      
      return dateMatch && doctorMatch && statusMatch;
    }).sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
  }, [filterDate, filterDoctor, filterStatus, appointments]);

  const handleEditAppointment = (appointmentId: string) => {
    toast({
      title: "Fonctionnalité non implémentée",
      description: `La modification du rendez-vous ${appointmentId} n'est pas encore disponible.`,
    });
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'Annulé');
      toast({
        title: "Rendez-vous annulé",
        description: `Le rendez-vous a été marqué comme annulé.`,
        variant: "destructive",
      });
      fetchAppointments(); // Refresh the list
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setFilterDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <CalendarClock className="mr-3 h-8 w-8" /> Visualisation des Rendez-vous
          </h2>
          <p className="text-muted-foreground">Consultez et filtrez tous les rendez-vous enregistrés dans la clinique.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5" />Filtres</CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <Label htmlFor="filterDate">Date</Label>
                <Input 
                  type="date" 
                  id="filterDate"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="filterDoctor">Médecin</Label>
                {isLoadingDoctors ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-5 w-5 animate-spin" /> 
                    <span>Chargement...</span>
                  </div>
                ) : (
                  <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                    <SelectTrigger id="filterDoctor">
                      <SelectValue placeholder="Choisir un médecin" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsListForFilter.map(docName => <SelectItem key={docName} value={docName}>{docName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <Label htmlFor="filterStatus">Statut</Label>
                 <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger id="filterStatus">
                    <SelectValue placeholder="Choisir un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusList.map(stat => <SelectItem key={stat} value={stat}>{stat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Chargement des rendez-vous...</p>
                </div>
            ) : filteredAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date et Heure</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Médecin</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{format(parseISO(app.dateTime), "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}</TableCell>
                    <TableCell>{app.patientName}</TableCell>
                    <TableCell>{app.doctorName}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditAppointment(app.id)} title="Modifier le rendez-vous">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {app.status !== 'Annulé' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" title="Annuler le rendez-vous">
                              <Ban className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir annuler ce rendez-vous pour {app.patientName} avec {app.doctorName} le {format(parseISO(app.dateTime), "d MMM yyyy 'à' HH:mm", { locale: fr })}?
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
                <p className="text-muted-foreground text-center py-6">Aucun rendez-vous trouvé correspondant à vos filtres.</p>
            )}
          </CardContent>
           <CardFooter className="mt-8 border-t pt-6">
            <Button variant="outline" asChild>
              <Link href="/clinic-staff/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Tableau de Bord
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
