
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
import { UserPlus, Edit, Trash2, Search, ArrowLeft, BriefcaseMedical } from 'lucide-react';
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
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


const doctorSchema = z.object({
  id: z.string().optional(), // Optional for new, required for edit
  fullName: z.string().min(3, { message: "Le nom complet est requis (min 3 caractères)." }),
  specialty: z.string().min(3, { message: "La spécialité est requise (min 3 caractères)." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  // Password field only for add, not typically for edit on a list page by staff
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }).optional(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

interface Doctor extends DoctorFormValues {
  id: string; // Ensure ID is always present after creation
}

const initialDoctorsData: Doctor[] = [
  { id: 'doc1', fullName: 'Dr. Alice Martin', specialty: 'Cardiologie', email: 'alice.martin@example.com' },
  { id: 'doc2', fullName: 'Dr. Bernard Dubois', specialty: 'Pédiatrie', email: 'bernard.dubois@example.com' },
  { id: 'doc3', fullName: 'Dr. Chloé Lambert', specialty: 'Dermatologie', email: 'chloe.lambert@example.com' },
];

export default function DoctorsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctorsData);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [doctorToEdit, setDoctorToEdit] = useState<Doctor | null>(null);
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const filteredDoctors = useMemo(() => doctors.filter(doc => 
    doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [doctors, searchTerm]);

  const openAddModal = () => {
    reset({ fullName: '', specialty: '', email: '', password: '' }); // Clear form for add
    setIsAddModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    setDoctorToEdit(doctor);
    reset({ // Pre-fill form for edit
      id: doctor.id,
      fullName: doctor.fullName,
      specialty: doctor.specialty,
      email: doctor.email,
      password: '', // Password not edited here
    });
    setIsEditModalOpen(true);
  };
  
  const onAddSubmit: SubmitHandler<DoctorFormValues> = (data) => {
    const newDoctor: Doctor = {
      ...data,
      id: `doc${Date.now()}`, // Simple ID generation
    };
    setDoctors(prev => [...prev, newDoctor]);
    toast({ title: "Médecin Ajouté", description: `Le Dr. ${data.fullName} a été ajouté.`, className: "bg-accent text-accent-foreground"});
    setIsAddModalOpen(false);
  };

  const onEditSubmit: SubmitHandler<DoctorFormValues> = (data) => {
    if (!doctorToEdit) return;
    setDoctors(prev => prev.map(doc => doc.id === doctorToEdit.id ? { ...doc, ...data, id: doc.id } : doc));
    toast({ title: "Médecin Modifié", description: `Les informations du Dr. ${data.fullName} ont été mises à jour.`, className: "bg-accent text-accent-foreground"});
    setIsEditModalOpen(false);
    setDoctorToEdit(null);
  };
  
  const confirmDeleteDoctor = (doctor: Doctor) => {
    setDoctorToDelete(doctor);
  };

  const handleDeleteDoctor = () => {
    if (!doctorToDelete) return;
    setDoctors(prev => prev.filter(doc => doc.id !== doctorToDelete.id));
    toast({ title: "Médecin Supprimé", description: `Le Dr. ${doctorToDelete.fullName} a été supprimé.`, variant: "destructive"});
    setDoctorToDelete(null);
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
            {filteredDoctors.length > 0 ? (
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
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteDoctor(doctor)} title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucun médecin trouvé correspondant à votre recherche.</p>
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
                <Button type="button" variant="outline">Annuler</Button>
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
            {/* ID is hidden but needed for submission */}
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
            {/* Password is not edited in this modal by staff */}
            <DialogFooter>
               <DialogClose asChild>
                <Button type="button" variant="outline">Annuler</Button>
              </DialogClose>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!doctorToDelete} onOpenChange={() => setDoctorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le Dr. {doctorToDelete?.fullName} ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDoctorToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoctor} className="bg-destructive hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    