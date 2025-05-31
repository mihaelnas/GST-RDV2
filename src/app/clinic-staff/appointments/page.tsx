
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
import { useState, useMemo, useEffect } from 'react';
import { CalendarClock, Users, BriefcaseMedical, Filter, ArrowLeft, BadgeCheck, BadgeX, BadgeHelp, Edit, Ban } from 'lucide-react';
import { format, parseISO, startOfDay, isEqual } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

// Simulated appointments data (initial state)
const initialAppointmentsData = [
  { id: 'app1', dateTime: '2024-07-28T09:00:00', patientName: 'Laura Durand', doctorName: 'Dr. Alice Martin', status: 'Confirmé' },
  { id: 'app2', dateTime: '2024-07-28T10:30:00', patientName: 'Paul Lefevre', doctorName: 'Dr. Bernard Dubois', status: 'Confirmé' },
  { id: 'app3', dateTime: '2024-07-29T14:00:00', patientName: 'Sophie Petit', doctorName: 'Dr. Alice Martin', status: 'Annulé' },
  { id: 'app4', dateTime: '2024-07-29T15:00:00', patientName: 'Marc Voisin', doctorName: 'Dr. Chloé Lambert', status: 'En attente' },
  { id: 'app5', dateTime: '2024-07-30T11:00:00', patientName: 'Jeanne Moreau', doctorName: 'Dr. Bernard Dubois', status: 'Confirmé' },
  { id: 'app6', dateTime: new Date().toISOString(), patientName: 'Claude Monet', doctorName: 'Dr. Alice Martin', status: 'Confirmé' }, // Today's appointment
];

const doctorsList = ['Tous les médecins', 'Dr. Alice Martin', 'Dr. Bernard Dubois', 'Dr. Chloé Lambert'];
const statusList = ['Tous les statuts', 'Confirmé', 'Annulé', 'En attente'];

interface Appointment {
  id: string;
  dateTime: string;
  patientName: string;
  doctorName: string;
  status: string;
}

export default function ViewAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointmentsData);
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('Tous les médecins');
  const [filterStatus, setFilterStatus] = useState('Tous les statuts');

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
    // router.push(`/clinic-staff/appointments/${appointmentId}/edit`); // Future implementation
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(prevAppointments =>
      prevAppointments.map(app =>
        app.id === appointmentId ? { ...app, status: 'Annulé' } : app
      )
    );
    toast({
      title: "Rendez-vous annulé",
      description: `Le rendez-vous ${appointmentId} a été marqué comme annulé.`,
      variant: "destructive",
    });
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

  // Set filterDate to today by default to show today's appointments
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
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
                <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                  <SelectTrigger id="filterDoctor">
                    <SelectValue placeholder="Choisir un médecin" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsList.map(doc => <SelectItem key={doc} value={doc}>{doc}</SelectItem>)}
                  </SelectContent>
                </Select>
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
            {filteredAppointments.length > 0 ? (
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
                      {(app.status === 'Confirmé' || app.status === 'En attente') && (
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
        </Card>
        
        <CardFooter className="mt-8 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/clinic-staff/dashboard">
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

