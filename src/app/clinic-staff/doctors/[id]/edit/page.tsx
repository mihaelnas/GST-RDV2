
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter, useParams } from 'next/navigation'; // useParams pour récupérer l'ID
import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Edit, ArrowLeft, BriefcaseMedical } from 'lucide-react';

const doctorSchema = z.object({
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  specialty: z.string().min(3, { message: "La spécialité est requise (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  // Le mot de passe n'est généralement pas modifié ici, ou alors avec un champ optionnel "Nouveau mot de passe"
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

// Simulated doctor data for pre-filling the form
const doctorsData = [
  { id: 'doc1', name: 'Dr. Alice Martin', specialty: 'Cardiologie', email: 'alice.martin@example.com' },
  { id: 'doc2', name: 'Dr. Bernard Dubois', specialty: 'Pédiatrie', email: 'bernard.dubois@example.com' },
  { id: 'doc3', name: 'Dr. Chloé Lambert', specialty: 'Dermatologie', email: 'chloe.lambert@example.com' },
];

export default function EditDoctorPage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  const [doctor, setDoctor] = useState<DoctorFormValues | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
  });

  useEffect(() => {
    // Simulate fetching doctor data
    const foundDoctor = doctorsData.find(d => d.id === doctorId);
    if (foundDoctor) {
      setDoctor({ fullName: foundDoctor.name, specialty: foundDoctor.specialty, email: foundDoctor.email });
      reset({ fullName: foundDoctor.name, specialty: foundDoctor.specialty, email: foundDoctor.email });
    } else {
      // Handle case where doctor is not found (e.g., redirect or show error)
      alert("Médecin non trouvé.");
      router.push('/clinic-staff/doctors');
    }
  }, [doctorId, router, reset]);


  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<DoctorFormValues> = (data) => {
    console.log("Updated doctor data submitted:", data);
    alert(`Profil du Dr. ${data.fullName} mis à jour (simulation).`);
    // In a real app, you'd send this to your backend
    router.push('/clinic-staff/doctors');
  };

  if (!doctor) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center">
            <p>Chargement des informations du médecin...</p>
            <Button variant="link" asChild className="mt-4">
              <Link href="/clinic-staff/doctors">Retour à la liste</Link>
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
              <BriefcaseMedical className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-headline">Modifier le Profil Médecin</CardTitle>
            <CardDescription>Mettez à jour les informations du Dr. {doctor.fullName}.</CardDescription>
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
              {/* Option pour changer le mot de passe pourrait être ajoutée ici */}
              <Button type="submit" className="w-full">
                <Edit className="mr-2 h-5 w-5" /> Enregistrer les modifications
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
