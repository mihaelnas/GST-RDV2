
"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AppointmentScheduler from '@/components/appointment-scheduler';
import Header from '@/components/header'; // Import du nouveau Header
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (searchParams.get('loggedIn') === 'true') {
      setIsLoggedIn(true);
      // Nettoyer l'URL en supprimant le paramètre query
      const newPath = window.location.pathname;
      router.replace(newPath, { scroll: false });
    }
  }, [searchParams, router]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/', { scroll: false }); // Redirige vers l'accueil en nettoyant l'URL
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
              <li>Recevez des confirmations et rappels.</li>
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
        
        <AppointmentScheduler isLoggedIn={isLoggedIn} />
      </main>

      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
