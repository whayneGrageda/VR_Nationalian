import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import StudentLayout from '../../components/StudentLayout';
import { useAuth } from '../../contexts/AuthContext';
import { Zap, Users, Award, TrendingUp, Medal, Crown, Star } from 'lucide-react';
import './LeaderboardPage.css';

interface LeaderboardEntry {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  sectionName?: string;
  value: number;
  rank: number;
}

interface TopAchievements extends LeaderboardEntry {
  achievementCount: number;
}

interface TopSpeedrunner extends LeaderboardEntry {
  completionTimeMinutes: number;
}

interface TopSection extends LeaderboardEntry {
  completedStudents: number;
  totalStudents: number;
  completionRate: number;
}

interface LeaderboardData {
  topAchievements: TopAchievements[];
  topSpeedrunners: TopSpeedrunner[];
  topSections: TopSection[];
}

function SkeletonLeaderboard() {
  return (
    <div className="leaderboards-container">
      {[1, 2, 3].map((i) => (
        <div key={i} className="leaderboard-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
          <div className="leaderboard-section" style={{ flex: 1, minWidth: 0, margin: 0 }}>
            <div className="section-header">
              <div className="skeleton" style={{ width: '20px', height: '20px', borderRadius: '4px' }} />
              <div className="skeleton" style={{ width: '150px', height: '16px', borderRadius: '4px' }} />
            </div>
            <div className="podium-container">
              {[1, 2, 3].map((j) => (
                <div key={j} className="skeleton" style={{ 
                  flex: 1,
                  height: j === 2 ? '240px' : j === 1 ? '200px' : '160px',
                  borderRadius: '12px 12px 0 0'
                }} />
              ))}
            </div>
          </div>
          <div className="rankings-list" style={{ flex: '0 0 300px' }}>
            <div className="skeleton" style={{ width: '100px', height: '16px', marginBottom: '1rem', borderRadius: '4px' }} />
            {[1, 2, 3, 4, 5, 6].map((k) => (
              <div key={k} className="skeleton" style={{ width: '100%', height: '36px', marginBottom: '0.5rem', borderRadius: '4px' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState('');

  const isStudent = user?.roleId === 1;
  const LayoutComponent = isStudent ? StudentLayout : Layout;

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    try {
      const response = await fetch('/api/leaderboards');
      if (!response.ok) throw new Error('Failed to fetch leaderboards');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (entry: LeaderboardEntry) => {
    if (entry.firstName && entry.lastName) {
      return `${entry.firstName} ${entry.lastName}`;
    }
    return entry.username;
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#fbbf24'; // Gold
    if (rank === 2) return '#94a3b8'; // Silver
    if (rank === 3) return '#cd7f32'; // Bronze
    return '#64748b';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} />;
    if (rank === 2) return <Medal size={24} />;
    if (rank === 3) return <Star size={24} />;
    return rank;
  };

  if (loading) {
    return (
      <LayoutComponent>
        <div className="leaderboard-page">
          <div className="page-header">
            <div>
              <h1 className="page-title">Leaderboards</h1>
              <p className="page-subtitle">Top Performers</p>
            </div>
          </div>
          <SkeletonLeaderboard />
        </div>
      </LayoutComponent>
    );
  }

  if (error) {
    return (
      <LayoutComponent>
        <div className="leaderboard-page">
          <div className="error-banner">{error}</div>
        </div>
      </LayoutComponent>
    );
  }

  return (
    <LayoutComponent>
      <div className="leaderboard-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Leaderboards</h1>
            <p className="page-subtitle">Top Performers</p>
          </div>
        </div>

        <div className="leaderboards-container">
          {/* Most Achievements - Podium Style */}
          <div className="leaderboard-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
            <div className="leaderboard-section" style={{ flex: 1, minWidth: 0, margin: 0 }}>
              <div className="section-header">
                <Award className="section-icon" size={20} />
                <div>
                  <h2 className="section-title">Most Achievements</h2>
                  <p className="section-description">Students with the highest number of unlocked achievements</p>
                </div>
              </div>
              {data?.topAchievements && data.topAchievements.length > 0 ? (
                <div className="podium-container">
                  {data.topAchievements.slice(0, 3).map((entry) => (
                    <div 
                      key={entry.userId} 
                      className={`podium-item rank-${entry.rank}`}
                      style={{ order: entry.rank === 1 ? 2 : entry.rank === 2 ? 1 : 3 }}
                    >
                      <div className="podium-rank" style={{ color: getRankColor(entry.rank) }}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="podium-info">
                        <div className="podium-name">{getFullName(entry)}</div>
                        <div className="podium-score">{entry.achievementCount}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-compact">
                  <Award size={32} />
                  <p>No data</p>
                </div>
              )}
            </div>
            {data?.topAchievements && data.topAchievements.length > 0 && (
              <div className="rankings-list">
                <div className="rankings-header">Other Rankings</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const rank = i + 4;
                  const entry = data.topAchievements.find(e => e.rank === rank);
                  return (
                    <div key={rank} className={`ranking-item ${!entry ? 'empty' : ''}`}>
                      <div className="ranking-position">#{rank}</div>
                      <div className="ranking-info">
                        <div className="ranking-name">{entry ? getFullName(entry) : '—'}</div>
                      </div>
                      <div className="ranking-value">{entry ? entry.achievementCount : '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fastest Completion */}
          <div className="leaderboard-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
            <div className="leaderboard-section" style={{ flex: 1, minWidth: 0, margin: 0 }}>
              <div className="section-header">
                <Zap className="section-icon" size={20} />
                <div>
                  <h2 className="section-title">Fastest Completion</h2>
                  <p className="section-description">Students who completed all 4 chapters in the shortest time</p>
                </div>
              </div>
              {data?.topSpeedrunners && data.topSpeedrunners.length > 0 ? (
                <div className="podium-container">
                  {data.topSpeedrunners.slice(0, 3).map((entry) => (
                    <div 
                      key={entry.userId} 
                      className={`podium-item rank-${entry.rank}`}
                      style={{ order: entry.rank === 1 ? 2 : entry.rank === 2 ? 1 : 3 }}
                    >
                      <div className="podium-rank" style={{ color: getRankColor(entry.rank) }}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="podium-info">
                        <div className="podium-name">{getFullName(entry)}</div>
                        <div className="podium-score">{formatTime(entry.completionTimeMinutes)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-compact">
                  <Zap size={32} />
                  <p>No data</p>
                </div>
              )}
            </div>
            {data?.topSpeedrunners && data.topSpeedrunners.length > 0 && (
              <div className="rankings-list">
                <div className="rankings-header">Other Rankings</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const rank = i + 4;
                  const entry = data.topSpeedrunners.find(e => e.rank === rank);
                  return (
                    <div key={rank} className={`ranking-item ${!entry ? 'empty' : ''}`}>
                      <div className="ranking-position">#{rank}</div>
                      <div className="ranking-info">
                        <div className="ranking-name">{entry ? getFullName(entry) : '—'}</div>
                      </div>
                      <div className="ranking-value">{entry ? formatTime(entry.completionTimeMinutes) : '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Top Sections */}
          <div className="leaderboard-content" style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch' }}>
            <div className="leaderboard-section" style={{ flex: 1, minWidth: 0, margin: 0 }}>
              <div className="section-header">
                <TrendingUp className="section-icon" size={20} />
                <div>
                  <h2 className="section-title">Top Sections</h2>
                  <p className="section-description">Sections with the most students completing all chapters</p>
                </div>
              </div>
              {data?.topSections && data.topSections.length > 0 ? (
                <div className="podium-container">
                  {data.topSections.slice(0, 3).map((entry) => (
                    <div 
                      key={entry.userId} 
                      className={`podium-item rank-${entry.rank}`}
                      style={{ order: entry.rank === 1 ? 2 : entry.rank === 2 ? 1 : 3 }}
                    >
                      <div className="podium-rank" style={{ color: getRankColor(entry.rank) }}>
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="podium-info">
                        <div className="podium-name">{entry.sectionName}</div>
                        <div className="podium-score">{entry.completionRate}%</div>
                        <div className="podium-detail">{entry.completedStudents}/{entry.totalStudents}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state-compact">
                  <Users size={32} />
                  <p>No data</p>
                </div>
              )}
            </div>
            {data?.topSections && data.topSections.length > 0 && (
              <div className="rankings-list">
                <div className="rankings-header">Other Rankings</div>
                {Array.from({ length: 7 }, (_, i) => {
                  const rank = i + 4;
                  const entry = data.topSections.find(e => e.rank === rank);
                  return (
                    <div key={rank} className={`ranking-item ${!entry ? 'empty' : ''}`}>
                      <div className="ranking-position">#{rank}</div>
                      <div className="ranking-info">
                        <div className="ranking-name">{entry ? entry.sectionName : '—'}</div>
                        {entry && <div className="ranking-detail">{entry.completedStudents}/{entry.totalStudents}</div>}
                      </div>
                      <div className="ranking-value">{entry ? `${entry.completionRate}%` : '—'}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
}
