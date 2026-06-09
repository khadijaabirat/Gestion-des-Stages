import RegisterForm from '@/components/auth/RegisterForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inscription - NexusIntern',
  description: 'Propulsez votre avenir professionnel avec NexusIntern',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
