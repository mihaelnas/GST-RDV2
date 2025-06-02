
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { UserPlus, Edit, Trash2, Search, ArrowLeft, Users as UsersIcon, CalendarIcon, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { listPatients, addPatient, updatePatient, deletePatient } from '@/ai/flows/patientManagementFlow';
import type { Patient, PatientCreateInput, PatientUpdateInput } from '@/ai/flows/patientManagementFlow';

// Schema for form validation (client-side) - ensure dob is treated as Date for Calendar
const patientFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  dob: z.date({ required_error: "La date de naissance est requise." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }).optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;

export default function PatientsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDobPopoverOpen, setIsDobPopoverOpen] = useState(false);


  const { control, register, handleSubmit, formState: { errors }, reset, setValue, clearErrors } = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
  });

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const fetchedPatients = await listPatients();
      setPatients(fetchedPatients.map(p => ({...p, dob: new Date(p.dob) }))); // Ensure dob is Date object
    } catch (error) {
      console.error("Failed to fetch patients:", error);
      toast({ title: "Erreur", description: "Impossible de charger la liste des patients.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredPatients = useMemo(() => patients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.fullName.localeCompare(b.fullName)), [patients, searchTerm]);

  const openAddModal = () => {
    reset({ fullName: '', email: '', dob: undefined, password: '' });
    clearErrors();
    setIsAddModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setPatientToEdit(patient);
    reset({
      id: patient.id,
      fullName: patient.fullName,
      email: patient.email,
      dob: patient.dob, // Already a Date object due to fetchPatients mapping
      password: '', 
    });
    clearErrors();
    setIsEditModalOpen(true);
  };

  const onAddSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    if (!data.password) {
      toast({ title: "Erreur de validation", description: "Le mot de passe est requis pour ajouter un patient.", variant: "destructive" });
      return;
    }
    const createInput: PatientCreateInput = {
      fullName: data.fullName,
      email: data.email,
      dob: data.dob,
      password: data.password,
    };
    try {
      await addPatient(createInput);
      toast({ title: "Patient Ajouté", description: `Le patient ${data.fullName} a été ajouté avec succès.`, className: "bg-accent text-accent-foreground" });
      setIsAddModalOpen(false);
      fetchPatients();
    } catch (error) {
      console.error("Failed to add patient:", error);
      toast({ title: "Erreur", description: "Impossible d'ajouter le patient.", variant: "destructive" });
    }
  };

  const onEditSubmit: SubmitHandler<PatientFormValues> = async (data) => {
    if (!patientToEdit || !patientToEdit.id) return;

    const updateData: PatientUpdateInput = {
      fullName: data.fullName,
      email: data.email,
      dob: data.dob,
    };

    try {
      await updatePatient(patientToEdit.id, updateData);
      toast({ title: "Patient Modifié", description: `Les informations de ${data.fullName} ont été mises à jour.`, className: "bg-accent text-accent-foreground" });
      setIsEditModalOpen(false);
      setPatientToEdit(null);
      fetchPatients();
    } catch (error) {
      console.error("Failed to update patient:", error);
      toast({ title: "Erreur", description: "Impossible de modifier le patient.", variant: "destructive" });
    }
  };

  const confirmDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const handleDeletePatient = async () => {
    if (!patientToDelete || !patientToDelete.id) return;
    try {
      const result = await deletePatient(patientToDelete.id);
      if (result.success) {
        toast({ title: "Patient Supprimé", description: `Le patient ${patientToDelete.fullName} a été supprimé.`, variant: "destructive" });
        fetchPatients();
      } else {
        toast({ title: "Erreur", description: result.message || "Impossible de supprimer le patient.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to delete patient:", error);
      toast({ title: "Erreur", description: "Une erreur s'est produite lors de la suppression.", variant: "destructive" });
    } finally {
      setPatientToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <UsersIcon className="mr-3 h-8 w-8" />Liste des Patients
          </h2>
          <Button onClick={openAddModal}>
            <UserPlus className="mr-2 h-5 w-5" /> Ajouter un Patient
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Rechercher et Gérer les Patients</CardTitle>
            <CardDescription>Visualisez, modifiez ou supprimez les dossiers des patients.</CardDescription>
            <div className="mt-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email..."
                className="max-w-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Chargement des patients...</p>
              </div>
            ) : filteredPatients.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Date de Naissance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.fullName}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>{format(patient.dob, 'dd/MM/yyyy', { locale: fr })}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(patient)} title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm" onClick={() => confirmDeletePatient(patient)} title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {patients.length === 0 ? "Aucun patient enregistré." : "Aucun patient trouvé correspondant à votre recherche."}
              </p>
            )}
          </CardContent>
        </Card>

        <CardFooter className="mt-8 border-t pt-6">
          <Button variant="outline" asChild>
            <Link href="/clinic-staff/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour au Tableau de Bord
            </Link>
          </Button>
        </CardFooter>
      </main>
      <footer className="py-8 text-center text-muted-foreground border-t mt-12">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>

      {/* Add/Edit Patient Modal Form */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={isAddModalOpen ? setIsAddModalOpen : setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center">
              {isEditModalOpen ? <Edit className="mr-2 h-6 w-6 text-primary"/> : <UserPlus className="mr-2 h-6 w-6 text-primary"/>}
              {isEditModalOpen ? 'Modifier le Patient' : 'Ajouter un Nouveau Patient'}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen ? `Mettez à jour les informations de ${patientToEdit?.fullName}.` : 'Remplissez les informations pour créer un compte patient.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(isEditModalOpen ? onEditSubmit : onAddSubmit)} className="space-y-4 py-4">
            <input type="hidden" {...register("id")} />
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" {...register("fullName")} placeholder="Nom Prénom" />
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
                  <Popover open={isDobPopoverOpen} onOpenChange={setIsDobPopoverOpen}>
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
                            if (date) field.onChange(date);
                            setIsDobPopoverOpen(false);
                        }}
                        defaultMonth={field.value}
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
            {!isEditModalOpen && (
              <div>
                <Label htmlFor="password">Mot de passe (provisoire)</Label>
                <Input id="password" type="password" {...register("password")} placeholder="********" />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false)}>Annuler</Button>
              </DialogClose>
              <Button type="submit">{isEditModalOpen ? 'Enregistrer' : 'Créer le compte'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!patientToDelete} onOpenChange={() => setPatientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le patient {patientToDelete?.fullName} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPatientToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePatient} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
