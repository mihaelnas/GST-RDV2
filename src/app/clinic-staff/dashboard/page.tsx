
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Users, CalendarPlus, ClipboardList, Settings, BarChart2, UserPlus, Hospital, List, Eye, BriefcaseMedical } from 'lucide-react';

export default function ClinicStaffDashboardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary">Tableau de Bord Personnel Clinique</h2>
          <p className="text-muted-foreground">Gérez les opérations et l'administration de la clinique.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestion des Médecins</CardTitle>
              <BriefcaseMedical className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Ajoutez, visualisez ou modifiez les profils médecins.</p>
              <Button className="w-full" asChild>
                <Link href="/clinic-staff/doctors/add">
                  <UserPlus className="mr-2 h-4 w-4" /> Ajouter un Médecin
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                 <Link href="/clinic-staff/doctors">
                    <List className="mr-2 h-4 w-4" /> Voir/Modifier les Médecins
                 </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestion des Patients</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Créez, visualisez ou gérez les dossiers patients.</p>
               <Button className="w-full" asChild>
                <Link href="/clinic-staff/patients/add">
                    <UserPlus className="mr-2 h-4 w-4" /> Ajouter un Patient
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/clinic-staff/patients">
                    <List className="mr-2 h-4 w-4" /> Voir/Modifier les Patients
                </Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestion des Rendez-vous</CardTitle>
              <CalendarPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Visualisez et organisez tous les rendez-vous.</p>
              <Button className="w-full" asChild>
                <Link href="/clinic-staff/appointments">
                    <Eye className="mr-2 h-4 w-4" /> Voir tous les rendez-vous
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Facturation et Paiements</CardTitle>
              <ClipboardList className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Suivez les factures et les paiements.</p>
              <Button className="w-full" onClick={() => alert("Accès au module de facturation (non implémenté).")}>Accéder à la facturation</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Rapports d'Activité</CardTitle>
              <BarChart2 className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Générez des rapports sur l'activité de la clinique.</p>
              <Button className="w-full" variant="outline" onClick={() => alert("Génération de rapports (non implémentée).")}>Voir les rapports</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Paramètres de la Clinique</CardTitle>
              <Settings className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Configurez les informations et services de la clinique.</p>
              <Button className="w-full" variant="outline" onClick={() => alert("Accès aux paramètres de la clinique (non implémenté).")}>Configurer</Button>
            </CardContent>
          </Card>
        </div>
         <CardFooter className="mt-10 text-center border-t pt-6">
            <Button variant="link" asChild>
                <Link href="/">Retour à l'accueil principal</Link>
            </Button>
        </CardFooter>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
