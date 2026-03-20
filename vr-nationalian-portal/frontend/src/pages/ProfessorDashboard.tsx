import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { BookOpen, Users, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { SkeletonStats, SkeletonCard } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

interface DashboardStats {
  totalSections: number;
  totalStudents: number;
  activeStudents: number;
}

interface ChapterCompletionRate {
  chapterId: number;
  chapterName: string;
  completionCount: number;
  completionRate: number;
}

interface AchievementUnlockRate {
  achievementId: string;
  achievementName: string;
  unlockCount: number;
  unlockRate: number;
}

interface RecentActivity {
  userId: string;
  username: string;
  activityType: 'chapter' | 'achievement';
  itemName: string;
  completedAt: string;
}

interface ProfessorAnalytics {
  totalStudents: number;
  totalChapters: number;
  totalAchievements: number;
  overallCompletionRate: number;
  averagePlaytime: number;
  chapterCompletionRates: ChapterCompletionRate[];
  achievementUnlockRates: AchievementUnlockRate[];
  recentActivity: RecentActivity[];
}

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSections: 0,
    totalStudents: 0,
    activeStudents: 0
  });
  const [analytics, setAnalytics] = useState<ProfessorAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch(`/api/stats/professor/${user?.userId}`),
        fetch(`/api/analytics/professor/${user?.userId}`)
      ]);

      if (!statsRes.ok) throw new Error('Failed to fetch stats');

      const statsData = await statsRes.json();
      const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          <>
            <SkeletonStats count={7} />
            <div className="content-card">
              <div className="skeleton skeleton-title" style={{ marginBottom: '1rem' }} />
              <div style={{ height: '200px' }} className="skeleton" />
            </div>
            <div className="content-grid">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </>
        ) : (
          <>
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
                  <div className="stat-value">{analytics?.totalStudents || stats.totalStudents}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><CheckCircle size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Active Students</div>
                  <div className="stat-value">{stats.activeStudents}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-orange"><BookOpen size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Chapters</div>
                  <div className="stat-value">{analytics?.totalChapters || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple"><Award size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Achievements</div>
                  <div className="stat-value">{analytics?.totalAchievements || 0}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><TrendingUp size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Completion Rate</div>
                  <div className="stat-value">{analytics?.overallCompletionRate.toFixed(1) || 0}%</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-orange"><Clock size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Avg Playtime</div>
                  <div className="stat-value">{analytics ? formatPlaytime(Math.round(analytics.averagePlaytime)) : '0h 0m'}</div>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h2 className="card-title">Recent Activity</h2>
              {analytics && analytics.recentActivity.length > 0 ? (
                <div className="activity-list">
                  {analytics.recentActivity.map((activity, index) => {
                    const isMasterOfRealm = activity.activityType === 'achievement' && 
                      activity.itemName.toLowerCase().includes('master of the realm');
                    
                    return (
                      <div key={index} className={`activity-item ${isMasterOfRealm ? 'activity-special' : ''}`}>
                        <div className="activity-icon">
                          {activity.activityType === 'chapter' ? <BookOpen size={16} /> : <Award size={16} />}
                        </div>
                        <div className="activity-content">
                          <div className="activity-text">
                            <strong>{activity.username}</strong> {activity.activityType === 'chapter' ? 'completed' : 'unlocked'} {activity.itemName}
                          </div>
                          <div className="activity-time">{new Date(activity.completedAt).toLocaleString()}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="card-text">No recent activity</p>
              )}
            </div>

            <div className="content-grid">
              <div className="content-card">
                <h2 className="card-title">Chapter Completion Rates</h2>
                {analytics && analytics.chapterCompletionRates.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Chapter</th>
                          <th>Completions</th>
                          <th>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.chapterCompletionRates.map((chapter) => (
                          <tr key={chapter.chapterId}>
                            <td>{chapter.chapterName}</td>
                            <td>{chapter.completionCount}</td>
                            <td>{chapter.completionRate.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="card-text">No chapter data available</p>
                )}
              </div>

              <div className="content-card">
                <h2 className="card-title">Achievement Unlock Rates</h2>
                {analytics && analytics.achievementUnlockRates.length > 0 ? (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Achievement</th>
                          <th>Unlocks</th>
                          <th>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.achievementUnlockRates.map((achievement) => (
                          <tr key={achievement.achievementId}>
                            <td>{achievement.achievementName}</td>
                            <td>{achievement.unlockCount}</td>
                            <td>{achievement.unlockRate.toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="card-text">No achievement data available</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
