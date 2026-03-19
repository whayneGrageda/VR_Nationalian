import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { BookOpen, Users, CheckCircle } from 'lucide-react';
import { SkeletonStats } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

interface ProfessorStats {
  totalSections: number;
  totalStudents: number;
  activeStudents: number;
}

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfessorStats>({
    totalSections: 0,
    totalStudents: 0,
    activeStudents: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/stats/professor/${user?.userId}`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Professor Overview</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <SkeletonStats count={3} />
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-green"><BookOpen size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Total Sections</div>
                <div className="stat-value">{stats.totalSections}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple"><Users size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Total Students</div>
                <div className="stat-value">{stats.totalStudents}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue"><CheckCircle size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Active Students</div>
                <div className="stat-value">{stats.activeStudents}</div>
              </div>
            </div>
          </div>
        )}

        <div className="content-card">
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-text">
            {stats.activeStudents > 0 
              ? `${stats.activeStudents} student${stats.activeStudents !== 1 ? 's have' : ' has'} been active in the last 7 days.`
              : 'No recent student activity to display.'}
          </p>
        </div>
      </div>
    </Layout>
  );
}
