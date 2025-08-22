
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppointmentScheduler from '@/components/appointment-scheduler';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import type { DayOfWeek } from '@/app/doctor/availability/page';
import { useToast } from '@/hooks/use-toast';
import { checkDatabaseConnection } from '@/ai/flows/healthCheckFlow';
import { listDoctors } from '@/ai/flows/doctorManagementFlow';

// In a real app, this would be fetched from a central store or context
// that gets its data from the database. For now, we manage it in the root page state.
const initialDoctorSchedules: Record<string, { weeklySchedule: DayOfWeek[], absences: any[] }> = {};

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState(initialDoctorSchedules);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const user = sessionStorage.getItem('loggedInUser');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  // Effect to perform a health check on the database connection
  useEffect(() => {
    const verifyDbConnection = async () => {
      const { success, error } = await checkDatabaseConnection();
      if (!success) {
        toast({
          title: "Erreur de Connexion à la Base de Données",
          description: "Impossible d'établir la connexion. Les fonctionnalités de l'application seront limitées.",
          variant: "destructive",
          duration: Infinity, // Keep the toast visible
        });
        // The detailed error is logged on the server-side, no need to log it again here.
      }
    };
    verifyDbConnection();
  }, [toast]);


  // Effect to load schedules from localStorage on mount
  useEffect(() => {
    const loadSchedules = async () => {
        try {
            const savedSchedules = localStorage.getItem('doctorSchedules');
            if (savedSchedules) {
                setDoctorSchedules(JSON.parse(savedSchedules));
            } else {
                // If nothing is saved, fetch doctors and create a default schedule
                const doctors = await listDoctors();
                const initialSchedules: Record<string, { weeklySchedule: DayOfWeek[], absences: any[] }> = {};
                doctors.forEach(doc => {
                    initialSchedules[doc.fullName] = {
                        weeklySchedule: [
                            { dayName: 'Lundi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
                            { dayName: 'Mardi', isWorkingDay: true, startTime: '09:00', endTime: '17:00' },
                            { dayName: 'Mercredi', isWorkingDay: false, startTime: '', endTime: '' },
                            { dayName: 'Jeudi', isWorkingDay: true, startTime: '10:00', endTime: '18:00' },
                            { dayName: 'Vendredi', isWorkingDay: true, startTime: '09:00', endTime: '13:00' },
                            { dayName: 'Samedi', isWorkingDay: false, startTime: '', endTime: '' },
                            { dayName: 'Dimanche', isWorkingDay: false, startTime: '', endTime: '' },
                        ],
                        absences: []
                    };
                });
                setDoctorSchedules(initialSchedules);
                localStorage.setItem('doctorSchedules', JSON.stringify(initialSchedules));
            }
        } catch (error) {
            console.error("Could not load or initialize doctor schedules:", error);
            toast({
                title: "Erreur de chargement des plannings",
                description: "Impossible de récupérer la liste des médecins pour initialiser les plannings.",
                variant: "destructive"
            });
        }
    };
    loadSchedules();
  }, [toast]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary mb-6 drop-shadow-sm">
            Bienvenue à la Clinique Rendez-Vous
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Votre santé est notre priorité. Planifiez facilement vos consultations médicales en ligne avec nos spécialistes. Accédez à un service rapide, simple et sécurisé.
          </p>
          {!isLoggedIn && (
            <div className="space-x-4">
              <Button size="lg" asChild>
                <Link href="/register">Créer un compte</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="mb-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl font-headline font-semibold text-primary mb-4">Prise de Rendez-vous Simplifiée</h3>
            <p className="text-muted-foreground mb-3">
              Notre plateforme intuitive vous permet de consulter les disponibilités de nos praticiens et de réserver un créneau en quelques clics.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mb-4">
              <li>Consultez les horaires en temps réel.</li>
              <li>Choisissez le spécialiste adapté à vos besoins.</li>
              <li>Recevez des confirmations et rappels par e-mail.</li>
            </ul>
            {isLoggedIn && <p className="text-accent font-semibold">Vous êtes connecté. Vous pouvez prendre rendez-vous ci-dessous.</p>}
            {!isLoggedIn && <p className="text-destructive font-semibold">Veuillez vous connecter ou créer un compte pour prendre un rendez-vous.</p>}
          </div>
          <div>
            <Image
              src="https://placehold.co/600x400.png"
              alt="Illustration de consultation médicale"
              width={600}
              height={400}
              className="rounded-lg shadow-xl"
              data-ai-hint="medical consultation healthcare"
            />
          </div>
        </section>
        
        <AppointmentScheduler isLoggedIn={isLoggedIn} doctorSchedules={doctorSchedules} />
      </main>

      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
