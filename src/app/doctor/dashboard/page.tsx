
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react'; // Removed useEffect as it wasn't strictly necessary for this simulation
import { BarChart, CalendarDays, FileText, Settings, Users } from 'lucide-react';

export default function DoctorDashboardPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Dashboards are for logged-in users

  const handleLogout = () => {
    setIsLoggedIn(false); 
    // In a real app, clear session/token here
    router.push('/'); 
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
              <p className="text-sm text-muted-foreground mb-4">Consultez et gérez votre planning de consultations.</p>
              <Button className="w-full">Voir mes rendez-vous</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Dossiers Patients</CardTitle>
              <Users className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Accédez aux dossiers médicaux de vos patients.</p>
              <Button className="w-full">Consulter les dossiers</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Prescriptions</CardTitle>
              <FileText className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Générez et consultez les prescriptions.</p>
              <Button className="w-full">Gérer les prescriptions</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Statistiques</CardTitle>
              <BarChart className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Visualisez vos statistiques d'activité.</p>
              <Button className="w-full" variant="outline">Voir les statistiques</Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mon Profil</CardTitle>
              <Settings className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Mettez à jour vos informations personnelles.</p>
              <Button className="w-full" variant="outline">Modifier mon profil</Button>
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
