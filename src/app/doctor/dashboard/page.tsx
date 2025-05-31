
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BarChart, CalendarDays, FileText, Settings, Users, CalendarPlus, CalendarX } from 'lucide-react';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const handleLogout = () => {
    setIsLoggedIn(false); 
    router.push('/'); 
  };

  const handleAddAvailability = () => {
    alert("Fonctionnalité 'Ajouter une disponibilité' non implémentée.");
  };

  const handleDeleteAvailability = () => {
    alert("Fonctionnalité 'Supprimer une disponibilité' non implémentée.");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary">Tableau de Bord Médecin</h2>
          <p className="text-muted-foreground">Gérez vos activités et informations cliniques.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mes Rendez-vous</CardTitle>
              <CalendarDays className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Consultez votre planning de consultations.</p>
              <Button className="w-full" onClick={() => alert("Redirection vers la page de gestion des rendez-vous du médecin (non implémentée).")}>Voir mes rendez-vous</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Gérer mes Disponibilités</CardTitle>
              <CalendarPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-2">Ajoutez ou supprimez vos créneaux de consultation.</p>
              <Button className="w-full" onClick={handleAddAvailability}>Ajouter une disponibilité</Button>
              <Button className="w-full" variant="outline" onClick={handleDeleteAvailability}>
                <CalendarX className="mr-2 h-4 w-4"/>
                Supprimer une disponibilité
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Dossiers Patients</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Accédez aux dossiers médicaux de vos patients.</p>
              <Button className="w-full" onClick={() => alert("Redirection vers la gestion des dossiers patients (non implémentée).")}>Consulter les dossiers</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Prescriptions</CardTitle>
              <FileText className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Générez et consultez les prescriptions.</p>
              <Button className="w-full" onClick={() => alert("Redirection vers la gestion des prescriptions (non implémentée).")}>Gérer les prescriptions</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Statistiques</CardTitle>
              <BarChart className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Visualisez vos statistiques d'activité.</p>
              <Button className="w-full" variant="outline" onClick={() => alert("Affichage des statistiques (non implémenté).")}>Voir les statistiques</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mon Profil</CardTitle>
              <Settings className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Mettez à jour vos informations personnelles.</p>
              <Button className="w-full" variant="outline" onClick={() => alert("Redirection vers la page de profil (non implémentée).")}>Modifier mon profil</Button>
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
