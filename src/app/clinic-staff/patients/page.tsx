
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus, Edit, Trash2, Search, ArrowLeft, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Simulated patient data
const patientsData = [
  { id: 'pat1', name: 'Laura Durand', email: 'laura.durand@example.com', dob: new Date(1990, 5, 15) },
  { id: 'pat2', name: 'Paul Lefevre', email: 'paul.lefevre@example.com', dob: new Date(1985, 8, 22) },
  { id: 'pat3', name: 'Sophie Petit', email: 'sophie.petit@example.com', dob: new Date(2001, 1, 10) },
];

export default function PatientsListPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredPatients = patientsData.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePatient = (patientId: string, patientName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le patient ${patientName} ? Cette action est irréversible.`)) {
      alert(`Patient ${patientName} (ID: ${patientId}) supprimé (simulation).`);
      // Here you would typically call an API to delete the patient
      // and then re-fetch or update the local list.
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary">Liste des Patients</h2>
          <Button asChild>
            <Link href="/clinic-staff/patients/add">
              <UserPlus className="mr-2 h-5 w-5" /> Ajouter un Patient
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="mr-2 h-6 w-6"/>Rechercher et Gérer les Patients</CardTitle>
            <CardDescription>Visualisez, modifiez ou supprimez les dossiers des patients.</CardDescription>
            <div className="mt-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom, email..." 
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
                  <TableHead>Email</TableHead>
                  <TableHead>Date de Naissance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>{patient.email}</TableCell>
                    <TableCell>{format(patient.dob, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/clinic-staff/patients/${patient.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePatient(patient.id, patient.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            ) : (
               <p className="text-muted-foreground text-center py-4">Aucun patient trouvé correspondant à votre recherche.</p>
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
