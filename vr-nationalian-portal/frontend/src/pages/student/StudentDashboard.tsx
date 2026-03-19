import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { Gamepad2, Star, Trophy, BarChart3 } from 'lucide-react';
import { SkeletonStats } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import '../Dashboard.css';

interface DashboardStats {
  chaptersCompleted: number;
  totalChapters: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  totalPlaytime: number;
  averageScore: number;
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    chaptersCompleted: 0,
    totalChapters: 0,
    achievementsUnlocked: 0,
    totalAchievements: 0,
    totalPlaytime: 0,
    averageScore: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/students/${user?.userId}/dashboard`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <StudentLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.firstName || 'Student'}!</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <SkeletonStats count={4} />
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon stat-icon-blue"><Gamepad2 size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Chapters Completed</div>
                <div className="stat-value">{stats.chaptersCompleted} / {stats.totalChapters}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-orange"><Star size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Total Playtime</div>
                <div className="stat-value">{formatPlaytime(stats.totalPlaytime)}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-purple"><Trophy size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Achievements</div>
                <div className="stat-value">{stats.achievementsUnlocked} / {stats.totalAchievements}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green"><BarChart3 size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Progress</div>
                <div className="stat-value">{stats.totalChapters > 0 ? Math.round((stats.chaptersCompleted / stats.totalChapters) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        )}

        <div className="content-card">
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-text">
            {stats.chaptersCompleted > 0 
              ? `You've completed ${stats.chaptersCompleted} chapter${stats.chaptersCompleted !== 1 ? 's' : ''}. Keep up the great work!`
              : 'No activity yet. Start playing to see your progress!'}
          </p>
        </div>

        <div className="content-card">
          <h2 className="card-title">Continue Learning</h2>
          <p className="card-text">Launch the VR Nationalian mobile app to continue your journey.</p>
        </div>
      </div>
    </StudentLayout>
  );
}
