import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, ChevronRight } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import './ManagementPage.css';

interface QuizScore {
  quizId: string;
  userId: string;
  chapterId: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

interface StudentWithScores {
  userId: string;
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  sectionId: string;
  sectionName?: string;
  scores: QuizScore[];
}

interface Section {
  sectionId: string;
  sectionName: string;
}

const CHAPTERS = [
  { id: 1, name: 'Chapter 1', color: '#3b82f6' },
  { id: 2, name: 'Chapter 2', color: '#8b5cf6' },
  { id: 3, name: 'Chapter 3', color: '#ec4899' },
  { id: 4, name: 'Chapter 4', color: '#f59e0b' }
];

export default function ChaptersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentWithScores[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const isAdmin = user?.roleName === 'admin';

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const studentsEndpoint = isAdmin
        ? '/api/quiz-scores'
        : `/api/quiz-scores/professor/${user?.userId}`;

      const [studentsRes, sectionsRes] = await Promise.all([
        fetch(studentsEndpoint),
        isAdmin ? fetch('/api/sections') : fetch(`/api/sections/professor/${user?.userId}`)
      ]);

      if (studentsRes.ok) {
        const data = await studentsRes.json();
        setStudents(Array.isArray(data) ? data : []);
      }

      if (sectionsRes.ok) {
        const data = await sectionsRes.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentClick = (student: StudentWithScores) => {
    const studentsPath = isAdmin ? '/admin/students' : '/professor/students';
    navigate(studentsPath, { state: { selectedStudent: student } });
  };

  const getFullName = (student: StudentWithScores) => {
    let name = student.firstName || '';
    if (student.middleInitial) name += ` ${student.middleInitial}.`;
    if (student.lastName) name += ` ${student.lastName}`;
    return name.trim() || student.username;
  };

  const getScoreForChapter = (student: StudentWithScores, chapterId: number) => {
    const score = student.scores.find(s => s.chapterId === chapterId);
    return score;
  };

  // Extract unique prefixes and numbers from section names
  const extractSectionParts = () => {
    const prefixes = new Set<string>();
    const allNumbers = new Set<string>();
    const prefixToNumbers = new Map<string, Set<string>>();

    sections.forEach(section => {
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

  const availableNumbers = selectedPrefix && prefixToNumbers.has(selectedPrefix)
    ? Array.from(prefixToNumbers.get(selectedPrefix)!).sort((a, b) => parseInt(a) - parseInt(b))
    : allNumbers;

  const filteredStudents = students.filter(student => {
    // Search filter
    const fullName = getFullName(student).toLowerCase();
    const username = student.username.toLowerCase();
    const search = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(search) || username.includes(search);

    // Section filters
    const sectionName = student.sectionName || '';
    let matchesPrefix = true;
    if (selectedPrefix) {
      const match = sectionName.match(/^([A-Z]+)/i);
      matchesPrefix = match ? match[1].toUpperCase() === selectedPrefix : false;
    }

    let matchesNumber = true;
    if (selectedNumber) {
      const match = sectionName.match(/(\d+)/);
      matchesNumber = match ? match[1] === selectedNumber : false;
    }

    // Chapter filter
    let matchesChapter = true;
    if (selectedChapter) {
      matchesChapter = student.scores.some(s => s.chapterId === selectedChapter);
    }

    return matchesSearch && matchesPrefix && matchesNumber && matchesChapter;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPrefix, selectedNumber, selectedChapter]);

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Chapters</h1>
            <p className="page-subtitle">View student quiz scores by chapter</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {/* Chapter Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {CHAPTERS.map((chapter) => {
            const studentsWithChapter = students.filter(s =>
              s.scores.some(score => score.chapterId === chapter.id)
            );
            const isSelected = selectedChapter === chapter.id;

            return (
              <div
                key={chapter.id}
                onClick={() => setSelectedChapter(isSelected ? null : chapter.id)}
                className="stat-card"
                style={{
                  cursor: 'pointer',
                  borderColor: isSelected ? chapter.color : '',
                  transform: isSelected ? 'translateY(-4px) scale(1.02)' : '',
                  boxShadow: isSelected ? `0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px ${chapter.color}20, 0 0 15px ${chapter.color}40` : ''
                }}
              >
                <div className="stat-icon" style={{
                  color: chapter.color,
                  border: `1px solid ${chapter.color}4d`,
                  background: `linear-gradient(135deg, ${chapter.color}33, ${chapter.color}0d)`,
                  boxShadow: `0 0 15px ${chapter.color}4d`
                }}>
                  <BookOpen size={28} />
                </div>
                <div className="stat-content">
                  <div className="stat-label" style={{
                    color: isSelected ? chapter.color : '',
                    textShadow: isSelected ? `0 0 10px ${chapter.color}80` : ''
                  }}>
                    {chapter.name.toUpperCase()}
                  </div>
                  <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    {studentsWithChapter.length}
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      fontWeight: 'normal',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      letterSpacing: 'normal',
                      textTransform: 'none',
                      textShadow: 'none'
                    }}>
                      student{studentsWithChapter.length !== 1 ? 's' : ''} completed
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters */}
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
                  setSelectedNumber('');
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
          {selectedChapter && (
            <button
              className="btn-secondary"
              onClick={() => setSelectedChapter(null)}
              style={{ marginLeft: '1rem' }}
            >
              Clear Chapter Filter
            </button>
          )}
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="table-container">
            <SkeletonTable rows={5} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={64} /></div>
            <h3>No quiz scores found</h3>
            <p>Students will appear here once they complete quizzes</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Section</th>
                  <th>Ch 1</th>
                  <th>Ch 2</th>
                  <th>Ch 3</th>
                  <th>Ch 4</th>
                  <th style={{ width: '50px' }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr
                    key={student.userId}
                    onClick={() => handleStudentClick(student)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="font-medium">{getFullName(student)}</td>
                    <td>{student.sectionName || '—'}</td>
                    {CHAPTERS.map((chapter) => {
                      const score = getScoreForChapter(student, chapter.id);
                      return (
                        <td key={chapter.id}>
                          {score ? (
                            <span style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                              background: score.percentage >= 80 ? '#064e3b' : score.percentage >= 60 ? '#422006' : '#7f1d1d',
                              color: score.percentage >= 80 ? '#6ee7b7' : score.percentage >= 60 ? '#fbbf24' : '#fca5a5'
                            }}>
                              {score.percentage.toFixed(0)}%
                            </span>
                          ) : (
                            <span style={{ color: '#64748b' }}>—</span>
                          )}
                        </td>
                      );
                    })}
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <ChevronRight size={20} color="#3b82f6" />
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
      </div>
    </Layout>
  );
}
