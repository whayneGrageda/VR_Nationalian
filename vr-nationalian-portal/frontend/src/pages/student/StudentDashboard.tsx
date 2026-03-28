import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { Gamepad2, Star, Trophy, BarChart3, Clock, Award, CheckCircle, Circle, Target } from 'lucide-react';
import { SkeletonStats } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import '../Dashboard.css';

interface ChapterProgress {
  chapterId: number;
  chapterName: string;
  isCompleted: boolean;
  completedAt?: string;
  quizScore?: number;
  quizTotal?: number;
}

interface RecentActivity {
  type: 'chapter' | 'achievement' | 'quiz';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

interface SectionInfo {
  sectionId: string;
  sectionName: string;
  professorName: string;
  studentCount: number;
  userRank?: number;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievementName?: string;
  description?: string;
  iconKey?: string;
}

interface DashboardStats {
  chaptersCompleted: number;
  totalChapters: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  totalPlaytime: number;
  averageScore: number;
  recentActivities: RecentActivity[];
  sectionInfo?: SectionInfo;
  nextChapter?: {
    chapterId: number;
    chapterName: string;
  };
  recentAchievements: UserAchievement[];
  chapterProgress: ChapterProgress[];
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
    averageScore: 0,
    recentActivities: [],
    recentAchievements: [],
    chapterProgress: []
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

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return past.toLocaleDateString();
  };

  const getActivityIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Gamepad2': return <Gamepad2 size={18} />;
      case 'Trophy': return <Trophy size={18} />;
      case 'Award': return <Award size={18} />;
      default: return <Star size={18} />;
    }
  };

  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'chapter': return '#3b82f6';
      case 'achievement': return '#a855f7';
      case 'quiz': return '#22c55e';
      default: return '#64748b';
    }
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
          <>
            <SkeletonStats count={4} />
            
            {/* Skeleton for Recent Achievements and Chapter Progress */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
              <div className="content-card">
                <div className="skeleton skeleton-title" style={{ marginBottom: '16px', width: '200px' }} />
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                      <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ marginBottom: '8px' }} />
                        <div className="skeleton skeleton-text short" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="content-card">
                <div className="skeleton skeleton-title" style={{ marginBottom: '16px', width: '200px' }} />
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                      <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ marginBottom: '8px' }} />
                        <div className="skeleton skeleton-text short" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Skeleton for Recent Activity and Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
              <div className="content-card">
                <div className="skeleton skeleton-title" style={{ marginBottom: '16px', width: '150px' }} />
                <div style={{ display: 'grid', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
                      <div className="skeleton" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
                      <div style={{ flex: 1 }}>
                        <div className="skeleton skeleton-text" style={{ marginBottom: '8px' }} />
                        <div className="skeleton skeleton-text short" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="content-card">
                <div className="skeleton skeleton-title" style={{ marginBottom: '16px', width: '220px' }} />
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ padding: '16px' }}>
                      <div className="skeleton skeleton-text" style={{ marginBottom: '12px' }} />
                      <div className="skeleton" style={{ height: '8px', marginBottom: '10px', borderRadius: '4px' }} />
                      <div className="skeleton skeleton-text short" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon stat-icon-blue"><Gamepad2 size={32} /></div>
                <div className="stat-content">
                  <div className="stat-label">Chapters Completed</div>
                  <div className="stat-value">{stats.chaptersCompleted} / {stats.totalChapters}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon stat-icon-orange"><Clock size={32} /></div>
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
                  <div className="stat-label">Average Score</div>
                  <div className="stat-value">{stats.averageScore}%</div>
                </div>
              </div>
            </div>

            {/* Recent Achievements and Chapter Progress - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
              {/* Recent Achievements */}
              {stats.recentAchievements.length > 0 && (
                <div className="content-card">
                  <h2 className="card-title" style={{ marginBottom: '16px' }}>Recent Achievements</h2>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {stats.recentAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'linear-gradient(135deg, rgba(30,41,59,0.5), rgba(15,23,42,0.8))',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(168,85,247,0.3)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(168,85,247,0.05)',
                          cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 25px rgba(168,85,247,0.2), inset 0 0 15px rgba(168,85,247,0.2)';
                          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.6)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3), inset 0 0 10px rgba(168,85,247,0.05)';
                          e.currentTarget.style.borderColor = 'rgba(168,85,247,0.3)';
                        }}
                      >
                        <div style={{
                          background: 'rgba(168,85,247,0.15)',
                          padding: '10px',
                          borderRadius: '10px',
                          boxShadow: '0 0 10px rgba(168,85,247,0.3)',
                          border: '1px solid rgba(192,132,252,0.2)'
                        }}>
                          <Trophy size={20} style={{ color: '#c084fc', flexShrink: 0 }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#f8fafc', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 0 10px rgba(255,255,255,0.1)' }}>
                            {achievement.achievementName}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {getTimeAgo(achievement.unlockedAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapter Progress */}
              {stats.chapterProgress.length > 0 && (
                <div className="content-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <Target size={16} style={{ color: '#64748b' }} />
                    <h2 className="card-title" style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Chapter Progress</h2>
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {stats.chapterProgress.map((chapter) => (
                      <div
                        key={chapter.chapterId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px',
                          background: chapter.isCompleted ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(15,23,42,0.6))' : 'rgba(15,23,42,0.6)',
                          backdropFilter: 'blur(8px)',
                          border: chapter.isCompleted ? '1px solid rgba(74,222,128,0.3)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px',
                          transition: 'all 0.3s ease',
                          boxShadow: chapter.isCompleted ? '0 4px 15px rgba(34,197,94,0.05)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          if (!chapter.isCompleted) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                          } else {
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          if (!chapter.isCompleted) {
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                          } else {
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(34,197,94,0.05)';
                          }
                        }}
                      >
                        {chapter.isCompleted ? (
                          <div style={{ background: 'rgba(34,197,94,0.15)', padding: '6px', borderRadius: '50%', boxShadow: '0 0 10px rgba(34,197,94,0.3)' }}>
                            <CheckCircle size={18} style={{ color: '#4ade80', flexShrink: 0 }} />
                          </div>
                        ) : (
                          <Circle size={18} style={{ color: '#475569', flexShrink: 0 }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '15px', fontWeight: '500', color: chapter.isCompleted ? '#f8fafc' : '#cbd5e1', marginBottom: '2px' }}>
                            {chapter.chapterName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                            {chapter.isCompleted 
                              ? chapter.quizScore !== undefined 
                                ? `SCORE: ${chapter.quizScore}/${chapter.quizTotal} • ${chapter.completedAt ? getTimeAgo(chapter.completedAt) : 'FINISHED'}`
                                : chapter.completedAt ? getTimeAgo(chapter.completedAt) : 'FINISHED'
                              : 'LOCKED'}
                          </div>
                        </div>
                        {chapter.quizScore !== undefined && chapter.quizTotal && (
                          <div style={{ 
                            fontSize: '16px', 
                            fontWeight: '700', 
                            fontFamily: 'JetBrains Mono',
                            color: (chapter.quizScore / chapter.quizTotal) >= 0.8 ? '#4ade80' : (chapter.quizScore / chapter.quizTotal) >= 0.6 ? '#fb923c' : '#94a3b8',
                            flexShrink: 0,
                            textShadow: (chapter.quizScore / chapter.quizTotal) >= 0.8 ? '0 0 10px rgba(74,222,128,0.4)' : 'none'
                          }}>
                            {Math.round((chapter.quizScore / chapter.quizTotal) * 100)}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity and Analytics - Side by Side */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1rem' }}>
              {/* Recent Activity */}
              <div className="content-card">
                <h2 className="card-title" style={{ marginBottom: '16px' }}>Recent Activity</h2>
                {stats.recentActivities.length > 0 ? (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {stats.recentActivities.slice(0, 5).map((activity, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: '#0f172a',
                          border: '1px solid #1e293b',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ color: getActivityIconColor(activity.type), flexShrink: 0 }}>
                          {getActivityIcon(activity.icon)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activity.title}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {getTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    <Star size={48} style={{ margin: '0 auto 12px', opacity: 0.3, color: '#64748b' }} />
                    <p style={{ margin: 0, fontSize: '14px' }}>No activity yet</p>
                  </div>
                )}
              </div>

              {/* Comprehensive Analytics */}
              <div className="content-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <BarChart3 size={16} style={{ color: '#64748b' }} />
                  <h2 className="card-title" style={{ margin: 0, fontSize: '0.875rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Performance Analytics</h2>
                </div>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {/* Quiz Performance Breakdown */}
                  <div style={{ padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Quiz Mastery</span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: stats.averageScore >= 80 ? '#22c55e' : stats.averageScore >= 60 ? '#f59e0b' : '#64748b' }}>
                        {stats.averageScore}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ 
                        width: `${stats.averageScore}%`, 
                        height: '100%', 
                        background: stats.averageScore >= 80 ? 'linear-gradient(90deg, #22c55e 0%, #4ade80 100%)' : stats.averageScore >= 60 ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(90deg, #64748b 0%, #94a3b8 100%)',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {stats.averageScore >= 90 ? '🌟 Outstanding performance!' : 
                       stats.averageScore >= 80 ? '✨ Excellent work!' : 
                       stats.averageScore >= 70 ? '👍 Good progress!' : 
                       stats.averageScore >= 60 ? '📈 Keep improving!' : 
                       stats.chaptersCompleted > 0 ? '💪 Practice makes perfect!' : 'Complete quizzes to see your score'}
                    </div>
                  </div>

                  {/* Course Completion */}
                  <div style={{ padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Course Completion</span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: '#3b82f6' }}>
                        {Math.round((stats.chaptersCompleted / stats.totalChapters) * 100)}%
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#1e293b', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ 
                        width: `${(stats.chaptersCompleted / stats.totalChapters) * 100}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                        transition: 'width 0.3s'
                      }} />
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {stats.chaptersCompleted === 0 ? 'Start your learning journey' :
                       stats.chaptersCompleted === stats.totalChapters ? '🎉 Course completed!' :
                       `${stats.totalChapters - stats.chaptersCompleted} chapter${stats.totalChapters - stats.chaptersCompleted > 1 ? 's' : ''} to go`}
                    </div>
                  </div>

                  {/* Learning Streak */}
                  <div style={{ padding: '16px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0' }}>Learning Streak</span>
                      <span style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                        {stats.chaptersCompleted} 🔥
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {stats.chaptersCompleted === 0 
                        ? 'Complete your first chapter to start your streak'
                        : stats.chaptersCompleted === stats.totalChapters
                        ? 'Maximum streak achieved! All chapters completed!'
                        : `Keep the momentum going! ${stats.totalChapters - stats.chaptersCompleted} more to go`
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Learning CTA */}
            {stats.chaptersCompleted === 0 && (
              <div className="content-card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <Gamepad2 size={48} style={{ margin: '0 auto 12px', color: '#60a5fa' }} />
                <h2 className="card-title">Ready to Start?</h2>
                <p className="card-text">Launch the VR Nationalian mobile app to begin your journey.</p>
              </div>
            )}
          </>
        )}
      </div>
    </StudentLayout>
  );
}
