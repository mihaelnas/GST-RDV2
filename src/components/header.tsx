
"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Stethoscope, LogIn, UserPlus, LogOut } from 'lucide-react';

interface HeaderProps {
  isLoggedIn: boolean;
  onLogout: () => void;
}

export default function Header({ isLoggedIn, onLogout }: HeaderProps) {
  return (
    <header className="py-6 px-4 sm:px-6 lg:px-8 bg-card shadow-md mb-8">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-primary hover:text-primary/90 transition-colors">
          <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10" />
          <h1 className="text-2xl sm:text-3xl font-headline font-bold drop-shadow-sm">
            Clinique Rendez-Vous
          </h1>
        </Link>
        <nav>
          {isLoggedIn ? (
            <Button variant="ghost" onClick={onLogout}>
              <LogOut className="mr-2 h-5 w-5" />
              Déconnexion
            </Button>
          ) : (
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="outline" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-5 w-5" />
                  Connexion
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Inscription
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
