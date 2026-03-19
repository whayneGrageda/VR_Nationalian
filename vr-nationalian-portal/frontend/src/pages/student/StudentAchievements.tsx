import { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { Target, Zap, Award, Calendar, Search, Crown, Lock } from 'lucide-react';
import { SkeletonCard } from '../../components/Skeleton';
import { useAuth } from '../../contexts/AuthContext';
import '../ManagementPage.css';
import './StudentPages.css';

interface Achievement {
  achievementId: string;
  achievementKey: string;
  achievementName: string;
  description?: string;
  iconKey?: string;
}

interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlockedAt?: Date;
}

const iconMap: { [key: string]: any } = {
  'target': Target,
  'zap': Zap,
  'award': Award,
  'calendar': Calendar,
  'search': Search,
  'crown': Crown
};

export default function StudentAchievements() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<AchievementWithStatus[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.userId) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`/api/students/${user?.userId}/achievements`);
      if (!response.ok) throw new Error('Failed to fetch achievements');
      
      const data = await response.json();
      const { achievements: allAchievements, unlocked } = data;

      // Map achievements with unlock status
      const achievementsWithStatus: AchievementWithStatus[] = allAchievements.map((achievement: Achievement) => {
        const userAchievement = unlocked.find((u: UserAchievement) => u.achievementId === achievement.achievementId);
        
        return {
          ...achievement,
          unlocked: !!userAchievement,
          unlockedAt: userAchievement?.unlockedAt ? new Date(userAchievement.unlockedAt) : undefined
        };
      });

      setAchievements(achievementsWithStatus);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconKey?: string) => {
    if (!iconKey) return Award;
    return iconMap[iconKey.toLowerCase()] || Award;
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <StudentLayout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Achievements</h1>
            <p className="page-subtitle">
              Track your progress and unlock rewards ({unlockedCount} / {totalCount})
            </p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div className="achievements-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="content-card">
            <p className="card-text">No achievements available yet. Check back later!</p>
          </div>
        ) : (
          <div className="achievements-grid">
            {achievements.map((achievement) => {
              const Icon = getIcon(achievement.iconKey);
              return (
                <div 
                  key={achievement.achievementId} 
                  className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">
                    {achievement.unlocked ? (
                      <Icon size={32} />
                    ) : (
                      <Lock size={32} />
                    )}
                  </div>
                  <div className="achievement-content">
                    <h3 className="achievement-name">{achievement.achievementName}</h3>
                    <p className="achievement-desc">
                      {achievement.description || 'Complete this challenge to unlock'}
                    </p>
                    {achievement.unlocked ? (
                      <div>
                        <span className="achievement-badge unlocked-badge">Unlocked</span>
                        {achievement.unlockedAt && (
                          <p className="achievement-date">
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="achievement-badge locked-badge">Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
