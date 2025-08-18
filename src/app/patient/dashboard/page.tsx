
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, CalendarPlus, ClipboardList, Settings, ArrowLeft } from 'lucide-react';

// This would come from an auth context in a real app
const SIMULATED_LOGGED_IN_PATIENT_NAME = 'Jean Dupont';

export default function PatientDashboardPage() {
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
          <h2 className="text-3xl font-headline font-bold text-primary">Tableau de Bord Patient</h2>
          <p className="text-muted-foreground">Bienvenue, {SIMULATED_LOGGED_IN_PATIENT_NAME}. Gérez vos rendez-vous et vos informations ici.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Prendre un Rendez-vous</CardTitle>
              <CalendarPlus className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Consultez les disponibilités et réservez un créneau.</p>
              <Button className="w-full" asChild>
                <Link href="/?fromDashboard=true">Planifier un nouveau rendez-vous</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mes Rendez-vous</CardTitle>
              <ClipboardList className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Consultez et gérez vos rendez-vous à venir et passés.</p>
              <Button className="w-full" variant="outline" asChild>
                 <Link href="/patient/appointments">Voir mes rendez-vous</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">Mon Profil</CardTitle>
              <User className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Consultez ou modifiez vos informations personnelles.</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/patient/profile">Gérer mon profil</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
         <CardFooter className="mt-10 text-center border-t pt-6">
            <Button variant="link" asChild>
                <Link href="/"> <ArrowLeft className="mr-2 h-4 w-4"/>Retour à l'accueil principal</Link>
            </Button>
        </CardFooter>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
