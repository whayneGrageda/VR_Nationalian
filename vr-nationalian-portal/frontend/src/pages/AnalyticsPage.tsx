import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { TrendingUp, Users, BookOpen, Award, Clock } from 'lucide-react';
import { SkeletonStats } from '../components/Skeleton';
import './Dashboard.css';

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

interface TopStudent {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  totalPlaytime: number;
  chaptersCompleted: number;
}

interface RecentActivity {
  userId: string;
  username: string;
  activityType: 'chapter' | 'achievement';
  itemName: string;
  completedAt: string;
}

interface AdminAnalytics {
  totalStudents: number;
  totalChapters: number;
  totalAchievements: number;
  overallCompletionRate: number;
  averagePlaytime: number;
  chapterCompletionRates: ChapterCompletionRate[];
  achievementUnlockRates: AchievementUnlockRate[];
  topStudents: TopStudent[];
  recentActivity: RecentActivity[];
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/admin');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalytics(data);
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
          <h1 className="dashboard-title">Analytics</h1>
          <p className="dashboard-subtitle">System-wide Performance Metrics</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <SkeletonStats count={5} />
        ) : analytics && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><Users size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Students</div>
                  <div className="stat-value">{analytics.totalStudents}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-green"><BookOpen size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Chapters</div>
                  <div className="stat-value">{analytics.totalChapters}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-purple"><Award size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Achievements</div>
                  <div className="stat-value">{analytics.totalAchievements}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-orange"><TrendingUp size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Completion Rate</div>
                  <div className="stat-value">{analytics.overallCompletionRate.toFixed(1)}%</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><Clock size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Avg Playtime</div>
                  <div className="stat-value">{formatPlaytime(Math.round(analytics.averagePlaytime))}</div>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="content-card">
                <h2 className="card-title">Top Students</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Playtime</th>
                        <th>Chapters</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topStudents.map((student) => (
                        <tr key={student.userId}>
                          <td>{student.username}</td>
                          <td>{student.firstName} {student.lastName}</td>
                          <td>{formatPlaytime(student.totalPlaytime)}</td>
                          <td>{student.chaptersCompleted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="content-card">
                <h2 className="card-title">Recent Activity</h2>
                <div className="activity-list">
                  {analytics.recentActivity.map((activity, index) => (
                    <div key={index} className="activity-item">
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
                  ))}
                </div>
              </div>
            </div>

            <div className="content-card">
              <h2 className="card-title">Chapter Completion Rates</h2>
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
            </div>

            <div className="content-card">
              <h2 className="card-title">Achievement Unlock Rates</h2>
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
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
