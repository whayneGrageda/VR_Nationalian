import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Trophy, Zap, Users, Award, Clock, TrendingUp } from 'lucide-react';
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
    <div className="leaderboards-grid">
      {[1, 2, 3].map((i) => (
        <div key={i} className="leaderboard-card">
          <div className="leaderboard-header">
            <div className="skeleton skeleton-icon" />
            <div className="skeleton skeleton-title" style={{ width: '150px' }} />
          </div>
          <div className="leaderboard-list">
            {[1, 2, 3].map((j) => (
              <div key={j} className="leaderboard-item">
                <div className="skeleton skeleton-rank" />
                <div className="player-info" style={{ flex: 1 }}>
                  <div className="skeleton skeleton-text" style={{ width: '60%', marginBottom: '8px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }} />
                </div>
                <div className="skeleton skeleton-score" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState('');

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
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  if (loading) {
    return (
      <Layout>
        <div className="leaderboard-page">
          <div className="page-header">
            <Trophy size={32} />
            <div>
              <h1 className="page-title">Leaderboards</h1>
              <p className="page-subtitle">Top Performers</p>
            </div>
          </div>
          <SkeletonLeaderboard />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="leaderboard-page">
          <div className="error-banner">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="leaderboard-page">
        <div className="page-header">
          <Trophy size={32} />
          <div>
            <h1 className="page-title">Leaderboards</h1>
            <p className="page-subtitle">Top Performers</p>
          </div>
        </div>

        <div className="leaderboards-grid">
          {/* Top Achievements */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <Award className="leaderboard-icon" size={24} />
              <h2 className="leaderboard-title">Most Achievements</h2>
            </div>
            {data?.topAchievements && data.topAchievements.length > 0 ? (
              <div className="leaderboard-list">
                {data.topAchievements.map((entry) => (
                  <div key={entry.userId} className="leaderboard-item">
                    <div 
                      className="rank-badge" 
                      style={{ color: getRankColor(entry.rank) }}
                    >
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="player-info">
                      <div className="player-name">{getFullName(entry)}</div>
                      {entry.sectionName && (
                        <div className="player-section">{entry.sectionName}</div>
                      )}
                    </div>
                    <div className="player-score">
                      <span className="score-value">{entry.achievementCount}</span>
                      <span className="score-label">achievements</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Award size={48} />
                <p>No achievement data yet</p>
              </div>
            )}
          </div>

          {/* Top Speedrunners */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <Zap className="leaderboard-icon" size={24} />
              <h2 className="leaderboard-title">Fastest Completion</h2>
            </div>
            {data?.topSpeedrunners && data.topSpeedrunners.length > 0 ? (
              <div className="leaderboard-list">
                {data.topSpeedrunners.map((entry) => (
                  <div key={entry.userId} className="leaderboard-item">
                    <div 
                      className="rank-badge" 
                      style={{ color: getRankColor(entry.rank) }}
                    >
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="player-info">
                      <div className="player-name">{getFullName(entry)}</div>
                      {entry.sectionName && (
                        <div className="player-section">{entry.sectionName}</div>
                      )}
                    </div>
                    <div className="player-score">
                      <Clock size={16} />
                      <span className="score-value">{formatTime(entry.completionTimeMinutes)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Zap size={48} />
                <p>No completion data yet</p>
              </div>
            )}
          </div>

          {/* Top Sections */}
          <div className="leaderboard-card">
            <div className="leaderboard-header">
              <TrendingUp className="leaderboard-icon" size={24} />
              <h2 className="leaderboard-title">Top Sections</h2>
            </div>
            {data?.topSections && data.topSections.length > 0 ? (
              <div className="leaderboard-list">
                {data.topSections.map((entry) => (
                  <div key={entry.userId} className="leaderboard-item">
                    <div 
                      className="rank-badge" 
                      style={{ color: getRankColor(entry.rank) }}
                    >
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="player-info">
                      <div className="player-name">{entry.sectionName}</div>
                      <div className="player-section">
                        {entry.completedStudents}/{entry.totalStudents} completed
                      </div>
                    </div>
                    <div className="player-score">
                      <span className="score-value">{entry.completionRate}%</span>
                      <span className="score-label">completion</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Users size={48} />
                <p>No section data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
