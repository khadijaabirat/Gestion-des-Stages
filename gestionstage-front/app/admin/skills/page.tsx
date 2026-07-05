import AdminSkillsContent from '@/components/admin/skills/AdminSkillsContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestion des Compétences - Admin NexusIntern',
  description: 'Gérez la bibliothèque globale des compétences (Hard & Soft Skills).',
};

export default function AdminSkillsPage() {
  return <AdminSkillsContent />;
}
