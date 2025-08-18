"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Settings, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

// This is a placeholder as a full auth system is not in place.
// In a real app, this would be retrieved from a session context.
const CURRENT_DOCTOR_DATA = {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // Dr. Alice Martin's ID from schema.sql
    fullName: 'Dr. Alice Martin',
    specialty: 'Cardiologie',
    email: 'alice.martin@clinique.fr',
};

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis." }),
  specialty: z.string().min(3, { message: "La spécialité est requise." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;


export default function DoctorProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: CURRENT_DOCTOR_DATA, // Pre-fill with current doctor's data
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSubmitting(true);
    // In a real app, you would call an `updateDoctor` flow here.
    // For now, we simulate the API call and show a toast.
    try {
        console.log("Simulating update for doctor profile:", data);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        toast({
            title: "Profil Mis à Jour (Simulation)",
            description: "Vos informations de profil ont été enregistrées avec succès.",
            className: "bg-accent text-accent-foreground",
        });
    } catch(error) {
        toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-2xl shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-2">
                <Settings className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Mon Profil</CardTitle>
            <CardDescription>Mettez à jour vos informations personnelles et professionnelles.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input id="fullName" {...register("fullName")} disabled={isSubmitting}/>
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="specialty">Spécialité</Label>
                <Input id="specialty" {...register("specialty")} disabled={isSubmitting}/>
                {errors.specialty && <p className="text-sm text-destructive mt-1">{errors.specialty.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" {...register("email")} disabled={isSubmitting}/>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Save className="mr-2 h-5 w-5" />}
                 {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="mt-6 border-t pt-6">
            <Button variant="outline" asChild className="w-full sm:w-auto mx-auto">
              <Link href="/doctor/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Tableau de Bord
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
