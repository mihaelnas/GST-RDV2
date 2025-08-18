
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { CreditCard, CheckCircle, ArrowLeft, DollarSign, BadgeCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { listAppointments, updateAppointmentStatus, type AppointmentDetails } from '@/ai/flows/appointmentManagementFlow';

export default function BillingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBillingAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const allAppointments = await listAppointments();
      setAppointments(allAppointments.filter(app => ['Confirmé', 'Payée'].includes(app.status)));
    } catch (error) {
      console.error("Failed to fetch appointments for billing:", error);
      toast({ title: "Erreur", description: "Impossible de charger les données de facturation.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBillingAppointments();
  }, [fetchBillingAppointments]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleMarkAsPaid = async (appointmentId: string, patientName: string) => {
    try {
      const success = await updateAppointmentStatus(appointmentId, 'Payée');
      if (success) {
        toast({
          title: "Paiement enregistré",
          description: `La facture pour ${patientName} a été marquée comme payée.`,
          className: "bg-accent text-accent-foreground",
        });
        fetchBillingAppointments(); // Refresh the list
      } else {
        throw new Error("Update failed silently");
      }
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      toast({ title: "Erreur", description: "Impossible d'enregistrer le paiement.", variant: "destructive" });
    }
  };

  const pendingInvoices = appointments.filter(app => app.status === 'Confirmé');
  const paidInvoices = appointments.filter(app => app.status === 'Payée');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-headline font-bold text-primary flex items-center">
            <CreditCard className="mr-3 h-8 w-8" /> Facturation et Paiements
          </h2>
          <p className="text-muted-foreground">Gérez les factures des consultations et enregistrez les paiements.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground text-lg">Chargement de la facturation...</p>
          </div>
        ) : (
          <>
            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-destructive" />Factures en attente de paiement</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingInvoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Date Consultation</TableHead>
                        <TableHead>Montant (€)</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingInvoices.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.patientName}</TableCell>
                          <TableCell>{app.doctorName}</TableCell>
                          <TableCell>{format(parseISO(app.dateTime), "d MMM yyyy 'à' HH:mm", { locale: fr })}</TableCell>
                          <TableCell>{(app.durationMinutes * 2.5).toFixed(2)}</TableCell> {/* Example pricing */}
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => handleMarkAsPaid(app.id, app.patientName)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                              <CheckCircle className="mr-2 h-4 w-4" /> Marquer comme Payée
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-6">Aucune facture en attente de paiement.</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center"><BadgeCheck className="mr-2 h-5 w-5 text-green-500" />Factures Payées</CardTitle>
              </CardHeader>
              <CardContent>
                {paidInvoices.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Médecin</TableHead>
                        <TableHead>Date Paiement</TableHead>
                        <TableHead>Montant (€)</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidInvoices.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell>{app.patientName}</TableCell>
                          <TableCell>{app.doctorName}</TableCell>
                          <TableCell>{format(parseISO(app.dateTime), "d MMM yyyy", { locale: fr })}</TableCell>
                          <TableCell>{(app.durationMinutes * 2.5).toFixed(2)}</TableCell> {/* Example pricing */}
                          <TableCell>
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                                <BadgeCheck className="mr-1 h-4 w-4" />Payée
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-6">Aucune facture payée pour le moment.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

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
    </div>
  );
}
