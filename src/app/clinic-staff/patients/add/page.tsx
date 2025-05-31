
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, ArrowLeft, CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const patientSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  dob: z.date({ required_error: "La date de naissance est requise." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

type PatientFormValues = z.infer<typeof patientSchema>;

export default function AddPatientPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  const [popoverOpen, setPopoverOpen] = useState(false);


  const { control, register, handleSubmit, formState: { errors } } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<PatientFormValues> = (data) => {
    console.log("Patient data submitted:", data);
    alert(`Compte patient pour ${data.fullName} créé (simulation). L'email de connexion est ${data.email}.`);
    // In a real app, you'd send this to your backend
    router.push('/clinic-staff/patients'); 
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-2">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Ajouter un Nouveau Patient</CardTitle>
            <CardDescription>Remplissez les informations ci-dessous pour créer un compte patient.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" {...register("fullName")} placeholder="Laura Durand" />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" {...register("email")} placeholder="patient@example.com" />
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
              <div>
                <Label htmlFor="password">Mot de passe (provisoire)</Label>
                <Input id="password" type="password" {...register("password")} placeholder="********" />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-5 w-5" /> Créer le compte Patient
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
