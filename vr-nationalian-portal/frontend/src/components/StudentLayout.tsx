import { ReactNode } from 'react';
import StudentSidebar from './StudentSidebar';
import './Layout.css';

interface StudentLayoutProps {
  children: ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="layout">
      <StudentSidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
