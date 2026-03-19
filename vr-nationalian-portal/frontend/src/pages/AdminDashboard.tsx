import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { GraduationCap, BookOpen, Users, Gamepad2, Clock, TrendingUp, Plus, BarChart3, Database } from 'lucide-react';
import { SkeletonStats } from '../components/Skeleton';
import './Dashboard.css';

interface DashboardStats {
  totalProfessors: number;
  totalSections: number;
  totalStudents: number;
  activeSessions: number;
}

interface RecentActivity {
  type: string;
  username: string;
  firstName?: string;
  lastName?: string;
  description: string;
  timestamp: string;
}

interface AdminOverview {
  recentActivity: RecentActivity[];
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProfessors: 0,
    totalSections: 0,
    totalStudents: 0,
    activeSessions: 0
  });
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, overviewRes, healthRes] = await Promise.all([
        fetch('/api/stats/dashboard'),
        fetch('/api/stats/admin/overview'),
        fetch('/api/health')
      ]);

      if (!statsRes.ok || !overviewRes.ok) throw new Error('Failed to fetch data');

      const statsData = await statsRes.json();
      const overviewData = await overviewRes.json();
      const healthData = healthRes.ok ? await healthRes.json() : null;

      setStats(statsData);
      setOverview(overviewData);
      setHealth(healthData);
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

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">System Administration</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <SkeletonStats count={4} />
        ) : (
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
                <div className="stat-value">{stats.totalStudents}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon stat-icon-orange"><Gamepad2 size={32} /></div>
              <div className="stat-content">
                <div className="stat-label">Active Sessions</div>
                <div className="stat-value">{stats.activeSessions}</div>
              </div>
            </div>
          </div>
        )}

        <div className="content-grid">
          <div className="content-card">
            <h2 className="card-title">Recent Activity</h2>
            {overview && overview.recentActivity.length > 0 ? (
              <div className="activity-list">
                {overview.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      <BookOpen size={16} />
                    </div>
                    <div className="activity-content">
                      <div className="activity-text">
                        <strong>{activity.firstName || activity.username}</strong> {activity.description}
                      </div>
                      <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
                    </div>
                  </div>
                ))}
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
                  <div className="insight-icon"><Users size={20} /></div>
                  <div className="insight-content">
                    <div className="insight-value">{overview.insights.avgStudentsPerSection}</div>
                    <div className="insight-label">Avg Students/Section</div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon"><TrendingUp size={20} /></div>
                  <div className="insight-content">
                    <div className="insight-value">
                      {overview.insights.mostActiveSection?.name || 'N/A'}
                    </div>
                    <div className="insight-label">
                      Most Active Section ({overview.insights.mostActiveSection?.studentCount || 0} students)
                    </div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon"><Users size={20} /></div>
                  <div className="insight-content">
                    <div className="insight-value">{overview.insights.loginsToday}</div>
                    <div className="insight-label">Logins Today</div>
                  </div>
                </div>
                <div className="insight-item">
                  <div className="insight-icon"><BookOpen size={20} /></div>
                  <div className="insight-content">
                    <div className="insight-value">{overview.insights.chaptersCompletedThisWeek}</div>
                    <div className="insight-label">Chapters This Week</div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="card-text">Loading insights...</p>
            )}
          </div>
        </div>

        <div className="content-card">
          <h2 className="card-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="action-button" onClick={() => navigate('/admin/professors')}>
              <div className="action-icon"><Plus size={20} /></div>
              <div className="action-label">Add Professor</div>
            </button>
            <button className="action-button" onClick={() => navigate('/admin/sections')}>
              <div className="action-icon"><BookOpen size={20} /></div>
              <div className="action-label">Manage Sections</div>
            </button>
            <button className="action-button" onClick={() => navigate('/admin/students')}>
              <div className="action-icon"><Users size={20} /></div>
              <div className="action-label">View All Students</div>
            </button>
            <button className="action-button" onClick={() => navigate('/admin/analytics')}>
              <div className="action-icon"><BarChart3 size={20} /></div>
              <div className="action-label">View Analytics</div>
            </button>
          </div>
        </div>

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
            <p className="card-text">Loading system status...</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
