
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Users, ArrowLeft, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

// Simulated patient data for THIS doctor
const initialPatientsData = [
  { id: 'patDoc1', name: 'Laura Durand', dob: new Date(1990, 5, 15), lastVisit: new Date(2024, 6, 28), notes: 'Suivi cardiologique annuel.' },
  { id: 'patDoc2', name: 'Sophie Petit', dob: new Date(2001, 1, 10), lastVisit: new Date(2024, 6, 29), notes: 'Consultation pour acné.' },
  { id: 'patDoc3', name: 'Jean Dupont', dob: new Date(1975, 3, 12), lastVisit: new Date(2023, 11, 5), notes: 'Contrôle de routine.' },
];

interface DoctorPatient {
  id: string;
  name: string;
  dob: Date;
  lastVisit: Date;
  notes?: string;
}

export default function DoctorPatientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [patients, setPatients] = useState<DoctorPatient[]>(initialPatientsData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <p className="text-muted-foreground">Consultez les dossiers de vos patients.</p>
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
            {filteredPatients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date de Naissance</TableHead>
                  <TableHead>Dernière Visite</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{format(patient.dob, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                    <TableCell>{format(patient.lastVisit, 'dd/MM/yyyy', { locale: fr })}</TableCell>
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
