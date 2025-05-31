
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import { FileText, ArrowLeft, CheckCircle, ListOrdered } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


const prescriptionSchema = z.object({
  patientId: z.string().min(1, { message: "Veuillez sélectionner un patient." }),
  medication: z.string().min(3, { message: "Le nom du médicament est requis." }),
  dosage: z.string().min(1, { message: "La posologie est requise." }),
  instructions: z.string().optional(),
});

type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;

// Simulated data
const doctorPatients = [
  { id: 'patDoc1', name: 'Laura Durand' },
  { id: 'patDoc2', name: 'Sophie Petit' },
  { id: 'patDoc3', name: 'Jean Dupont' },
];

interface Prescription {
  id: string;
  date: Date;
  patientName: string;
  medication: string;
  dosage: string;
  instructions?: string;
}

const initialPrescriptions: Prescription[] = [
    { id: 'presc1', date: new Date(2024,6,28), patientName: 'Laura Durand', medication: 'Amlodipine 5mg', dosage: '1 comprimé par jour', instructions: 'Pendant le repas du matin.'},
    { id: 'presc2', date: new Date(2024,6,29), patientName: 'Sophie Petit', medication: 'Crème Tretinoine 0.025%', dosage: 'Application locale le soir', instructions: 'Éviter l\'exposition au soleil.'},
];

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionSchema),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onSubmit: SubmitHandler<PrescriptionFormValues> = (data) => {
    const patient = doctorPatients.find(p => p.id === data.patientId);
    const newPrescription: Prescription = {
        id: `presc${Date.now()}`,
        date: new Date(),
        patientName: patient?.name || 'Inconnu',
        ...data
    };
    setPrescriptions(prev => [newPrescription, ...prev].sort((a,b) => b.date.getTime() - a.date.getTime()));
    toast({
      title: "Prescription Créée",
      description: `Nouvelle prescription pour ${patient?.name} ajoutée.`,
      className: "bg-accent text-accent-foreground",
    });
    reset({ patientId: '', medication: '', dosage: '', instructions: '' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <FileText className="mr-3 h-8 w-8" /> Gestion des Prescriptions
          </h2>
          <p className="text-muted-foreground">Créez et consultez les prescriptions de vos patients.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle>Nouvelle Prescription</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="patientId">Patient</Label>
                        <Controller
                            name="patientId"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger id="patientId">
                                    <SelectValue placeholder="Sélectionner un patient" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctorPatients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                                </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.patientId && <p className="text-sm text-destructive mt-1">{errors.patientId.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="medication">Médicament</Label>
                        <Input id="medication" {...register("medication")} placeholder="Nom du médicament, dosage, forme..." />
                        {errors.medication && <p className="text-sm text-destructive mt-1">{errors.medication.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="dosage">Posologie</Label>
                        <Input id="dosage" {...register("dosage")} placeholder="Ex: 1 comprimé 3 fois par jour" />
                        {errors.dosage && <p className="text-sm text-destructive mt-1">{errors.dosage.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="instructions">Instructions supplémentaires (optionnel)</Label>
                        <Textarea id="instructions" {...register("instructions")} placeholder="Pendant les repas, le soir..." />
                    </div>
                    <Button type="submit" className="w-full">
                        <CheckCircle className="mr-2 h-5 w-5" /> Créer la Prescription
                    </Button>
                    </form>
                </CardContent>
            </Card>

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center"><ListOrdered className="mr-2 h-5 w-5"/>Historique des Prescriptions</CardTitle>
                    <CardDescription>Vos prescriptions récentes.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[500px] overflow-y-auto">
                    {prescriptions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Patient</TableHead>
                                    <TableHead>Médicament</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {prescriptions.map(presc => (
                                <TableRow key={presc.id}>
                                    <TableCell>{format(presc.date, "dd/MM/yy", {locale: fr})}</TableCell>
                                    <TableCell>{presc.patientName}</TableCell>
                                    <TableCell className="truncate max-w-xs">{presc.medication}</TableCell>
                                    {/* Add an eye icon to view details in a dialog if needed */}
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">Aucune prescription enregistrée.</p>
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
