
// This file is no longer needed as the add functionality is handled by a modal 
// in /src/app/clinic-staff/patients/page.tsx.
// You can safely delete this file.
// To ensure Next.js doesn't try to route here, we can make it return null or redirect.

"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddPatientPageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/clinic-staff/patients');
  }, [router]);
  return null; 
}
