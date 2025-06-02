
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CalendarPlus, ArrowLeft, Trash2, Clock, CheckCircle, ListChecks, CalendarOff, Save } from 'lucide-react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils'; // Added import

// Exporting for use in AppointmentScheduler's mock data
export interface DayOfWeek {
  dayName: string;
  isWorkingDay: boolean;
  startTime?: string;
  endTime?: string;
}

const dayOfWeekSchema = z.object({
  dayName: z.string(),
  isWorkingDay: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format HH:MM requis." }).optional().or(z.literal('')),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format HH:MM requis." }).optional().or(z.literal('')),
}).refine(data => {
  if (data.isWorkingDay) {
    if (!data.startTime || data.startTime.trim() === '') return false; // Start time required if working
    if (!data.endTime || data.endTime.trim() === '') return false; // End time required if working
    try {
      const start = parse(data.startTime, 'HH:mm', new Date());
      const end = parse(data.endTime, 'HH:mm', new Date());
      return start < end;
    } catch (e) {
      return false; 
    }
  }
  return true; 
}, {
  message: "Si le jour est travaillé, les heures de début et de fin sont requises et le début doit précéder la fin.",
  path: ["startTime"], 
});


const weeklyScheduleSchema = z.object({
  schedule: z.array(dayOfWeekSchema),
});

type WeeklyScheduleFormValues = z.infer<typeof weeklyScheduleSchema>;

const absenceSchema = z.object({
  date: z.string().min(1, { message: "La date est requise."}),
  isFullDay: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format HH:MM requis."}).optional().or(z.literal('')),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Format HH:MM requis."}).optional().or(z.literal('')),
  reason: z.string().optional(),
}).refine(data => {
  if (!data.isFullDay) {
    if (!data.startTime || !data.endTime) return false;
    try {
        const start = parse(data.startTime, 'HH:mm', new Date());
        const end = parse(data.endTime, 'HH:mm', new Date());
        return start < end;
    } catch (e) {
        return false;
    }
  }
  return true;
}, {
  message: "Pour une absence partielle, l'heure de début et de fin sont requises, et le début doit précéder la fin.",
  path: ["startTime"],
});

type AbsenceFormValues = z.infer<typeof absenceSchema>;

interface Absence extends AbsenceFormValues {
  id: string;
}

const daysOfWeekList = [
  { name: "Lundi", index: 1 },
  { name: "Mardi", index: 2 },
  { name: "Mercredi", index: 3 },
  { name: "Jeudi", index: 4 },
  { name: "Vendredi", index: 5 },
  { name: "Samedi", index: 6 },
  { name: "Dimanche", index: 0 },
];

const defaultDoctorWeeklySchedule: WeeklyScheduleFormValues = {
  schedule: daysOfWeekList.map(day => ({
    dayName: day.name,
    isWorkingDay: true, // All days are working by default
    startTime: "", // Times are empty by default, doctor needs to fill them
    endTime: "",
  })),
};


export default function DoctorAvailabilityPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  
  const [absences, setAbsences] = useState<Absence[]>([]);

  const { control: weeklyControl, register: weeklyRegister, handleSubmit: handleWeeklySubmit, formState: { errors: weeklyErrors }, reset: weeklyReset, watch: watchWeeklySchedule } = useForm<WeeklyScheduleFormValues>({
    resolver: zodResolver(weeklyScheduleSchema),
    defaultValues: defaultDoctorWeeklySchedule, 
  });
  const { fields: weeklyFields } = useFieldArray({
    control: weeklyControl,
    name: "schedule",
  });

  const { control: absenceControl, register: absenceRegister, handleSubmit: handleAbsenceSubmit, formState: { errors: absenceErrors }, reset: absenceReset, watch: watchAbsenceForm } = useForm<AbsenceFormValues>({
    resolver: zodResolver(absenceSchema),
    defaultValues: { isFullDay: true, date: '', startTime: '', endTime: '', reason: '' },
  });
  
  const absenceIsFullDay = watchAbsenceForm("isFullDay");

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const onWeeklySubmit: SubmitHandler<WeeklyScheduleFormValues> = (data) => {
    console.log("Weekly schedule saved (simulated):", data.schedule);
    toast({
      title: "Horaire Hebdomadaire Enregistré",
      description: "Votre horaire hebdomadaire récurrent a été mis à jour.",
      className: "bg-accent text-accent-foreground",
    });
  };

  const onAbsenceSubmit: SubmitHandler<AbsenceFormValues> = (data) => {
    const newAbsence: Absence = {
      id: `abs${Date.now()}`, 
      ...data
    };
    setAbsences(prev => [...prev, newAbsence].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    toast({
      title: "Absence Ajoutée",
      description: `Absence pour le ${format(parseISO(data.date), "d MMM yyyy", { locale: fr })} ajoutée.`,
      className: "bg-accent text-accent-foreground",
    });
    absenceReset({ date: '', isFullDay: true, startTime: '', endTime: '', reason: '' });
  };

  const handleDeleteAbsence = (id: string) => {
    const absenceToDelete = absences.find(a => a.id === id);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'absence du ${absenceToDelete ? format(parseISO(absenceToDelete.date), "d MMM yyyy", { locale: fr }) : 'cette absence'} ?`)) {
      setAbsences(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Absence Supprimée",
        description: "L'absence a été supprimée.",
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
            <CalendarPlus className="mr-3 h-8 w-8" /> Gérer mes Disponibilités et Absences
          </h2>
          <p className="text-muted-foreground">Définissez votre horaire hebdomadaire et gérez vos absences.</p>
        </div>

        <Card className="shadow-lg mb-8">
          <CardHeader>
              <CardTitle className="flex items-center"><ListChecks className="mr-2 h-6 w-6"/>Mon Horaire Hebdomadaire Récurrent</CardTitle>
              <CardDescription>
                Par défaut, tous les jours sont cochés comme potentiellement travaillés. 
                Veuillez spécifier vos heures (début et fin) pour chaque jour de travail effectif, ou décochez les jours non travaillés.
                Les heures doivent être au format HH:MM (ex: 09:00).
              </CardDescription>
          </CardHeader>
          <CardContent>
              <form onSubmit={handleWeeklySubmit(onWeeklySubmit)} className="space-y-6">
                  {weeklyFields.map((field, index) => {
                      const currentDayValues = watchWeeklySchedule(`schedule.${index}`);
                      const hasStartTimeError = !!weeklyErrors.schedule?.[index]?.startTime;
                      const hasEndTimeError = !!weeklyErrors.schedule?.[index]?.endTime;
                      const isMissingTimeIfWorking = currentDayValues.isWorkingDay && (!currentDayValues.startTime || !currentDayValues.endTime);
                      
                      return (
                        <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 p-3 border rounded-md bg-card hover:bg-muted/30 transition-colors">
                            <div className="md:col-span-1 flex items-center space-x-3">
                                <Controller
                                    name={`schedule.${index}.isWorkingDay`}
                                    control={weeklyControl}
                                    render={({ field: controllerField }) => (
                                        <Checkbox
                                            id={`schedule.${index}.isWorkingDay`}
                                            checked={controllerField.value}
                                            onCheckedChange={controllerField.onChange}
                                        />
                                    )}
                                />
                                <Label htmlFor={`schedule.${index}.isWorkingDay`} className="font-semibold text-lg">{field.dayName}</Label>
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor={`schedule.${index}.startTime`}>Heure de début</Label>
                                <Input 
                                    id={`schedule.${index}.startTime`}
                                    type="time" 
                                    {...weeklyRegister(`schedule.${index}.startTime`)} 
                                    disabled={!currentDayValues.isWorkingDay}
                                    className={cn(
                                      (hasStartTimeError || (isMissingTimeIfWorking && !hasEndTimeError)) ? "border-destructive" : ""
                                    )}
                                />
                                
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor={`schedule.${index}.endTime`}>Heure de fin</Label>
                                <Input 
                                    id={`schedule.${index}.endTime`}
                                    type="time" 
                                    {...weeklyRegister(`schedule.${index}.endTime`)} 
                                    disabled={!currentDayValues.isWorkingDay}
                                     className={cn(
                                      (hasEndTimeError || (isMissingTimeIfWorking && !hasStartTimeError)) ? "border-destructive" : ""
                                    )}
                                />
                            </div>
                             {weeklyErrors.schedule?.[index] && (
                                <p className="text-sm text-destructive md:col-span-4 text-center -mt-2">
                                    {weeklyErrors.schedule[index]?.startTime?.message || weeklyErrors.schedule[index]?.endTime?.message || (isMissingTimeIfWorking ? "Les heures de début et de fin sont requises si le jour est travaillé." : "")}
                                </p>
                             )}
                        </div>
                      );
                  })}
                   <Button type="submit" className="w-full mt-6">
                      <Save className="mr-2 h-5 w-5" /> Enregistrer l'Horaire Hebdomadaire
                  </Button>
              </form>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
              <CardTitle className="flex items-center"><CalendarOff className="mr-2 h-6 w-6"/>Gérer mes Absences</CardTitle>
              <CardDescription>Ajoutez ou supprimez vos jours d'absence. Ces jours annuleront votre disponibilité récurrente.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
            <div>
                <h3 className="text-lg font-semibold mb-3">Ajouter une absence</h3>
                <form onSubmit={handleAbsenceSubmit(onAbsenceSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="absenceDate">Date de l'absence</Label>
                        <Input id="absenceDate" type="date" {...absenceRegister("date")} 
                          min={format(new Date(), "yyyy-MM-dd")} 
                        />
                        {absenceErrors.date && <p className="text-sm text-destructive mt-1">{absenceErrors.date.message}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                         <Controller
                            name="isFullDay"
                            control={absenceControl}
                            render={({ field }) => (
                                <Checkbox
                                    id="isFullDay"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            )}
                        />
                        <Label htmlFor="isFullDay">Absence journée entière</Label>
                    </div>
                    {!absenceIsFullDay && (
                        <>
                            <div>
                                <Label htmlFor="absenceStartTime">Heure de début (si partielle)</Label>
                                <Input id="absenceStartTime" type="time" {...absenceRegister("startTime")} 
                                  className={absenceErrors.startTime ? "border-destructive" : ""}
                                />
                                {absenceErrors.startTime && <p className="text-sm text-destructive mt-1">{absenceErrors.startTime.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="absenceEndTime">Heure de fin (si partielle)</Label>
                                <Input id="absenceEndTime" type="time" {...absenceRegister("endTime")} 
                                  className={absenceErrors.endTime && !absenceErrors.startTime ? "border-destructive" : ""} 
                                />
                                 
                                {absenceErrors.startTime && absenceErrors.startTime.type === 'refinement' && !absenceErrors.endTime && (
                                     <p className="text-sm text-destructive mt-1">{absenceErrors.startTime.message}</p>
                                )}
                                {!absenceErrors.startTime && absenceErrors.endTime && <p className="text-sm text-destructive mt-1">{absenceErrors.endTime.message}</p>}
                            </div>
                        </>
                    )}
                    <div>
                        <Label htmlFor="absenceReason">Motif (optionnel)</Label>
                        <Textarea id="absenceReason" {...absenceRegister("reason")} placeholder="Ex: Conférence, Congés..."/>
                    </div>
                    <Button type="submit" className="w-full">
                        <CheckCircle className="mr-2 h-5 w-5" /> Ajouter l'absence
                    </Button>
                </form>
            </div>
            <div>
                <h3 className="text-lg font-semibold mb-3">Mes Absences Enregistrées</h3>
                {absences.length > 0 ? (
                    <ul className="space-y-3 max-h-96 overflow-y-auto p-1">
                    {absences.map(abs => (
                        <li key={abs.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md hover:bg-muted/70 transition-colors">
                        <div>
                            <p className="font-semibold">{format(parseISO(abs.date), "eeee d MMMM yyyy", { locale: fr })}</p>
                            <p className="text-sm text-muted-foreground flex items-center">
                                <Clock className="mr-1 h-4 w-4" /> 
                                {abs.isFullDay ? "Journée entière" : `${abs.startTime || 'N/A'} - ${abs.endTime || 'N/A'}`}
                            </p>
                            {abs.reason && <p className="text-xs text-muted-foreground">Motif: {abs.reason}</p>}
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAbsence(abs.id)} title="Supprimer l'absence" className="text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p className="text-muted-foreground text-center py-4">Aucune absence enregistrée.</p>
                )}
            </div>
          </CardContent>
        </Card>
        
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
