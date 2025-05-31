
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus, ArrowLeft, BriefcaseMedical } from 'lucide-react';

const doctorSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  specialty: z.string().min(3, { message: "La spécialité est requise (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function AddDoctorPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in

  const { register, handleSubmit, formState: { errors } } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<DoctorFormValues> = (data) => {
    console.log("Doctor data submitted:", data);
    alert(`Compte médecin pour ${data.fullName} créé (simulation). L'email de connexion est ${data.email} et le mot de passe choisi.`);
    // In a real app, you'd send this to your backend
    router.push('/clinic-staff/doctors'); 
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-2">
              <BriefcaseMedical className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Ajouter un Nouveau Médecin</CardTitle>
            <CardDescription>Remplissez les informations ci-dessous pour créer un compte médecin.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" {...register("fullName")} placeholder="Dr. Jean Dupont" />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="specialty">Spécialité</Label>
                <Input id="specialty" {...register("specialty")} placeholder="Cardiologie, Pédiatrie..." />
                {errors.specialty && <p className="text-sm text-destructive mt-1">{errors.specialty.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" {...register("email")} placeholder="medecin@example.com" />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Mot de passe (provisoire)</Label>
                <Input id="password" type="password" {...register("password")} placeholder="********" />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full">
                <UserPlus className="mr-2 h-5 w-5" /> Créer le compte Médecin
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-4 mt-4 border-t pt-6">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/clinic-staff/doctors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Annuler et voir la liste des médecins
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
