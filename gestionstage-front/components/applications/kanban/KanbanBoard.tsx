'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import KanbanColumn from './KanbanColumn';
import { toast } from 'react-hot-toast';

interface Application {
  id: string;
  name: string;
  position: string;
  school: string;
  year: string;
  avatar?: string;
  timeAgo: string;
  hasInterview?: boolean;
  interviewTime?: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  applications: Application[];
}

const initialData: Column[] = [
  {
    id: 'new',
    title: 'Nouveau',
    color: 'primary-container',
    applications: [
      {
        id: '1',
        name: 'Léa Dubois',
        position: 'Stage Dev Fullstack',
        school: 'Epitech',
        year: '5ème année',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnqOM6UAa-8G-ckiq2dRsqyhGroH69rnMtClS7VbsLpkMrRnPyIKK9L3hkyVUW4gqN0srBCzLon4E8zpLDyMS41TMc8OMZ3kmgDr4eFOAL9vRKNRz2_SMIewLtRu-pEE5l_4WZ5fPfQwn--7Cae2U-lf_MXFCUyyqjIpEf0hgPjIYwf3H8LK6RKCpEXzJKC7j-1k2NQ9IO-GcqBdl5UFhCeJaAaXbIDHaiWpErAdrmmFZTLBu1wuAc_p-T3uHBiagUgTooU7kPDJM',
        timeAgo: 'Il y a 2h',
      },
      {
        id: '2',
        name: 'Marc Klein',
        position: 'UX/UI Design',
        school: 'Gobelins',
        year: 'Master 1',
        timeAgo: 'Hier',
      },
    ],
  },
  {
    id: 'progress',
    title: 'En cours',
    color: 'tertiary-container',
    applications: [
      {
        id: '3',
        name: 'Thomas Leroy',
        position: 'Data Analyst',
        school: 'Polytechnique',
        year: 'M2',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNXoADfLQ-GMe5nyNtvUPRJ7Sq7HO0Bd08Q6JkT7aDPG-QxBv6Svor6RzfFwhun7xYLH_YETHXGzyEog7m6o6XgsDk-8Vr_9NAjIMVu9u7Zz97v6yEKHhZ5fu1dwJkM0qbhgMAY4rg74bx8Ll-xNHjI57iBI6shYmGbAPYwxCOYcET8-N9idy_nS0ahKw9wV__qG0vHRJEkN5MyDB6nC2vF1jV3D9irlKkegkYSmtFd7kr5GkAaG8orGS6ch50YCbeULsM36oePfc',
        hasInterview: true,
        interviewTime: 'Entretien 14h',
        timeAgo: '',
      },
    ],
  },
  {
    id: 'accepted',
    title: 'Accepté',
    color: 'secondary',
    applications: [],
  },
  {
    id: 'rejected',
    title: 'Refusé',
    color: 'error',
    applications: [
      {
        id: '4',
        name: 'Sophie Petit',
        position: 'Stage Dev Fullstack',
        school: 'Non retenue',
        year: '',
        timeAgo: '',
      },
    ],
  },
];

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialData);
  const [draggedItem, setDraggedItem] = useState<{
    columnId: string;
    applicationId: string;
  } | null>(null);

  const handleDragStart = (columnId: string, applicationId: string) => {
    setDraggedItem({ columnId, applicationId });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedItem) return;

    const sourceColumn = columns.find((col) => col.id === draggedItem.columnId);
    const targetColumn = columns.find((col) => col.id === targetColumnId);

    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) {
      setDraggedItem(null);
      return;
    }

    const application = sourceColumn.applications.find(
      (app) => app.id === draggedItem.applicationId
    );

    if (!application) {
      setDraggedItem(null);
      return;
    }

    // Remove from source
    const newSourceApplications = sourceColumn.applications.filter(
      (app) => app.id !== draggedItem.applicationId
    );

    // Add to target
    const newTargetApplications = [...targetColumn.applications, application];

    // Update state
    setColumns((prevColumns) =>
      prevColumns.map((col) => {
        if (col.id === sourceColumn.id) {
          return { ...col, applications: newSourceApplications };
        }
        if (col.id === targetColumn.id) {
          return { ...col, applications: newTargetApplications };
        }
        return col;
      })
    );

    toast.success(`Candidature déplacée vers "${targetColumn.title}"`, {
      duration: 2000,
    });

    setDraggedItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex gap-5 overflow-x-auto pb-8 snap-x snap-mandatory"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      {columns.map((column, index) => (
        <KanbanColumn
          key={column.id}
          column={column}
          index={index}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          isDragging={draggedItem?.columnId === column.id}
        />
      ))}
    </motion.div>
  );
}
