
"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stethoscope, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login data:", data);
    // Simulation de connexion réussie
    alert("Connexion simulée réussie ! Vous allez être redirigé.");
    router.push('/?loggedIn=true');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center justify-center gap-3 mb-8 text-primary hover:text-primary/90">
        <Stethoscope className="h-10 w-10" />
        <h1 className="text-4xl font-headline font-bold drop-shadow-sm">
          Clinique Rendez-Vous
        </h1>
      </Link>
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-7 w-7" />
            Connexion
          </CardTitle>
          <CardDescription>
            Connectez-vous en tant que patient, médecin ou personnel de la clinique.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="votreadresse@exemple.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                {/* <Link href="#" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link> */}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              Se connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Vous n&apos;avez pas de compte ?{' '}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              Inscrivez-vous
            </Link>
          </p>
        </CardFooter>
      </Card>
      <footer className="py-8 text-center text-muted-foreground mt-8">
        <p>&copy; {new Date().getFullYear()} Clinique Rendez-Vous. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
