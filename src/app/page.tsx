import AppointmentScheduler from '@/components/appointment-scheduler';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-headline font-bold text-primary drop-shadow-sm">
            Clinique Rendez-Vous
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
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
