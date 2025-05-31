
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus, Edit, Trash2, Search, ArrowLeft } from 'lucide-react';

// Simulated doctor data
const doctorsData = [
  { id: 'doc1', name: 'Dr. Alice Martin', specialty: 'Cardiologie', email: 'alice.martin@example.com' },
  { id: 'doc2', name: 'Dr. Bernard Dubois', specialty: 'Pédiatrie', email: 'bernard.dubois@example.com' },
  { id: 'doc3', name: 'Dr. Chloé Lambert', specialty: 'Dermatologie', email: 'chloe.lambert@example.com' },
];

export default function DoctorsListPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredDoctors = doctorsData.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDoctor = (doctorId: string, doctorName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le Dr. ${doctorName} ? Cette action est irréversible.`)) {
      alert(`Médecin ${doctorName} (ID: ${doctorId}) supprimé (simulation).`);
      // Here you would typically call an API to delete the doctor
      // and then re-fetch or update the local list.
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary">Liste des Médecins</h2>
          <Button asChild>
            <Link href="/clinic-staff/doctors/add">
              <UserPlus className="mr-2 h-5 w-5" /> Ajouter un Médecin
            </Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Rechercher et Gérer les Médecins</CardTitle>
            <CardDescription>Visualisez, modifiez ou supprimez les profils des médecins.</CardDescription>
            <div className="mt-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom, spécialité, email..." 
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {filteredDoctors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.name}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/clinic-staff/doctors/${doctor.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteDoctor(doctor.id, doctor.name)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun médecin trouvé correspondant à votre recherche.</p>
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
