import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Edit2, Trash2, Users, ArrowLeft, UserPlus, ChevronRight } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import './ManagementPage.css';

interface Section {
  sectionId: number;
  sectionName: string;
  professorId?: number;
  createdAt: string;
}

interface Student {
  userId: string;
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  email?: string;
  sectionId?: string;
}

export default function SectionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [studentMode, setStudentMode] = useState<'create' | 'existing'>('create');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({ 
    sectionName: '',
    professorId: '' 
  });
  const [professors, setProfessors] = useState<Array<{ userId: string; username: string; firstName?: string; lastName?: string }>>([]);
  const [studentFormData, setStudentFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    middleInitial: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const isAdmin = user?.roleName === 'admin';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefix, setSelectedPrefix] = useState('');
  const [selectedNumber, setSelectedNumber] = useState('');

  useEffect(() => {
    fetchSections();
    if (isAdmin) {
      fetchProfessors();
    }
  }, [user]);

  const fetchProfessors = async () => {
    try {
      const response = await fetch('/api/professors');
      if (response.ok) {
        const data = await response.json();
        setProfessors(data);
      }
    } catch (err) {
      console.error('Failed to fetch professors:', err);
    }
  };

  const fetchSections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Admin gets all sections, professor gets only their sections
      const endpoint = isAdmin 
        ? '/api/sections' 
        : `/api/sections/professor/${user.userId}`;
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load sections');
      }
      
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch sections error:', err);
      setError((err as Error).message);
      setSections([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (sectionId: number) => {
    try {
      setLoadingStudents(true);
      const response = await fetch(`/api/students/section/${sectionId}`);
      
      if (!response.ok) throw new Error('Failed to load students');
      
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch students error:', err);
      setError((err as Error).message);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchAllStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setAllStudents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch all students:', err);
    }
  };

  const handleSectionClick = (section: Section) => {
    setSelectedSection(section);
    fetchStudents(section.sectionId);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setStudents([]);
  };

  const handleStudentClick = (student: Student) => {
    // Navigate to students page with this student's assessment view
    // Use role-based path
    const studentsPath = isAdmin ? '/admin/students' : '/professor/students';
    navigate(studentsPath, { state: { selectedStudent: student } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingSection) {
        const response = await fetch(`/api/sections/${editingSection.sectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionName: formData.sectionName })
        });

        if (!response.ok) throw new Error('Failed to update section');
      } else {
        const response = await fetch('/api/sections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sectionName: formData.sectionName,
            professorId: isAdmin ? (formData.professorId || null) : user?.userId 
          })
        });

        if (!response.ok) throw new Error('Failed to create section');
      }

      setShowModal(false);
      setFormData({ sectionName: '', professorId: '' });
      setEditingSection(null);
      fetchSections();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSection) return;

    try {
      // Create new student
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...studentFormData,
          sectionId: selectedSection.sectionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create student');
      }

      setShowStudentModal(false);
      setStudentMode('create');
      setStudentSearchQuery('');
      setStudentFormData({
        username: '',
        password: '',
        email: '',
        firstName: '',
        middleInitial: '',
        lastName: ''
      });
      fetchStudents(selectedSection.sectionId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAssignExistingStudent = async (studentId: string) => {
    if (!selectedSection) return;
    setError('');

    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: selectedSection.sectionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign student');
      }

      setShowStudentModal(false);
      setStudentMode('create');
      setStudentSearchQuery('');
      fetchStudents(selectedSection.sectionId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({ 
      sectionName: section.sectionName,
      professorId: section.professorId?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section? All students will be unassigned.')) return;

    try {
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete section');
      fetchSections();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openCreateModal = () => {
    setEditingSection(null);
    setFormData({ sectionName: '', professorId: '' });
    setShowModal(true);
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

  const filteredSections = sections.filter(section => {
    const matchesSearch = section.sectionName.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check prefix filter
    let matchesPrefix = true;
    if (selectedPrefix) {
      const match = section.sectionName.match(/^([A-Z]+)/i);
      matchesPrefix = match ? match[1].toUpperCase() === selectedPrefix : false;
    }
    
    // Check number filter
    let matchesNumber = true;
    if (selectedNumber) {
      const match = section.sectionName.match(/(\d+)/);
      matchesNumber = match ? match[1] === selectedNumber : false;
    }
    
    return matchesSearch && matchesPrefix && matchesNumber;
  });

  return (
    <Layout>
      <div className="management-page">
        {selectedSection ? (
          // Student List View
          <>
            <div style={{ marginBottom: '2rem' }}>
              <button className="btn-back" onClick={handleBackToSections}>
                <ArrowLeft size={20} />
                Back to Sections
              </button>
              <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                  <h1 className="page-title">{selectedSection.sectionName}</h1>
                  <p className="page-subtitle">Manage students in this section</p>
                </div>
                <button className="btn-primary" onClick={() => setShowStudentModal(true)}>
                  <UserPlus size={20} />
                  Add Student
                </button>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loadingStudents ? (
              <div className="table-container">
                <SkeletonTable rows={5} />
              </div>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Users size={64} /></div>
                <h3>No students yet</h3>
                <p>Add students to this section to get started</p>
                <button className="btn-primary" onClick={() => {
                  setStudentMode('create');
                  setStudentSearchQuery('');
                  if (isAdmin) fetchAllStudents();
                  setShowStudentModal(true);
                }}>
                  <UserPlus size={20} />
                  Add Student
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th style={{ width: '50px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr 
                        key={student.userId}
                        onClick={() => handleStudentClick(student)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-medium">{student.username}</td>
                        <td>
                          {student.firstName} {student.middleInitial ? `${student.middleInitial}. ` : ''}{student.lastName}
                        </td>
                        <td>{student.email}</td>
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
          </>
        ) : (
          // Sections List View
          <>
            <div className="page-header">
              <div>
                <h1 className="page-title">Sections</h1>
                <p className="page-subtitle">Manage your class sections</p>
              </div>
              <button className="btn-primary" onClick={openCreateModal}>
                + Create Section
              </button>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {!loading && sections.length > 0 && (
              <div className="filter-bar">
                <label className="filter-label">Search:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search sections..."
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
            )}

            {loading ? (
              <div className="table-container">
                <SkeletonTable rows={5} />
              </div>
            ) : sections.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><BookOpen size={64} /></div>
                <h3>No sections yet</h3>
                <p>Create your first section to start managing students</p>
                <button className="btn-primary" onClick={openCreateModal}>
                  Create Section
                </button>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><BookOpen size={64} /></div>
                <h3>No sections found</h3>
                <p>No sections match your search</p>
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Section Name</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSections.map((section) => (
                      <tr 
                        key={section.sectionId}
                        onClick={() => handleSectionClick(section)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="font-medium">{section.sectionName}</td>
                        <td>{new Date(section.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="btn-icon btn-edit" 
                              onClick={() => handleEdit(section)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="btn-icon btn-delete" 
                              onClick={() => handleDelete(section.sectionId)}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingSection ? 'Edit Section' : 'Create Section'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Section Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.sectionName}
                    onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                    placeholder="e.g., CS101-A, Math 201"
                    required
                  />
                </div>
                {isAdmin && !editingSection && (
                  <div className="form-group">
                    <label className="form-label">Professor (Optional)</label>
                    <select
                      className="form-input"
                      value={formData.professorId}
                      onChange={(e) => setFormData({ ...formData, professorId: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {professors.map((prof) => (
                        <option key={prof.userId} value={prof.userId}>
                          {prof.firstName && prof.lastName 
                            ? `${prof.firstName} ${prof.lastName} (${prof.username})`
                            : prof.username}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingSection ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showStudentModal && (
          <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
            <div 
              className="modal modal-large"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '800px', width: '90%' }}
            >
              <div className="modal-header">
                <h2>Add Student to {selectedSection?.sectionName}</h2>
                <button className="modal-close" onClick={() => setShowStudentModal(false)}>×</button>
              </div>
              
              {/* Mode Toggle */}
              <div style={{ padding: '1.5rem 1.5rem 0' }}>
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  background: '#1e293b', 
                  padding: '0.25rem', 
                  borderRadius: '6px',
                  marginBottom: '1.5rem'
                }}>
                  <button
                    type="button"
                    onClick={() => setStudentMode('create')}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      background: studentMode === 'create' ? '#3b82f6' : 'transparent',
                      color: studentMode === 'create' ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    Create New
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('existing');
                      if (isAdmin) fetchAllStudents();
                    }}
                    style={{
                      flex: 1,
                      padding: '0.5rem 1rem',
                      background: studentMode === 'existing' ? '#3b82f6' : 'transparent',
                      color: studentMode === 'existing' ? '#fff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      fontFamily: 'inherit',
                      transition: 'all 0.2s'
                    }}
                  >
                    Add Existing
                  </button>
                </div>
              </div>

              <form onSubmit={handleStudentSubmit}>
                {studentMode === 'create' ? (
                  <>
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(3, 1fr)', 
                        gap: '1rem',
                        marginBottom: '1rem'
                      }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Username *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={studentFormData.username}
                            onChange={(e) => setStudentFormData({ ...studentFormData, username: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Password *</label>
                          <input
                            type="password"
                            className="form-input"
                            value={studentFormData.password}
                            onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-input"
                            value={studentFormData.email}
                            onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 100px 1fr', 
                        gap: '1rem'
                      }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">First Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={studentFormData.firstName}
                            onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">M.I.</label>
                          <input
                            type="text"
                            className="form-input"
                            maxLength={1}
                            value={studentFormData.middleInitial}
                            onChange={(e) => setStudentFormData({ ...studentFormData, middleInitial: e.target.value })}
                          />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label className="form-label">Last Name *</label>
                          <input
                            type="text"
                            className="form-input"
                            value={studentFormData.lastName}
                            onChange={(e) => setStudentFormData({ ...studentFormData, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn-secondary" onClick={() => setShowStudentModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Create Student
                      </button>
                    </div>
                  </>
                ) : null}
              </form>

              {studentMode === 'existing' && (
                <>
                  <div style={{ padding: '0 1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Search Students</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name or username..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ 
                    padding: '0 1.5rem 1.5rem',
                    maxHeight: '600px',
                    overflowY: 'auto',
                    overflowX: 'hidden'
                  }}>
                    {(() => {
                      const unassignedStudents = allStudents
                        .filter(s => !s.sectionId || s.sectionId === '')
                        .filter(s => {
                          if (!studentSearchQuery) return true;
                          const search = studentSearchQuery.toLowerCase();
                          const fullName = `${s.firstName} ${s.middleInitial || ''} ${s.lastName}`.toLowerCase();
                          const username = s.username.toLowerCase();
                          return fullName.includes(search) || username.includes(search);
                        });

                      if (unassignedStudents.length === 0) {
                        return (
                          <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#64748b'
                          }}>
                            <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                            <p>{studentSearchQuery ? 'No students match your search' : 'No unassigned students available'}</p>
                          </div>
                        );
                      }

                      return (
                        <>
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem'
                          }}>
                            {unassignedStudents.map((student) => (
                              <div
                                key={student.userId}
                                onClick={() => handleAssignExistingStudent(student.userId)}
                                style={{
                                  padding: '1rem',
                                  background: '#1e293b',
                                  border: '1px solid #334155',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#334155';
                                  e.currentTarget.style.borderColor = '#3b82f6';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#1e293b';
                                  e.currentTarget.style.borderColor = '#334155';
                                }}
                              >
                                <div style={{ 
                                  fontWeight: 600, 
                                  color: '#e2e8f0',
                                  marginBottom: '0.25rem'
                                }}>
                                  {student.firstName} {student.middleInitial ? `${student.middleInitial}. ` : ''}{student.lastName}
                                </div>
                                <div style={{ 
                                  fontSize: '0.875rem',
                                  color: '#94a3b8'
                                }}>
                                  <code style={{ 
                                    background: '#0f172a',
                                    padding: '0.125rem 0.375rem',
                                    borderRadius: '3px'
                                  }}>
                                    {student.username}
                                  </code>
                                  {student.email && (
                                    <span style={{ marginLeft: '0.5rem' }}>• {student.email}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {unassignedStudents.length > 5 && (
                            <div style={{
                              textAlign: 'center',
                              padding: '1rem 0 0',
                              color: '#64748b',
                              fontSize: '0.875rem'
                            }}>
                              Showing {unassignedStudents.length} unassigned student{unassignedStudents.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowStudentModal(false)}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
