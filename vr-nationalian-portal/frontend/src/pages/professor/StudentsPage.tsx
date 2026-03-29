import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, Edit2, Trash2, ArrowLeft, Trophy, Target, Medal, Zap, Award, Archive, Calendar } from 'lucide-react';
import { SkeletonTable } from '../../components/Skeleton';
import { getUserFriendlyError, handleApiResponse } from '../../utils/errorHandler';
import '../shared/ManagementPage.css';

interface Student {
  userId: string;
  username: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  email?: string;
  sectionId: string;
  sectionName?: string;
  createdAt?: string;
}

interface Section {
  sectionId: string;
  sectionName: string;
}

interface Chapter {
  chapterId: number;
  chapterName: string;
  chapterNumber: number;
  description?: string;
}

interface CompletedChapter {
  chapterId: number;
  completedAt: string;
  score?: number;
  totalQuestions?: number;
  percentage?: number;
}

interface Achievement {
  achievementId: string;
  achievementName: string;
  description?: string;
  iconKey?: string;
}

interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
}

interface LeaderboardEntry {
  userId: string;
  rank: number;
  value: number;
}

export default function StudentsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [completedChapters, setCompletedChapters] = useState<CompletedChapter[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<{
    achievements: LeaderboardEntry[];
    speedrun: LeaderboardEntry[];
  }>({ achievements: [], speedrun: [] });
  const [loadingAssessments, setLoadingAssessments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    sectionId: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const isAdmin = user?.roleName === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (isAdmin) {
      fetchAllStudents();
      fetchAllSections();
    } else {
      fetchProfessorStudents();
      fetchSections();
    }
  }, [user, isAdmin]);

  // Handle navigation from sections page
  useEffect(() => {
    const state = location.state as { selectedStudent?: Student };
    if (state?.selectedStudent) {
      handleStudentClick(state.selectedStudent);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchAllSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const allSections = await handleApiResponse(response);
      setSections(allSections);
    } catch (err) {
      console.error(getUserFriendlyError(err));
    }
  };

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      const data = await handleApiResponse(response);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getUserFriendlyError(err));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/sections/professor/${user.userId}`);
      const data = await handleApiResponse(response);
      setSections(data);
    } catch (err) {
      setError(getUserFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessorStudents = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/students/professor/${user.userId}`);
      const data = await handleApiResponse(response);
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(getUserFriendlyError(err));
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAssessments = async (userId: string) => {
    try {
      setLoadingAssessments(true);
      const [chaptersRes, achievementsRes, leaderboardRes, quizScoresRes] = await Promise.all([
        fetch(`/api/students/${userId}/chapters`),
        fetch(`/api/students/${userId}/achievements`),
        fetch('/api/leaderboards'),
        fetch(`/api/quiz-scores/${userId}`)
      ]);
      
      const chaptersData = await handleApiResponse(chaptersRes);
      const quizScores = quizScoresRes.ok ? await quizScoresRes.json() : [];
      
      // Merge quiz scores with chapter completion data
      const completedWithScores = (chaptersData.completed || []).map((cc: any) => {
        const quizScore = quizScores.find((qs: any) => qs.chapterId === cc.chapterId);
        return {
          ...cc,
          score: quizScore?.score,
          totalQuestions: quizScore?.totalQuestions,
          percentage: quizScore?.percentage
        };
      });
      
      setChapters(chaptersData.chapters || []);
      setCompletedChapters(completedWithScores);

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData.achievements || []);
        setUnlockedAchievements(achievementsData.unlocked || []);
      }

      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json();
        setLeaderboardData({
          achievements: leaderboardData.topAchievements || [],
          speedrun: leaderboardData.topSpeedrunners || []
        });
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
      setChapters([]);
      setCompletedChapters([]);
      setAchievements([]);
      setUnlockedAchievements([]);
    } finally {
      setLoadingAssessments(false);
    }
  };
  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    fetchStudentAssessments(student.userId);
  };

  const handleBackToStudents = () => {
    setSelectedStudent(null);
    setChapters([]);
    setCompletedChapters([]);
    setAchievements([]);
    setUnlockedAchievements([]);
    setLeaderboardData({ achievements: [], speedrun: [] });
  };

  const isChapterCompleted = (chapterId: number) => {
    return completedChapters.some(cc => cc.chapterId === chapterId);
  };

  const getChapterScore = (chapterId: number) => {
    const completed = completedChapters.find(cc => cc.chapterId === chapterId);
    if (completed?.score !== undefined && completed?.totalQuestions !== undefined) {
      return `${completed.score}/${completed.totalQuestions}`;
    }
    return null;
  };

  const getLeaderboardRanks = (userId: string) => {
    const achievementRank = leaderboardData.achievements.find(e => e.userId === userId);
    const speedrunRank = leaderboardData.speedrun.find(e => e.userId === userId);
    return { achievementRank, speedrunRank };
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return { bg: '#422006', border: '#f59e0b', text: '#fbbf24' }; // Gold
    if (rank === 2) return { bg: '#1e293b', border: '#64748b', text: '#cbd5e1' }; // Silver
    if (rank === 3) return { bg: '#3f2516', border: '#c2410c', text: '#fb923c' }; // Bronze
    return { bg: '#1e3a5f', border: '#3b82f6', text: '#93c5fd' }; // Default blue
  };

  const isAchievementUnlocked = (achievementId: string) => {
    return unlockedAchievements.some(ua => ua.achievementId === achievementId);
  };

  const getAchievementUnlockedDate = (achievementId: string) => {
    const unlocked = unlockedAchievements.find(ua => ua.achievementId === achievementId);
    return unlocked?.unlockedAt;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingStudent) {
        const response = await fetch(`/api/students/${editingStudent.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            firstName: formData.firstName,
            middleInitial: formData.middleInitial || null,
            lastName: formData.lastName,
            sectionId: formData.sectionId
          })
        });

        await handleApiResponse(response);
      } else {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            email: formData.email,
            firstName: formData.firstName,
            middleInitial: formData.middleInitial || null,
            lastName: formData.lastName,
            sectionId: formData.sectionId
          })
        });

        await handleApiResponse(response);
      }

      setShowModal(false);
      resetForm();
      if (isAdmin) {
        fetchAllStudents();
      } else {
        fetchProfessorStudents();
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      password: '',
      email: student.email || '',
      firstName: student.firstName,
      middleInitial: student.middleInitial || '',
      lastName: student.lastName,
      sectionId: student.sectionId
    });
    // For admin, always fetch sections to ensure dropdown is populated
    if (isAdmin) {
      fetchAllSectionsForModal();
    }
    setShowModal(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      const response = await fetch(`/api/students/${userId}`, {
        method: 'DELETE'
      });

      await handleApiResponse(response);
      if (isAdmin) {
        fetchAllStudents();
      } else {
        fetchProfessorStudents();
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  const openCreateModal = () => {
    setEditingStudent(null);
    resetForm();
    // For admin, always fetch sections when opening create modal
    if (isAdmin) {
      fetchAllSectionsForModal();
    }
    setShowModal(true);
  };

  const fetchAllSectionsForModal = async () => {
    try {
      // Fetch all sections for the dropdown in create/edit modal
      const response = await fetch('/api/sections');
      const allSections = await handleApiResponse(response);
      setSections(allSections);
    } catch (err) {
      console.error(getUserFriendlyError(err));
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      firstName: '',
      middleInitial: '',
      lastName: '',
      sectionId: ''
    });
  };

  const handleArchive = async (userId: string) => {
    if (!confirm('Are you sure you want to archive this student?')) return;

    try {
      const response = await fetch(`/api/users/${userId}/archive`, {
        method: 'PATCH'
      });

      await handleApiResponse(response);
      
      setSuccess('Student archived successfully');
      setTimeout(() => setSuccess(''), 3000);
      
      if (isAdmin) {
        fetchAllStudents();
      } else {
        fetchProfessorStudents();
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedStudents.size === 0) return;

    if (!confirm(`Are you sure you want to archive ${selectedStudents.size} student(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedStudents).map(userId =>
          fetch(`/api/users/${userId}/archive`, { method: 'PATCH' })
        )
      );

      setSuccess(`${selectedStudents.size} student(s) archived successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedStudents(new Set());
      
      if (isAdmin) {
        fetchAllStudents();
      } else {
        fetchProfessorStudents();
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  const handleScheduleArchive = async () => {
    if (selectedStudents.size === 0 || !scheduleDate || !scheduleTime) return;

    const scheduledDateTime = `${scheduleDate}T${scheduleTime}`;

    try {
      await Promise.all(
        Array.from(selectedStudents).map(userId =>
          fetch(`/api/users/${userId}/schedule-archive`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduledArchiveDate: scheduledDateTime })
          })
        )
      );

      setSuccess(`Archive scheduled for ${selectedStudents.size} student(s)`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedStudents(new Set());
      setShowScheduleModal(false);
      setScheduleDate('');
      setScheduleTime('');
      
      if (isAdmin) {
        fetchAllStudents();
      } else {
        fetchProfessorStudents();
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.size === 0) return;

    if (!confirm(`Are you sure you want to permanently delete ${selectedStudents.size} student(s)? This action cannot be undone.`)) return;

    try {
      await Promise.all(
        Array.from(selectedStudents).map(userId =>
          fetch(`/api/students/${userId}`, { method: 'DELETE' })
        )
      );

      setSuccess(`${selectedStudents.size} student(s) deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedStudents(new Set());
      
      if (isAdmin) {
        fetchAllStudents();
      } else {
        fetchProfessorStudents();
      }
    } catch (err) {
      setError(getUserFriendlyError(err));
    }
  };

  const toggleStudentSelection = (userId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedStudents(newSelection);
  };

  // Moving toggleSelectAll below filteredStudents definition to access paginated array

  const getFullName = (student: Student) => {
    let name = student.firstName;
    if (student.middleInitial) name += ` ${student.middleInitial}.`;
    name += ` ${student.lastName}`;
    return name;
  };

  // Extract unique prefixes and numbers from section names
  const extractSectionParts = () => {
    const prefixes = new Set<string>();
    const allNumbers = new Set<string>();
    const prefixToNumbers = new Map<string, Set<string>>();
    
    sections.forEach(section => {
      // Match patterns like "INF-222", "CS101", "MATH 201", etc.
      const match = section.sectionName.match(/^([A-Z]+)[\s-]?(\d+)/i);
      if (match) {
        const prefix = match[1].toUpperCase();
        const number = match[2];
        
        prefixes.add(prefix);
        allNumbers.add(number);
        
        if (!prefixToNumbers.has(prefix)) {
          prefixToNumbers.set(prefix, new Set<string>());
        }
        prefixToNumbers.get(prefix)!.add(number);
      }
    });
    
    return {
      prefixes: Array.from(prefixes).sort(),
      allNumbers: Array.from(allNumbers).sort((a, b) => parseInt(a) - parseInt(b)),
      prefixToNumbers
    };
  };

  const { prefixes, allNumbers, prefixToNumbers } = extractSectionParts();
  
  // Get numbers filtered by selected prefix, or all numbers if no prefix selected
  const availableNumbers = selectedPrefix && prefixToNumbers.has(selectedPrefix)
    ? Array.from(prefixToNumbers.get(selectedPrefix)!).sort((a, b) => parseInt(a) - parseInt(b))
    : allNumbers;

  const filteredStudents = students.filter(student => {
    const fullName = getFullName(student).toLowerCase();
    const username = student.username.toLowerCase();
    const search = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(search) || username.includes(search);

    // Get the section name for this student
    const studentSection = sections.find(s => s.sectionId === student.sectionId);
    const sectionName = studentSection?.sectionName || student.sectionName || '';

    // Check prefix filter
    let matchesPrefix = true;
    if (selectedPrefix) {
      const match = sectionName.match(/^([A-Z]+)/i);
      matchesPrefix = match ? match[1].toUpperCase() === selectedPrefix : false;
    }
    
    // Check number filter
    let matchesNumber = true;
    if (selectedNumber) {
      const match = sectionName.match(/(\d+)/);
      matchesNumber = match ? match[1] === selectedNumber : false;
    }
    
    return matchesSearch && matchesPrefix && matchesNumber;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPrefix, selectedNumber]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (paginatedStudents.length === 0) return;
    
    const currentViewIds = paginatedStudents.map(s => s.userId);
    const allSelectedInView = currentViewIds.every(id => selectedStudents.has(id));
    
    if (allSelectedInView) {
      const newSelection = new Set(selectedStudents);
      currentViewIds.forEach(id => newSelection.delete(id));
      setSelectedStudents(newSelection);
    } else {
      const newSelection = new Set(selectedStudents);
      currentViewIds.forEach(id => newSelection.add(id));
      setSelectedStudents(newSelection);
    }
  };

  return (
    <Layout>
      <div className="management-page">
        {selectedStudent ? (
          // Student Assessment View
          <>
            <div style={{ marginBottom: '2rem' }}>
              <button className="btn-back" onClick={handleBackToStudents}>
                <ArrowLeft size={20} />
                Back to Students
              </button>
              <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                  <h1 className="page-title">{getFullName(selectedStudent)}</h1>
                  <p className="page-subtitle">Chapter Progress & Assessments</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {(() => {
                    const { achievementRank, speedrunRank } = getLeaderboardRanks(selectedStudent.userId);
                    return (
                      <>
                        {achievementRank && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: getRankColor(achievementRank.rank).bg,
                            border: `1px solid ${getRankColor(achievementRank.rank).border}`,
                            borderRadius: '6px',
                            color: getRankColor(achievementRank.rank).text,
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}>
                            <Medal size={18} />
                            #{achievementRank.rank} Achievements
                          </div>
                        )}
                        {speedrunRank && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: getRankColor(speedrunRank.rank).bg,
                            border: `1px solid ${getRankColor(speedrunRank.rank).border}`,
                            borderRadius: '6px',
                            color: getRankColor(speedrunRank.rank).text,
                            fontSize: '0.875rem',
                            fontWeight: 600
                          }}>
                            <Zap size={18} />
                            #{speedrunRank.rank} Speedrun
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loadingAssessments ? (
              <div className="table-container">
                <SkeletonTable rows={5} />
              </div>
            ) : chapters.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Target size={64} /></div>
                <h3>No chapters available</h3>
                <p>Chapters will appear here once they are added to the system</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Chapter</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapters.map((chapter) => {
                      const completed = isChapterCompleted(chapter.chapterId);
                      const score = getChapterScore(chapter.chapterId);
                      const completedData = completedChapters.find(cc => cc.chapterId === chapter.chapterId);
                      
                      return (
                        <tr key={chapter.chapterId}>
                          <td className="font-medium">Chapter {chapter.chapterNumber}</td>
                          <td>{chapter.chapterName}</td>
                          <td>
                            {completed ? (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                background: '#064e3b',
                                border: '1px solid #059669',
                                borderRadius: '4px',
                                color: '#6ee7b7',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                <Trophy size={14} />
                                Completed
                              </span>
                            ) : (
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '0.5rem',
                                padding: '0.25rem 0.75rem',
                                background: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '4px',
                                color: '#64748b',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}>
                                In Progress
                              </span>
                            )}
                          </td>
                          <td>
                            {score ? (
                              <span style={{ 
                                color: score.includes('/') ? '#6ee7b7' : '#64748b',
                                fontWeight: 600
                              }}>
                                {score}
                              </span>
                            ) : (
                              <span style={{ color: '#64748b' }}>—</span>
                            )}
                          </td>
                          <td>
                            {completedData ? (
                              new Date(completedData.completedAt).toLocaleDateString()
                            ) : (
                              <span style={{ color: '#64748b' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Achievements Section */}
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 600, 
                color: '#e2e8f0', 
                marginBottom: '1rem' 
              }}>
                Achievements
              </h2>
              {loadingAssessments ? (
                <div className="table-container">
                  <SkeletonTable rows={3} />
                </div>
              ) : achievements.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Award size={64} /></div>
                  <h3>No achievements available</h3>
                  <p>Achievements will appear here once they are added to the system</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Achievement</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Unlocked</th>
                      </tr>
                    </thead>
                    <tbody>
                      {achievements.map((achievement) => {
                        const unlocked = isAchievementUnlocked(achievement.achievementId);
                        const unlockedDate = getAchievementUnlockedDate(achievement.achievementId);
                        
                        return (
                          <tr key={achievement.achievementId}>
                            <td className="font-medium">{achievement.achievementName}</td>
                            <td>{achievement.description || '—'}</td>
                            <td>
                              {unlocked ? (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  padding: '0.25rem 0.75rem',
                                  background: '#422006',
                                  border: '1px solid #f59e0b',
                                  borderRadius: '4px',
                                  color: '#fbbf24',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}>
                                  <Award size={14} />
                                  Unlocked
                                </span>
                              ) : (
                                <span style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '0.5rem',
                                  padding: '0.25rem 0.75rem',
                                  background: '#1e293b',
                                  border: '1px solid #334155',
                                  borderRadius: '4px',
                                  color: '#64748b',
                                  fontSize: '0.75rem',
                                  fontWeight: 600
                                }}>
                                  Locked
                                </span>
                              )}
                            </td>
                            <td>
                              {unlockedDate ? (
                                new Date(unlockedDate).toLocaleDateString()
                              ) : (
                                <span style={{ color: '#64748b' }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : (
          // Students List View
          <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">Manage student accounts</p>
          </div>
          <button 
            className="btn-primary" 
            onClick={openCreateModal}
            disabled={!isAdmin && sections.length === 0}
          >
            + Add Student
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {sections.length === 0 && !isAdmin ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={64} /></div>
            <h3>No sections available</h3>
            <p>Create a section first before adding students</p>
          </div>
        ) : (
          <>
            <div className="filter-bar">
              <label className="filter-label">Search:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: '300px' }}
              />
              {prefixes.length > 0 && (
                <>
                  <label className="filter-label" style={{ marginLeft: '1rem' }}>Course:</label>
                  <select
                    className="filter-select"
                    value={selectedPrefix}
                    onChange={(e) => {
                      setSelectedPrefix(e.target.value);
                      setSelectedNumber(''); // Reset number when prefix changes
                    }}
                    style={{ minWidth: '120px' }}
                  >
                    <option value="">All Courses</option>
                    {prefixes.map((prefix) => (
                      <option key={prefix} value={prefix}>
                        {prefix}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {availableNumbers.length > 0 && (
                <>
                  <label className="filter-label" style={{ marginLeft: '1rem' }}>Number:</label>
                  <select
                    className="filter-select"
                    value={selectedNumber}
                    onChange={(e) => setSelectedNumber(e.target.value)}
                    style={{ minWidth: '120px' }}
                  >
                    <option value="">All Numbers</option>
                    {availableNumbers.map((number) => (
                      <option key={number} value={number}>
                        {number}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            {selectedStudents.size > 0 && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-warning" onClick={handleBulkArchive}>
                  <Archive size={16} />
                  Archive ({selectedStudents.size})
                </button>
                <button className="btn btn-secondary" onClick={() => setShowScheduleModal(true)}>
                  <Calendar size={16} />
                  Schedule Archive
                </button>
                {isAdmin && (
                  <button className="btn btn-danger" onClick={handleBulkDelete}>
                    <Trash2 size={16} />
                    Delete ({selectedStudents.size})
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className="table-container">
                <SkeletonTable rows={5} />
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={64} /></div>
                <h3>{isAdmin ? 'No students yet' : 'No students in this section'}</h3>
                <p>Add your first student to get started</p>
                <button className="btn-primary" onClick={openCreateModal}>
                  Add Student
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>
                        <input
                          type="checkbox"
                          checked={paginatedStudents.length > 0 && paginatedStudents.every(s => selectedStudents.has(s.userId))}
                          onChange={toggleSelectAll}
                        />
                      </th>
                      <th>Name</th>
                      <th>Username</th>
                      {isAdmin && <th>Section</th>}
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedStudents.map((student) => (
                      <tr 
                        key={student.userId}
                      >
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedStudents.has(student.userId)}
                            onChange={() => toggleStudentSelection(student.userId)}
                          />
                        </td>
                        <td 
                          className="font-medium"
                          onClick={() => handleStudentClick(student)}
                          style={{ cursor: 'pointer' }}
                        >
                          {getFullName(student)}
                        </td>
                        <td
                          onClick={() => handleStudentClick(student)}
                          style={{ cursor: 'pointer' }}
                        >
                          <code>{student.username}</code>
                        </td>
                        {isAdmin && (
                          <td
                            onClick={() => handleStudentClick(student)}
                            style={{ cursor: 'pointer' }}
                          >
                            {student.sectionName || sections.find(s => s.sectionId === student.sectionId)?.sectionName || 'No Section'}
                          </td>
                        )}
                        <td
                          onClick={() => handleStudentClick(student)}
                          style={{ cursor: 'pointer' }}
                        >
                          {student.email || '—'}
                        </td>
                        <td>
                          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn-icon btn-edit" 
                              onClick={() => handleEdit(student)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="btn-icon btn-archive" 
                              onClick={() => handleArchive(student.userId)}
                              title="Archive"
                            >
                              <Archive size={16} />
                            </button>
                            {isAdmin && (
                              <button 
                                className="btn-icon btn-delete" 
                                onClick={() => handleDelete(student.userId)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {totalPages > 1 && (
              <div style={{ marginTop: '1rem' }}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredStudents.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                />
              </div>
            )}
          </>
        )}
        </>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingStudent ? 'Edit Student' : 'Add Student'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="student123"
                      required
                    />
                  </div>
                  {!editingStudent && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Password *</label>
                        <input
                          type="password"
                          className="form-input"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-input"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="student@example.com"
                          required
                        />
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Middle Initial</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.middleInitial}
                      onChange={(e) => setFormData({ ...formData, middleInitial: e.target.value })}
                      placeholder="M"
                      maxLength={1}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section *</label>
                    <select
                      className="form-input"
                      value={formData.sectionId}
                      onChange={(e) => setFormData({ ...formData, sectionId: e.target.value })}
                      required
                    >
                      <option value="">Select section</option>
                      {sections.map((section) => (
                        <option key={section.sectionId} value={section.sectionId}>
                          {section.sectionName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingStudent ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showScheduleModal && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule Archive</h2>
                <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  Schedule {selectedStudents.size} student(s) to be archived on a specific date and time.
                </p>
                <div className="form-group">
                  <label className="form-label">Archive Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Archive Time *</label>
                  <input
                    type="time"
                    className="form-input"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleScheduleArchive}
                  disabled={!scheduleDate || !scheduleTime}
                >
                  Schedule Archive
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
