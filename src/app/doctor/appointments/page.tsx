
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { CalendarClock, ArrowLeft, BadgeCheck, BadgeX, BadgeHelp, Filter } from 'lucide-react';
import { format, parseISO, startOfDay, isEqual } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// --- Simulated "current logged-in doctor" ---
// In a real app, this would come from an auth context
const CURRENT_DOCTOR_ID = 'doc1'; // e.g., Dr. Alice Martin
const CURRENT_DOCTOR_NAME = 'Dr. Alice Martin';
// ---

// Simulated appointments data for ALL doctors (this would ideally be fetched or from global state)
// Make sure this structure is consistent with `allBookedAppointments` in AppointmentScheduler
interface GlobalAppointment {
  id: string;
  dateTime: string; // ISO string
  patientName: string; 
  status: string; // 'Confirmé', 'Annulé par patient', 'En attente'
  doctorId?: string;
  doctorName?: string; 
}

const allClinicAppointments: GlobalAppointment[] = [
  // Appointments for Dr. Alice Martin (doc1)
  { id: 'globApp1', dateTime: '2024-07-28T09:00:00', patientName: 'Laura Durand', status: 'Confirmé', doctorId: 'doc1', doctorName: 'Dr. Alice Martin' },
  { id: 'globApp2', dateTime: new Date().toISOString(), patientName: 'Claude Monet', status: 'Confirmé', doctorId: 'doc1', doctorName: 'Dr. Alice Martin' }, // Today for Dr. Martin

  // Appointments for Dr. Bernard Dubois (doc2)
  { id: 'globApp3', dateTime: '2024-07-28T10:00:00', patientName: 'Paul Lefevre', status: 'Confirmé', doctorId: 'doc2', doctorName: 'Dr. Bernard Dubois' },
  { id: 'globApp4', dateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), patientName: 'Jean Dupont', status: 'En attente', doctorId: 'doc2', doctorName: 'Dr. Bernard Dubois' }, // Tomorrow for Dr. Dubois
  
  // Appointments for Dr. Chloé Lambert (doc3)
  { id: 'globApp5', dateTime: '2024-07-29T14:00:00', patientName: 'Sophie Petit', status: 'Annulé par patient', doctorId: 'doc3', doctorName: 'Dr. Chloé Lambert' },
];


export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  
  // State for appointments specific to THIS doctor
  const [doctorAppointments, setDoctorAppointments] = useState<GlobalAppointment[]>([]);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    // Filter global appointments to get only those for the current doctor
    const appointmentsForThisDoctor = allClinicAppointments.filter(
      app => app.doctorId === CURRENT_DOCTOR_ID
    );
    setDoctorAppointments(appointmentsForThisDoctor);
  }, []);


  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredAppointments = useMemo(() => {
    return doctorAppointments.filter(app => {
      const appointmentDate = startOfDay(parseISO(app.dateTime));
      const inputDate = filterDate ? startOfDay(parseISO(filterDate)) : null;
      const dateMatch = !inputDate || isEqual(appointmentDate, inputDate);
      return dateMatch;
    }).sort((a, b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
  }, [filterDate, doctorAppointments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white"><BadgeCheck className="mr-1 h-4 w-4" />Confirmé</Badge>;
      case 'Annulé par patient':
        return <Badge variant="destructive"><BadgeX className="mr-1 h-4 w-4" />Annulé (Patient)</Badge>;
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
            <CalendarClock className="mr-3 h-8 w-8" /> Mes Rendez-vous ({CURRENT_DOCTOR_NAME})
          </h2>
          <p className="text-muted-foreground">Consultez votre planning de consultations.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5" />Filtrer par date</CardTitle>
            <div className="mt-4">
              <Label htmlFor="filterDate">Date</Label>
              <Input 
                type="date" 
                id="filterDate"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date et Heure</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{format(parseISO(app.dateTime), "eeee d MMMM yyyy 'à' HH:mm", { locale: fr })}</TableCell>
                    <TableCell>{app.patientName}</TableCell>
                    <TableCell>{getStatusBadge(app.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <p className="text-muted-foreground text-center py-6">Aucun rendez-vous trouvé pour cette date.</p>
            )}
          </CardContent>
        </Card>
        
        <CardFooter className="mt-8 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/doctor/dashboard">
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

    