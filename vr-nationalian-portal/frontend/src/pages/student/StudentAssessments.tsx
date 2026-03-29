import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { Smartphone } from 'lucide-react';
import { SkeletonTable, SkeletonCard } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import '../shared/ManagementPage.css';
import './StudentPages.css';

interface Chapter {
  chapterId: number;
  chapterName: string;
  chapterOrder: number;
  description?: string;
}

interface CompletedChapter {
  id: string;
  chapterId: number;
  isCompleted: boolean;
  completedAt?: string;
}

interface ChapterWithStatus extends Chapter {
  status: 'Completed' | 'Not Started' | 'Locked';
  completedAt?: Date;
}

export default function StudentAssessments() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<ChapterWithStatus[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchChapters();
    }
  }, [user]);

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/students/${user?.userId}/chapters`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      
      const data = await response.json();
      const { chapters: allChapters, completed } = data;

      // Map chapters with completion status
      const chaptersWithStatus: ChapterWithStatus[] = allChapters.map((chapter: Chapter) => {
        const completedChapter = completed.find((c: CompletedChapter) => c.chapterId === chapter.chapterId);
        
        return {
          ...chapter,
          status: completedChapter?.isCompleted ? 'Completed' : 'Not Started',
          completedAt: completedChapter?.completedAt ? new Date(completedChapter.completedAt) : undefined
        };
      });

      setChapters(chaptersWithStatus);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-progress';
      case 'Not Started': return 'status-not-started';
      case 'Locked': return 'status-locked';
      default: return '';
    }
  };

  const completedCount = chapters.filter(c => c.status === 'Completed').length;
  const totalChapters = chapters.length;

  return (
    <StudentLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Assessment Results</h1>
            <p className="page-subtitle">View your performance and progress</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <>
            <SkeletonCard />
            <div className="table-container">
              <SkeletonTable rows={5} />
            </div>
          </>
        ) : (
          <>
            <div className="content-card" style={{ marginBottom: '1.5rem' }}>
              <h2 className="card-title">Overall Progress</h2>
              <div className="progress-stats">
                <div className="progress-item">
                  <span className="progress-label">Chapters Completed:</span>
                  <span className="progress-value">{completedCount} / {totalChapters}</span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Completion Rate:</span>
                  <span className="progress-value">
                    {totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0}%
                  </span>
                </div>
                <div className="progress-item">
                  <span className="progress-label">Status:</span>
                  <span className="progress-value">
                    {completedCount === totalChapters && totalChapters > 0 ? 'All Complete!' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Chapter</th>
                    <th>Description</th>
                    <th>Date Completed</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                        No chapters available
                      </td>
                    </tr>
                  ) : (
                    chapters.map((chapter) => (
                      <tr key={chapter.chapterId}>
                        <td className="font-medium">{chapter.chapterName}</td>
                        <td>
                          {chapter.description ? (
                            <span className="text-muted">{chapter.description}</span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          {chapter.completedAt ? (
                            new Date(chapter.completedAt).toLocaleDateString()
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(chapter.status)}`}>
                            {chapter.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="content-card" style={{ marginTop: '1.5rem' }}>
              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Smartphone size={20} /> Continue on Mobile
              </h2>
              <p className="card-text">
                Launch the VR Nationalian mobile app to complete chapters and take assessments. 
                Your results will automatically sync here.
              </p>
            </div>
          </>
        )}
      </div>
    </StudentLayout>
  );
}
