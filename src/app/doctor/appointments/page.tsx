
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarClock, ArrowLeft, BadgeCheck, BadgeX, BadgeHelp, Filter, Loader2 } from 'lucide-react';
import { format, parseISO, startOfDay, isEqual } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { listAppointmentsByDoctor, BookedAppointment } from '@/ai/flows/appointmentManagementFlow';

// --- Simulated "current logged-in doctor" ---
// In a real app, this would come from an auth context
const CURRENT_DOCTOR_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Dr. Alice Martin's ID from schema.sql
const CURRENT_DOCTOR_NAME = 'Dr. Alice Martin';
// ---

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  
  const [doctorAppointments, setDoctorAppointments] = useState<BookedAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
        const appointmentsForThisDoctor = await listAppointmentsByDoctor(CURRENT_DOCTOR_ID);
        setDoctorAppointments(appointmentsForThisDoctor);
    } catch (error) {
        console.error("Failed to fetch doctor's appointments:", error);
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
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Chargement...</p>
                </div>
            ) : filteredAppointments.length > 0 ? (
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
                    <TableCell>{app.patientId}</TableCell> {/* Note: We only have patientId here, need join for name */}
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
