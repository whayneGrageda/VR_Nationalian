import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { TrendingUp, Users, Award, Clock, Target, AlertCircle, BarChart3, AlertTriangle, Timer, BookOpen, Zap, Star } from 'lucide-react';
import { AreaChart, Area, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { SkeletonStats, SkeletonCard } from '../../components/Skeleton';
import '../shared/Dashboard.css';
import './AnalyticsPage.css';

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

interface AdminAnalytics {
  totalStudents: number;
  totalChapters: number;
  totalAchievements: number;
  overallCompletionRate: number;
  averagePlaytime: number;
  chapterCompletionRates: ChapterCompletionRate[];
  achievementUnlockRates: AchievementUnlockRate[];
  topStudents: TopStudent[];
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

  // Generate mock weekly trend data based on current analytics
  const generateWeeklyTrend = () => {
    if (!analytics) return [];
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const currentRate = analytics.overallCompletionRate;
    return weeks.map((week, index) => ({
      week,
      rate: Math.max(0, currentRate - (4 - index - 1) * 5 + Math.random() * 3)
    }));
  };

  // Calculate chapter difficulty (drop-off rate)
  const calculateChapterDifficulty = () => {
    if (!analytics || analytics.chapterCompletionRates.length === 0) return [];
    const rates = analytics.chapterCompletionRates;
    return rates.map((chapter, index) => {
      const dropOff = index > 0 ? rates[index - 1].completionRate - chapter.completionRate : 0;
      return {
        ...chapter,
        dropOffRate: Math.max(0, dropOff),
        difficulty: dropOff > 15 ? 'Hard' : dropOff > 8 ? 'Medium' : 'Easy'
      };
    });
  };

  // Calculate engagement score
  const calculateEngagementScore = () => {
    if (!analytics) return 0;
    const completionScore = analytics.overallCompletionRate;
    const playtimeScore = Math.min(100, (analytics.averagePlaytime / 120) * 100);
    return Math.round((completionScore + playtimeScore) / 2);
  };

  // Find at-risk students (low engagement)
  const getAtRiskStudents = () => {
    if (!analytics) return [];
    return analytics.topStudents
      .filter(s => s.chaptersCompleted < 2 && s.totalPlaytime < 30)
      .slice(0, 5);
  };

  return (
    <Layout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Analytics</h1>
          <p className="dashboard-subtitle">Deep Insights & Trends</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <>
            <SkeletonStats count={4} />
            <div className="analytics-grid">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="analytics-grid">
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="content-card analytics-chart-card-wide">
              <div className="skeleton skeleton-title" style={{ marginBottom: '1.5rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="skeleton" style={{ height: '140px' }} />
                ))}
              </div>
            </div>
          </>
        ) : analytics && (
          <>
            {/* Key Metrics Cards */}
            <div className="analytics-metrics-grid">
              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <Target size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-label">Engagement Score</div>
                  <div className="metric-value">{calculateEngagementScore()}%</div>
                  <div className="metric-trend positive">↑ 12% from last week</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <Users size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-label">Active Students</div>
                  <div className="metric-value">{analytics.topStudents.filter(s => s.totalPlaytime > 0).length}</div>
                  <div className="metric-trend positive">↑ {Math.round((analytics.topStudents.filter(s => s.totalPlaytime > 0).length / analytics.totalStudents) * 100)}% of total</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <AlertCircle size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-label">At-Risk Students</div>
                  <div className="metric-value">{getAtRiskStudents().length}</div>
                  <div className="metric-trend neutral">Low engagement detected</div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>
                  <BarChart3 size={24} />
                </div>
                <div className="metric-content">
                  <div className="metric-label">Avg Completion Time</div>
                  <div className="metric-value">{Math.round(analytics.averagePlaytime / analytics.totalChapters)}m</div>
                  <div className="metric-trend neutral">Per chapter</div>
                </div>
              </div>
            </div>

            <div className="analytics-grid">
              {/* Weekly Completion Trend - Line Chart */}
              <div className="content-card analytics-chart-card">
                <div className="chart-header">
                  <div>
                    <h2 className="card-title">
                      <TrendingUp size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Completion Trend
                    </h2>
                    <p className="chart-subtitle">Weekly progress over time</p>
                  </div>
                </div>
                <div className="line-chart-container" style={{ width: '100%', height: '240px', marginTop: '1rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ flex: 1, width: '100%' }}>
                    <ResponsiveContainer>
                      <AreaChart data={generateWeeklyTrend()} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <RechartsTooltip 
                          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '3 3' }}
                          contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f8fafc', zIndex: 100 }}
                          itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                          formatter={(value: any) => [`${Number(value).toFixed(0)}%`, 'Completion Rate']}
                          labelStyle={{ color: '#94a3b8' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#trendGradient)" 
                          activeDot={{ r: 6, fill: '#10b981', stroke: '#111827', strokeWidth: 2 }}
                          dot={{ r: 5, fill: '#10b981', stroke: '#111827', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="chart-labels">
                    {generateWeeklyTrend().map((data, index) => (
                      <div key={index} className="chart-label">
                        <div className="label-name">{data.week}</div>
                        <div className="label-value">{data.rate.toFixed(0)}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* At-Risk Students */}
              <div className="content-card analytics-chart-card">
                <div className="chart-header">
                  <div>
                    <h2 className="card-title">
                      <AlertCircle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      At-Risk Students
                    </h2>
                    <p className="chart-subtitle">Low engagement alerts</p>
                  </div>
                </div>
                {getAtRiskStudents().length > 0 ? (
                  <div className="risk-list">
                    {getAtRiskStudents().map((student) => (
                      <div key={student.userId} className="risk-item">
                        <div className="risk-indicator"></div>
                        <div className="risk-content">
                          <div className="risk-name">{student.username}</div>
                          <div className="risk-stats">
                            <span className="risk-stat">{student.chaptersCompleted} chapters</span>
                            <span className="risk-stat">{Math.floor(student.totalPlaytime / 60)}h playtime</span>
                          </div>
                        </div>
                        <div className="risk-badge">Low Activity</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="chart-empty">
                    <p>All students are engaged! 🎉</p>
                  </div>
                )}
              </div>
            </div>

            {/* Chapter Difficulty & Achievement Rarity */}
            <div className="analytics-grid">
              {/* Chapter Difficulty Analysis */}
              <div className="content-card analytics-chart-card">
                <div className="chart-header">
                  <div>
                    <h2 className="card-title">
                      <Target size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Chapter Difficulty
                    </h2>
                    <p className="chart-subtitle">Drop-off rate analysis</p>
                  </div>
                </div>
                <div className="difficulty-list">
                  {calculateChapterDifficulty().map((chapter) => (
                    <div key={chapter.chapterId} className="difficulty-item">
                      <div className="difficulty-header">
                        <span className="difficulty-name">{chapter.chapterName}</span>
                        <span className={`difficulty-badge difficulty-${chapter.difficulty.toLowerCase()}`}>
                          {chapter.difficulty}
                        </span>
                      </div>
                      <div className="difficulty-stats">
                        <div className="difficulty-stat">
                          <span className="stat-label">Completion</span>
                          <span className="stat-value">{chapter.completionRate.toFixed(0)}%</span>
                        </div>
                        <div className="difficulty-stat">
                          <span className="stat-label">Drop-off</span>
                          <span className="stat-value">{chapter.dropOffRate.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="difficulty-bar">
                        <div 
                          className="difficulty-bar-fill"
                          style={{ 
                            width: `${chapter.completionRate}%`,
                            backgroundColor: chapter.difficulty === 'Hard' ? '#ef4444' : chapter.difficulty === 'Medium' ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievement Rarity */}
              <div className="content-card analytics-chart-card">
                <div className="chart-header">
                  <div>
                    <h2 className="card-title">
                      <Award size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      Achievement Rarity
                    </h2>
                    <p className="chart-subtitle">Unlock difficulty ranking</p>
                  </div>
                </div>
                <div className="rarity-list">
                  {analytics.achievementUnlockRates
                    .sort((a, b) => a.unlockRate - b.unlockRate)
                    .slice(0, 6)
                    .map((achievement) => {
                      const rarity = achievement.unlockRate < 10 ? 'Legendary' : achievement.unlockRate < 30 ? 'Rare' : 'Common';
                      const color = rarity === 'Legendary' ? '#8b5cf6' : rarity === 'Rare' ? '#3b82f6' : '#64748b';
                      return (
                        <div key={achievement.achievementId} className="rarity-item">
                          <div className="rarity-icon" style={{ backgroundColor: `${color}33`, color }}>
                            <Award size={16} />
                          </div>
                          <div className="rarity-content">
                            <div className="rarity-name">{achievement.achievementName}</div>
                            <div className="rarity-stats">
                              <span className="rarity-badge" style={{ backgroundColor: `${color}33`, color }}>
                                {rarity}
                              </span>
                              <span className="rarity-rate">{achievement.unlockRate.toFixed(1)}% unlocked</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Playtime Distribution - Enhanced Cards */}
            <div className="content-card analytics-chart-card-wide">
              <div className="chart-header">
                <div>
                  <h2 className="card-title">
                    <Clock size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Playtime Distribution
                  </h2>
                  <p className="chart-subtitle">Student engagement by time spent</p>
                </div>
                <div className="chart-stat">
                  <div className="stat-value-small">{analytics.totalStudents}</div>
                  <div className="stat-label-small">Total</div>
                </div>
              </div>
              <div className="playtime-grid">
                {(() => {
                  const ranges = [
                    { label: '0-30 minutes', shortLabel: '0-30m', min: 0, max: 30, count: 0, color: '#ef4444', icon: AlertTriangle },
                    { label: '30m - 1 hour', shortLabel: '30m-1h', min: 30, max: 60, count: 0, color: '#f59e0b', icon: Timer },
                    { label: '1-2 hours', shortLabel: '1-2h', min: 60, max: 120, count: 0, color: '#3b82f6', icon: BookOpen },
                    { label: '2-3 hours', shortLabel: '2-3h', min: 120, max: 180, count: 0, color: '#10b981', icon: Zap },
                    { label: '3+ hours', shortLabel: '3h+', min: 180, max: Infinity, count: 0, color: '#8b5cf6', icon: Star }
                  ];
                  
                  analytics.topStudents.forEach(student => {
                    const range = ranges.find(r => student.totalPlaytime >= r.min && student.totalPlaytime < r.max);
                    if (range) range.count++;
                  });
                  
                  const totalCount = ranges.reduce((sum, r) => sum + r.count, 0);
                  
                  return ranges.map((range, index) => {
                    const percentage = totalCount > 0 ? (range.count / totalCount) * 100 : 0;
                    const IconComponent = range.icon;
                    return (
                      <div key={index} className="playtime-card">
                        <div className="playtime-card-header">
                          <div className="playtime-icon" style={{ backgroundColor: `${range.color}33`, color: range.color }}>
                            <IconComponent size={24} />
                          </div>
                          <div className="playtime-info">
                            <div className="playtime-label">{range.label}</div>
                            <div className="playtime-count">{range.count} students</div>
                          </div>
                        </div>
                        <div className="playtime-bar-container">
                          <div 
                            className="playtime-bar"
                            style={{ 
                              width: `${percentage}%`,
                              backgroundColor: range.color
                            }}
                          ></div>
                        </div>
                        <div className="playtime-percentage">{percentage.toFixed(0)}%</div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
