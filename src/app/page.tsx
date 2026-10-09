import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default function HomePage() {
  const cookieStore = cookies();
  const isAuthenticated = cookieStore.get('mock-auth')?.value === 'true';

  if (!isAuthenticated) {
    redirect('/sign/in');
  }

  redirect('/users');
}
