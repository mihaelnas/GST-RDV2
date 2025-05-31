
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, Save } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis." }),
  specialty: z.string().min(3, { message: "La spécialité est requise." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  // Add password change fields if needed, with more complex logic
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Simulate current doctor's data
const currentDoctorData = {
    fullName: 'Dr. Exemple Connecté',
    specialty: 'Médecine Générale',
    email: 'medecin.exemple@example.com',
};

export default function DoctorProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: currentDoctorData, // Pre-fill with current doctor's data
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<ProfileFormValues> = (data) => {
    console.log("Updated doctor profile data:", data);
    // In a real app, update backend. For now, simulate and show toast.
    toast({
      title: "Profil Mis à Jour",
      description: "Vos informations de profil ont été enregistrées avec succès.",
      className: "bg-accent text-accent-foreground",
    });
    // Optionally update currentDoctorData if we want to persist changes locally in this session
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
                <Input id="fullName" {...register("fullName")} />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
              </div>
              <div>
                <Label htmlFor="specialty">Spécialité</Label>
                <Input id="specialty" {...register("specialty")} />
                {errors.specialty && <p className="text-sm text-destructive mt-1">{errors.specialty.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>
              {/* Placeholder for password change fields
              <div className="border-t pt-6 mt-6">
                <h3 className="text-lg font-medium mb-2">Changer le mot de passe (optionnel)</h3>
                <div>
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input id="currentPassword" type="password" />
                </div>
                <div>
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input id="newPassword" type="password" />
                </div>
                <div>
                    <Label htmlFor="confirmNewPassword">Confirmer le nouveau mot de passe</Label>
                    <Input id="confirmNewPassword" type="password" />
                </div>
              </div>
              */}
              <Button type="submit" className="w-full">
                <Save className="mr-2 h-5 w-5" /> Enregistrer les modifications
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
