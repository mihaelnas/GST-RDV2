"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, ArrowLeft, Eye, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { listAppointmentsByDoctor, type BookedAppointment } from '@/ai/flows/appointmentManagementFlow';

// This would come from an auth context in a real app
const CURRENT_DOCTOR_ID = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Dr. Alice Martin's ID from schema.sql

interface PatientInfo {
  id: string;
  name: string;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDoctorPatients = useCallback(async () => {
    setIsLoading(true);
    try {
        const appointments = await listAppointmentsByDoctor(CURRENT_DOCTOR_ID);
        // Deduplicate patients from the appointments list
        const uniquePatients = Array.from(new Map(appointments.map(app => [app.patientId, { id: app.patientId, name: app.patientName }])).values());
        setPatients(uniquePatients);
    } catch (error) {
        console.error("Failed to fetch doctor's patients:", error);
        toast({ title: "Erreur", description: "Impossible de charger la liste de vos patients.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctorPatients();
  }, [fetchDoctorPatients]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredPatients = useMemo(() => patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a,b) => a.name.localeCompare(b.name)), [patients, searchTerm]);

  const handleViewPatientRecord = (patientName: string) => {
    toast({
      title: "Dossier Patient (Simulation)",
      description: `Affichage du dossier complet de ${patientName}. (Fonctionnalité non implémentée)`,
    });
    // In a real app: router.push(`/doctor/patients/${patient.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <Users className="mr-3 h-8 w-8" /> Mes Patients
          </h2>
          <p className="text-muted-foreground">Consultez la liste de vos patients ayant eu un rendez-vous.</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Liste des Patients</CardTitle>
            <div className="mt-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Chargement...</p>
                </div>
            ) : filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du Patient</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => handleViewPatientRecord(patient.name)}>
                        <Eye className="mr-2 h-4 w-4" /> Voir Dossier
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
              <p className="text-muted-foreground text-center py-6">Aucun patient trouvé.</p>
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
