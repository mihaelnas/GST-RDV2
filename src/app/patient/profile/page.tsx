
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { getPatientById, updatePatient } from '@/ai/flows/patientManagementFlow';
import type { Patient, PatientUpdateInput } from '@/ai/flows/patientManagementFlow';

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// This would come from an auth context in a real app
const SIMULATED_LOGGED_IN_PATIENT_ID = '3a5c1e8f-7b6d-4a9c-8e2f-1a3b5d7c9e0a'; // Jean Dupont's ID from schema.sql

export default function PatientProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isLoading, setIsLoading] = useState(true);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      setIsLoading(true);
      try {
        const patientData = await getPatientById(SIMULATED_LOGGED_IN_PATIENT_ID);
        if (patientData) {
          reset(patientData);
        } else {
            toast({ title: "Erreur", description: "Profil patient non trouvé.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Erreur", description: "Impossible de charger les informations du profil.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatientData();
  }, [reset, toast]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    try {
        const updateData: PatientUpdateInput = data;
        await updatePatient(SIMULATED_LOGGED_IN_PATIENT_ID, updateData);
        toast({
            title: "Profil Mis à Jour",
            description: "Vos informations de profil ont été enregistrées avec succès.",
            className: "bg-accent text-accent-foreground",
        });
    } catch (error) {
        console.error("Failed to update profile", error);
        toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
            <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
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
              <Button type="submit" className="w-full">
                <Save className="mr-2 h-5 w-5" /> Enregistrer les modifications
              </Button>
            </form>
          </CardContent>
          <CardFooter className="mt-6 border-t pt-6">
            <Button variant="outline" asChild className="w-full sm:w-auto mx-auto">
              <Link href="/patient/dashboard">
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
