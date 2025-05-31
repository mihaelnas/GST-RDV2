
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Header from '@/components/header';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, ArrowLeft, DollarSign, BadgeCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Invoice {
  id: string;
  patientName: string;
  doctorName: string;
  consultationDate: string;
  amount: number;
  status: 'En attente de paiement' | 'Payée';
}

const initialInvoicesData: Invoice[] = [
  { id: 'inv001', patientName: 'Laura Durand', doctorName: 'Dr. Alice Martin', consultationDate: '2024-07-28T09:30:00', amount: 75, status: 'En attente de paiement' },
  { id: 'inv002', patientName: 'Paul Lefevre', doctorName: 'Dr. Bernard Dubois', consultationDate: '2024-07-28T11:00:00', amount: 80, status: 'En attente de paiement' },
  { id: 'inv003', patientName: 'Sophie Petit', doctorName: 'Dr. Alice Martin', consultationDate: '2024-07-29T14:30:00', amount: 75, status: 'Payée' },
  { id: 'inv004', patientName: 'Marc Voisin', doctorName: 'Dr. Chloé Lambert', consultationDate: '2024-07-29T15:30:00', amount: 90, status: 'En attente de paiement' },
];

export default function BillingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume staff is logged in
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoicesData);

  const handleLogout = () => {
    setIsLoggedIn(false);
    router.push('/');
  };

  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status: 'Payée' } : inv
      )
    );
    const paidInvoice = invoices.find(inv => inv.id === invoiceId);
    toast({
      title: "Paiement enregistré",
      description: `La facture ${invoiceId} pour ${paidInvoice?.patientName} a été marquée comme payée.`,
      className: "bg-accent text-accent-foreground",
    });
  };

  const pendingInvoices = invoices.filter(inv => inv.status === 'En attente de paiement');
  const paidInvoices = invoices.filter(inv => inv.status === 'Payée');


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

        <Card className="shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-destructive" />Factures en attente de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Facture</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Date Consultation</TableHead>
                    <TableHead>Montant (€)</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.patientName}</TableCell>
                      <TableCell>{invoice.doctorName}</TableCell>
                      <TableCell>{format(new Date(invoice.consultationDate), "d MMM yyyy 'à' HH:mm", { locale: fr })}</TableCell>
                      <TableCell>{invoice.amount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleMarkAsPaid(invoice.id)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
                    <TableHead>ID Facture</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Médecin</TableHead>
                    <TableHead>Date Paiement</TableHead>
                    <TableHead>Montant (€)</TableHead>
                     <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paidInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.patientName}</TableCell>
                      <TableCell>{invoice.doctorName}</TableCell>
                      <TableCell>{format(new Date(invoice.consultationDate), "d MMM yyyy", { locale: fr })}</TableCell> {/* Simulating payment date as consultation date for now */}
                      <TableCell>{invoice.amount.toFixed(2)}</TableCell>
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
