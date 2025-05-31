
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Users, CalendarPlus, ClipboardList, Settings, BarChart2, UserPlus, UserX, Hospital, ShieldCheck } from 'lucide-react';

export default function ClinicStaffDashboardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleAddDoctor = () => alert("Fonctionnalité 'Ajouter un Médecin' non implémentée. Le personnel peut créer un compte médecin ici.");
  const handleDeleteDoctor = () => alert("Fonctionnalité 'Supprimer un Médecin' non implémentée.");
  const handleAddPatient = () => alert("Fonctionnalité 'Ajouter un Patient' non implémentée. Le personnel peut créer un compte patient ici.");
  const handleDeletePatient = () => alert("Fonctionnalité 'Supprimer un Patient' non implémentée.");

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
              <Hospital className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Ajoutez ou supprimez des profils médecins.</p>
              <Button className="w-full" onClick={handleAddDoctor}>
                <UserPlus className="mr-2 h-4 w-4" /> Ajouter un Médecin
              </Button>
              <Button className="w-full" variant="outline" onClick={handleDeleteDoctor}>
                 <UserX className="mr-2 h-4 w-4" /> Supprimer un Médecin
              </Button>
              {/* Placeholder pour la liste des médecins */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Liste des médecins (simulée)...</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestion des Patients</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Créez ou gérez les dossiers patients.</p>
               <Button className="w-full" onClick={handleAddPatient}>
                <UserPlus className="mr-2 h-4 w-4" /> Ajouter un Patient
              </Button>
              <Button className="w-full" variant="outline" onClick={handleDeletePatient}>
                 <UserX className="mr-2 h-4 w-4" /> Supprimer un Patient
              </Button>
              <Button className="w-full mt-2" variant="secondary" onClick={() => alert("Accès aux détails et modification des patients (non implémenté).")}>
                Voir/Modifier les Patients
              </Button>
              {/* Placeholder pour la liste des patients */}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground">Liste des patients (simulée)...</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gestion des Rendez-vous</CardTitle>
              <CalendarPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Visualisez, organisez et confirmez tous les rendez-vous.</p>
              <Button className="w-full" onClick={() => alert("Accès au planning général des rendez-vous (non implémenté).")}>Voir tous les rendez-vous</Button>
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
