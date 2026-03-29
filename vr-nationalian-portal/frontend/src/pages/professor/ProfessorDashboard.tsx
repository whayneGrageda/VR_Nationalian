import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { BookOpen, Users, CheckCircle, Clock, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { SkeletonStats, SkeletonCard } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import '../shared/Dashboard.css';

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
            <SkeletonStats count={5} />
            <div className="content-grid">
              <SkeletonCard />
              <SkeletonCard />
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
                  <div className="stat-label">Active Students (7 days)</div>
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
            </div>

            <div className="content-grid">
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

              <div className="content-card">
                <h2 className="card-title">Quick Insights</h2>
                <div className="insights-grid">
                  <div className="insight-item">
                    <div className="insight-icon"><BookOpen size={24} /></div>
                    <div className="insight-content">
                      <div className="insight-value">{stats.totalSections}</div>
                      <div className="insight-label">Total Sections</div>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon"><Users size={24} /></div>
                    <div className="insight-content">
                      <div className="insight-value">{stats.activeStudents}</div>
                      <div className="insight-label">Active Students (7 days)</div>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon"><Clock size={24} /></div>
                    <div className="insight-content">
                      <div className="insight-value">{analytics ? formatPlaytime(Math.round(analytics.averagePlaytime)) : '0h 0m'}</div>
                      <div className="insight-label">Avg Playtime</div>
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon"><TrendingUp size={24} /></div>
                    <div className="insight-content">
                      <div className="insight-value">{analytics?.overallCompletionRate.toFixed(1) || 0}%</div>
                      <div className="insight-label">Completion Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="content-grid">
              <div className="content-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 className="card-title" style={{ margin: 0 }}>Chapter Completion Rates</h2>
                  {analytics && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Overall:</span>
                      <span style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: '600' }}>
                        {analytics.overallCompletionRate.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
                {analytics && analytics.chapterCompletionRates.length > 0 ? (
                  <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                    <ResponsiveContainer>
                      <BarChart data={analytics.chapterCompletionRates} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis 
                          dataKey="chapterName" 
                          stroke="#94a3b8" 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }} 
                          tickLine={false} 
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                        />
                        <YAxis 
                          stroke="#94a3b8" 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value}%`} 
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                          itemStyle={{ color: '#fb923c', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Completion Rate']}
                        />
                        <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                          {analytics.chapterCompletionRates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.completionRate > 80 ? '#f59e0b' : entry.completionRate > 50 ? '#fb923c' : '#c084fc'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="card-text">No chapter data available</p>
                )}
              </div>

              <div className="content-card">
                <h2 className="card-title">Achievement Unlock Rates</h2>
                {analytics && analytics.achievementUnlockRates.length > 0 ? (
                  <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
                    <ResponsiveContainer>
                      <BarChart data={analytics.achievementUnlockRates} margin={{ top: 10, right: 30, left: 0, bottom: 20 }} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis 
                          type="number" 
                          stroke="#94a3b8" 
                          tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'JetBrains Mono' }} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(value) => `${value}%`} 
                        />
                        <YAxis 
                          type="category" 
                          dataKey="achievementName" 
                          stroke="#94a3b8" 
                          tick={{ fill: '#94a3b8', fontSize: 12, width: 120 }} 
                          tickLine={false} 
                          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} 
                          width={140}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc' }}
                          itemStyle={{ color: '#c084fc', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Unlock Rate']}
                        />
                        <Bar dataKey="unlockRate" radius={[0, 4, 4, 0]}>
                          {analytics.achievementUnlockRates.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={'url(#colorAchievementProf)'} />
                          ))}
                        </Bar>
                        <defs>
                          <linearGradient id="colorAchievementProf" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#c084fc" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#f472b6" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
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
