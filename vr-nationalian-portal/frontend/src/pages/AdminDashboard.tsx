import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { GraduationCap, BookOpen, Users, Clock, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { SkeletonStats, SkeletonCard, SkeletonTable } from '../components/Skeleton';
import './Dashboard.css';

interface DashboardStats {
  totalProfessors: number;
  totalSections: number;
  totalStudents: number;
  activeSessions: number;
}

interface AdminOverview {
  insights: {
    avgStudentsPerSection: number;
    mostActiveSection: {
      name: string;
      studentCount: number;
    } | null;
    loginsToday: number;
    chaptersCompletedThisWeek: number;
  };
}

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    api: {
      status: string;
      uptime: number;
    };
    database: {
      status: string;
      responseTime: string;
    };
    vrSessions: {
      status: string;
      active: number;
    };
  };
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

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProfessors: 0,
    totalSections: 0,
    totalStudents: 0,
    activeSessions: 0
  });
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, overviewRes, healthRes, analyticsRes] = await Promise.all([
        fetch('/api/stats/dashboard'),
        fetch('/api/stats/admin/overview'),
        fetch('/api/health'),
        fetch('/api/analytics/admin')
      ]);

      if (!statsRes.ok || !overviewRes.ok) throw new Error('Failed to fetch data');

      const statsData = await statsRes.json();
      const overviewData = await overviewRes.json();
      const healthData = healthRes.ok ? await healthRes.json() : null;
      const analyticsData = analyticsRes.ok ? await analyticsRes.json() : null;

      setStats(statsData);
      setOverview(overviewData);
      setHealth(healthData);
      setAnalytics(analyticsData);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      if (response.ok) {
        const data = await response.json();
        setHealth(data);
      }
    } catch (err) {
      console.error('Health check failed:', err);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
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
          <p className="dashboard-subtitle">System Administration</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <>
            <SkeletonStats count={5} />
            
            <div className="content-grid">
              <SkeletonCard />
              <SkeletonCard />
            </div>

            <div className="content-card">
              <div className="skeleton skeleton-title" style={{ marginBottom: '1rem' }} />
              <SkeletonTable rows={10} />
            </div>

            <div className="content-grid">
              <SkeletonCard />
              <SkeletonCard />
            </div>

            <div className="content-card">
              <div className="skeleton skeleton-title" style={{ marginBottom: '1rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '80px' }} />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><GraduationCap size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Total Professors</div>
                  <div className="stat-value">{stats.totalProfessors}</div>
                </div>
              </div>
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
                {overview ? (
                  <div className="insights-grid">
                    <div className="insight-item">
                      <div className="insight-icon"><Users size={24} /></div>
                      <div className="insight-content">
                        <div className="insight-value">{overview.insights.avgStudentsPerSection}</div>
                        <div className="insight-label">Avg Students/Section</div>
                      </div>
                    </div>
                    <div className="insight-item">
                      <div className="insight-icon"><Users size={24} /></div>
                      <div className="insight-content">
                        <div className="insight-value">{overview.insights.loginsToday}</div>
                        <div className="insight-label">Logins Today</div>
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
                        <div className="insight-value">
                          {overview.insights.mostActiveSection?.name || 'N/A'}
                        </div>
                        <div className="insight-label">
                          Most Active Section ({overview.insights.mostActiveSection?.studentCount || 0} students)
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="card-text">Loading insights...</p>
                )}
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
                          itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Completion Rate']}
                        />
                        <Bar dataKey="completionRate" radius={[4, 4, 0, 0]}>
                          {analytics.chapterCompletionRates.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.completionRate > 80 ? '#4ade80' : entry.completionRate > 50 ? '#60a5fa' : '#c084fc'} />
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
                            <Cell key={`cell-${index}`} fill={'url(#colorAchievement)'} />
                          ))}
                        </Bar>
                        <defs>
                          <linearGradient id="colorAchievement" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#c084fc" stopOpacity={1}/>
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

        <div className="content-card">
          <h2 className="card-title">System Status</h2>
          {health ? (
            <div className="system-status-grid">
              <div className="status-item">
                <div className={`status-indicator ${health.services.database.status === 'online' ? 'status-online' : 'status-offline'}`}></div>
                <div className="status-content">
                  <div className="status-label">Database</div>
                  <div className="status-value">
                    {health.services.database.status === 'online' ? 'Online' : 'Offline'}
                    {health.services.database.status === 'online' && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                        ({health.services.database.responseTime})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="status-item">
                <div className={`status-indicator ${health.services.api.status === 'online' ? 'status-online' : 'status-offline'}`}></div>
                <div className="status-content">
                  <div className="status-label">API Server</div>
                  <div className="status-value">
                    {health.services.api.status === 'online' ? 'Running' : 'Offline'}
                    {health.services.api.status === 'online' && (
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '0.5rem' }}>
                        (uptime: {formatUptime(health.services.api.uptime)})
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="status-item">
                <div className={`status-indicator ${health.services.vrSessions.status === 'online' ? 'status-online' : 'status-offline'}`}></div>
                <div className="status-content">
                  <div className="status-label">VR Sessions</div>
                  <div className="status-value">{health.services.vrSessions.active} Active</div>
                </div>
              </div>
              <div className="status-item">
                <div className="status-indicator status-online"></div>
                <div className="status-content">
                  <div className="status-label">Last Updated</div>
                  <div className="status-value">{formatTimeAgo(health.timestamp)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="system-status-grid">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="status-item">
                  <div className="skeleton" style={{ width: '12px', height: '12px', borderRadius: '50%' }} />
                  <div className="status-content" style={{ flex: 1 }}>
                    <div className="skeleton skeleton-text short" style={{ marginBottom: '0.5rem' }} />
                    <div className="skeleton skeleton-text medium" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
