import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirige automatiquement l'utilisateur vers le dashboard
  redirect('/dashboard');
}