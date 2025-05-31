import AppointmentScheduler from '@/components/appointment-scheduler';
import { Stethoscope } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Stethoscope className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-headline font-bold text-primary drop-shadow-sm">
              Clinique Rendez-Vous
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Planifiez votre prochain rendez-vous facilement et rapidement.
          </p>
        </header>
        <AppointmentScheduler />
      </div>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
