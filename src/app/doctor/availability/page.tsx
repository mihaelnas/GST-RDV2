
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarPlus, ArrowLeft, Trash2, Clock, CheckCircle } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const availabilitySchema = z.object({
  date: z.string().min(1, { message: "La date est requise."}),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format HH:MM requis."}),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format HH:MM requis."}),
});

type AvailabilityFormValues = z.infer<typeof availabilitySchema>;

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

const initialAvailabilities: AvailabilitySlot[] = [
  { id: 'avail1', date: '2024-08-05', startTime: '09:00', endTime: '12:00' },
  { id: 'avail2', date: '2024-08-05', startTime: '14:00', endTime: '17:00' },
  { id: 'avail3', date: '2024-08-06', startTime: '10:00', endTime: '13:00' },
];


export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [availabilities, setAvailabilities] = useState<AvailabilitySlot[]>(initialAvailabilities);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AvailabilityFormValues>({
    resolver: zodResolver(availabilitySchema),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<AvailabilityFormValues> = (data) => {
    const newAvailability: AvailabilitySlot = {
      id: `avail${Date.now()}`, // Simple ID generation
      ...data
    };
    setAvailabilities(prev => [...prev, newAvailability].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime)));
    toast({
      title: "Disponibilité Ajoutée",
      description: `Nouveau créneau de ${data.startTime} à ${data.endTime} le ${format(parseISO(data.date), "d MMM yyyy", { locale: fr })} ajouté.`,
      className: "bg-accent text-accent-foreground",
    });
    reset();
  };

  const handleDeleteAvailability = (id: string) => {
    const slotToDelete = availabilities.find(a => a.id === id);
    if (confirm(`Êtes-vous sûr de vouloir supprimer la disponibilité du ${slotToDelete ? format(parseISO(slotToDelete.date), "d MMM yyyy", { locale: fr }) + ' de ' + slotToDelete.startTime + ' à ' + slotToDelete.endTime : 'ce créneau'} ?`)) {
      setAvailabilities(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Disponibilité Supprimée",
        description: "Le créneau de disponibilité a été supprimé.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <CalendarPlus className="mr-3 h-8 w-8" /> Gérer mes Disponibilités
          </h2>
          <p className="text-muted-foreground">Ajoutez ou supprimez vos créneaux de consultation.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Ajouter une nouvelle disponibilité</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" {...register("date")} />
                    {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
                </div>
                <div>
                    <Label htmlFor="startTime">Heure de début (HH:MM)</Label>
                    <Input id="startTime" type="time" {...register("startTime")} />
                    {errors.startTime && <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>}
                </div>
                <div>
                    <Label htmlFor="endTime">Heure de fin (HH:MM)</Label>
                    <Input id="endTime" type="time" {...register("endTime")} />
                    {errors.endTime && <p className="text-sm text-destructive mt-1">{errors.endTime.message}</p>}
                </div>
                <Button type="submit" className="w-full">
                    <CheckCircle className="mr-2 h-5 w-5" /> Ajouter la disponibilité
                </Button>
                </form>
            </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Mes Disponibilités Actuelles</CardTitle>
                    <CardDescription>Vos créneaux enregistrés.</CardDescription>
                </CardHeader>
                <CardContent>
                    {availabilities.length > 0 ? (
                        <ul className="space-y-3 max-h-96 overflow-y-auto">
                        {availabilities.map(avail => (
                            <li key={avail.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                            <div>
                                <p className="font-semibold">{format(parseISO(avail.date), "eeee d MMMM yyyy", { locale: fr })}</p>
                                <p className="text-sm text-muted-foreground flex items-center">
                                    <Clock className="mr-1 h-4 w-4" /> {avail.startTime} - {avail.endTime}
                                </p>
                            </div>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteAvailability(avail.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Aucune disponibilité enregistrée.</p>
                    )}
                </CardContent>
            </Card>
        </div>
        
        <CardFooter className="mt-8 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/doctor/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Tableau de Bord
            </Link>
          </Button>
        </CardFooter>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
