
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Header from '@/components/header';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, ArrowLeft, CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const patientSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  dob: z.date({ required_error: "La date de naissance est requise." }),
});

type PatientFormValues = z.infer<typeof patientSchema>;

// Simulated patient data for pre-filling the form
const patientsData = [
  { id: 'pat1', name: 'Laura Durand', email: 'laura.durand@example.com', dob: new Date(1990, 5, 15) },
  { id: 'pat2', name: 'Paul Lefevre', email: 'paul.lefevre@example.com', dob: new Date(1985, 8, 22) },
  { id: 'pat3', name: 'Sophie Petit', email: 'sophie.petit@example.com', dob: new Date(2001, 1, 10) },
];


export default function EditPatientPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  const [patient, setPatient] = useState<PatientFormValues | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    const foundPatient = patientsData.find(p => p.id === patientId);
    if (foundPatient) {
      const patientData = { fullName: foundPatient.name, email: foundPatient.email, dob: foundPatient.dob };
      setPatient(patientData);
      reset(patientData);
    } else {
      alert("Patient non trouvé.");
      router.push('/clinic-staff/patients');
    }
  }, [patientId, router, reset]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<PatientFormValues> = (data) => {
    console.log("Updated patient data submitted:", data);
    alert(`Dossier du patient ${data.fullName} mis à jour (simulation).`);
    router.push('/clinic-staff/patients');
  };

  if (!patient) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <p>Chargement des informations du patient...</p>
            <Button variant="link" asChild className="mt-4">
                <Link href="/clinic-staff/patients">Retour à la liste</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
             <div className="flex justify-center items-center mb-2">
                <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Modifier le Dossier Patient</CardTitle>
            <CardDescription>Mettez à jour les informations de {patient.fullName}.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="dob">Date de Naissance</Label>
                 <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisissez une date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        field.onChange(date);
                                        setPopoverOpen(false);
                                    }}
                                    defaultMonth={field.value} // Pour que le calendrier s'ouvre sur la date existante
                                    initialFocus
                                    locale={fr}
                                    captionLayout="dropdown-buttons"
                                    fromYear={1900}
                                    toYear={new Date().getFullYear()}
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.dob && <p className="text-sm text-destructive mt-1">{errors.dob.message}</p>}
              </div>
              <Button type="submit" className="w-full">
                <Edit className="mr-2 h-5 w-5" /> Enregistrer les modifications
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4 mt-4 border-t pt-6">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/clinic-staff/patients">
                <ArrowLeft className="mr-2 h-4 w-4" /> Annuler et voir la liste des patients
              </Link>
            </Button>
             <Button variant="link" asChild>
              <Link href="/clinic-staff/dashboard">
                Retour au Tableau de Bord Principal
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
