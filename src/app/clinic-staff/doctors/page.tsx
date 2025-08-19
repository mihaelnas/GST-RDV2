
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { UserPlus, Edit, Trash2, Search, ArrowLeft, BriefcaseMedical, Loader2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
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
  AlertDialogFooter as AlertDialogFooterComponent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { listDoctors, addDoctor, updateDoctor, deleteDoctor } from '@/ai/flows/doctorManagementFlow';
import type { Doctor, DoctorCreateInput, DoctorUpdateInput } from '@/ai/flows/doctorManagementFlow';


// Schema for form validation (client-side)
const doctorFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  specialty: z.string().min(3, { message: "La spécialité est requise (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }).optional(),
});

type DoctorFormValues = z.infer<typeof doctorFormSchema>;


export default function DoctorsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, clearErrors } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorFormSchema),
  });

  const fetchDoctors = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedDoctors = await listDoctors();
      setDoctors(fetchedDoctors);
    } catch (error) {
      console.error("Failed to fetch doctors:", error);
      toast({ title: "Erreur", description: "Impossible de charger la liste des médecins.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleLogout = () => {
    sessionStorage.removeItem('loggedInUser');
    setIsLoggedIn(false); 
    router.push('/');
  };

  const filteredDoctors = useMemo(() => doctors.filter(doc => 
    doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => a.fullName.localeCompare(b.fullName)), [doctors, searchTerm]);

  const openAddModal = () => {
    reset({ fullName: '', specialty: '', email: '', password: '' });
    clearErrors();
    setIsAddModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setDoctorToEdit(doctor);
    reset({ 
      id: doctor.id,
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      email: doctor.email,
      password: '', // Password not edited here, so clear it from form state
    });
    clearErrors();
    setIsEditModalOpen(true);
  };
  
  const onAddSubmit: SubmitHandler<DoctorFormValues> = async (data) => {
    if (!data.password) { // Ensure password is provided for add
      toast({ title: "Erreur de validation", description: "Le mot de passe est requis pour ajouter un médecin.", variant: "destructive"});
      return;
    }
    const createInput: DoctorCreateInput = {
      fullName: data.fullName,
      specialty: data.specialty,
      email: data.email,
      password: data.password,
    };
    try {
      await addDoctor(createInput);
      toast({ title: "Médecin Ajouté", description: `Le Dr. ${data.fullName} a été ajouté avec succès.`, className: "bg-accent text-accent-foreground"});
      setIsAddModalOpen(false);
      fetchDoctors(); // Refresh list
    } catch (error: any) {
      console.error("Failed to add doctor:", error);
      toast({ title: "Erreur", description: error.message || "Impossible d'ajouter le médecin.", variant: "destructive" });
    }
  };

  const onEditSubmit: SubmitHandler<DoctorFormValues> = async (data) => {
    if (!doctorToEdit || !doctorToEdit.id) return;
    
    const updateData: DoctorUpdateInput = {
        fullName: data.fullName,
        specialty: data.specialty,
        email: data.email,
    };

    try {
      await updateDoctor(doctorToEdit.id, updateData);
      toast({ title: "Médecin Modifié", description: `Les informations du Dr. ${data.fullName} ont été mises à jour.`, className: "bg-accent text-accent-foreground"});
      setIsEditModalOpen(false);
      setDoctorToEdit(null);
      fetchDoctors(); // Refresh list
    } catch (error: any) {
      console.error("Failed to update doctor:", error);
      toast({ title: "Erreur", description: error.message || "Impossible de modifier le médecin.", variant: "destructive" });
    }
  };
  
  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    try {
      const result = await deleteDoctor(doctorId);
      if (result.success) {
        toast({ title: "Médecin Supprimé", description: `Le Dr. ${doctorName} a été supprimé.`, variant: "destructive"});
        fetchDoctors(); // Refresh list
      } else {
        toast({ title: "Erreur", description: result.message || "Impossible de supprimer le médecin.", variant: "destructive"});
      }
    } catch (error: any) {
      console.error("Failed to delete doctor:", error);
      toast({ title: "Erreur", description: error.message || "Une erreur s'est produite lors de la suppression.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <BriefcaseMedical className="mr-3 h-8 w-8" />Liste des Médecins
          </h2>
          <Button onClick={openAddModal}>
            <UserPlus className="mr-2 h-5 w-5" /> Ajouter un Médecin
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Rechercher et Gérer les Médecins</CardTitle>
            <CardDescription>Visualisez, modifiez ou supprimez les profils des médecins.</CardDescription>
            <div className="mt-4 flex items-center">
              <Search className="mr-2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Rechercher par nom, spécialité, email..." 
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
                <p className="ml-2 text-muted-foreground">Chargement des médecins...</p>
              </div>
            ) : filteredDoctors.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Spécialité</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">{doctor.fullName}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(doctor)} title="Modifier">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" title="Supprimer">
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer le Dr. {doctor.fullName} ? Cette action est irréversible et dissociera tous ses rendez-vous passés.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooterComponent>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteDoctor(doctor.id, doctor.fullName)} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
                            </AlertDialogFooterComponent>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {doctors.length === 0 ? "Aucun médecin enregistré." : "Aucun médecin trouvé correspondant à votre recherche."}
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

      {/* Add Doctor Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center"><UserPlus className="mr-2 h-6 w-6 text-primary"/>Ajouter un Nouveau Médecin</DialogTitle>
            <DialogDescription>Remplissez les informations pour créer un compte médecin.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="addFullName">Nom complet</Label>
              <Input id="addFullName" {...register("fullName")} placeholder="Dr. Jean Dupont" />
              {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="addSpecialty">Spécialité</Label>
              <Input id="addSpecialty" {...register("specialty")} placeholder="Cardiologie" />
              {errors.specialty && <p className="text-sm text-destructive mt-1">{errors.specialty.message}</p>}
            </div>
            <div>
              <Label htmlFor="addEmail">Adresse e-mail</Label>
              <Input id="addEmail" type="email" {...register("email")} placeholder="medecin@example.com" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="addPassword">Mot de passe (provisoire)</Label>
              <Input id="addPassword" type="password" {...register("password")} placeholder="********" />
              {errors.password && <p className="text-sm text-destructive mt-1">{errors.password.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Annuler</Button>
              </DialogClose>
              <Button type="submit">Créer le compte</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline flex items-center"><Edit className="mr-2 h-6 w-6 text-primary"/>Modifier le Profil Médecin</DialogTitle>
            <DialogDescription>Mettez à jour les informations du Dr. {doctorToEdit?.fullName}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4 py-4">
            <input type="hidden" {...register("id")} />
            <div>
              <Label htmlFor="editFullName">Nom complet</Label>
              <Input id="editFullName" {...register("fullName")} />
              {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <Label htmlFor="editSpecialty">Spécialité</Label>
              <Input id="editSpecialty" {...register("specialty")} />
              {errors.specialty && <p className="text-sm text-destructive mt-1">{errors.specialty.message}</p>}
            </div>
            <div>
              <Label htmlFor="editEmail">Adresse e-mail</Label>
              <Input id="editEmail" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
              </DialogClose>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    