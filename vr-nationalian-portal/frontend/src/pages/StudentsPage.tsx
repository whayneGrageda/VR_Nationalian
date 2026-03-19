import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { Users, BookOpen, Edit2, Trash2 } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import './ManagementPage.css';

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

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
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
  const isAdmin = user?.roleName === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchAllStudents();
      fetchAllSections();
    } else {
      fetchSections();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (!isAdmin && selectedSection) {
      fetchStudents(selectedSection);
    }
  }, [selectedSection, isAdmin]);

  const fetchAllSections = async () => {
    try {
      // For admin, we need to fetch all sections from all professors
      // Since we don't have a /sections/all endpoint, we'll fetch from the sections table directly
      // For now, let's skip this and just use the sections from the create modal
      setSections([]);
    } catch (err) {
      console.error('Failed to load all sections');
    }
  };

  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load students');
      }
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/sections/professor/${user.userId}`);
      const data = await response.json();
      setSections(data);
      if (data.length > 0) {
        setSelectedSection(data[0].sectionId);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load sections');
      setLoading(false);
    }
  };

  const fetchStudents = async (sectionId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/students/section/${sectionId}`);
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
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

        if (!response.ok) throw new Error('Failed to update student');
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

        if (!response.ok) throw new Error('Failed to create student');
      }

      setShowModal(false);
      resetForm();
      if (selectedSection) fetchStudents(selectedSection);
    } catch (err) {
      setError((err as Error).message);
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

      if (!response.ok) throw new Error('Failed to delete student');
      if (isAdmin) {
        fetchAllStudents();
      } else if (selectedSection) {
        fetchStudents(selectedSection);
      }
    } catch (err) {
      setError((err as Error).message);
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
      if (response.ok) {
        const allSections = await response.json();
        setSections(allSections);
      }
    } catch (err) {
      console.error('Failed to load sections for modal');
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
      sectionId: selectedSection || ''
    });
  };

  const getFullName = (student: Student) => {
    let name = student.firstName;
    if (student.middleInitial) name += ` ${student.middleInitial}.`;
    name += ` ${student.lastName}`;
    return name;
  };

  return (
    <Layout>
      <div className="management-page">
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

        {sections.length === 0 && !isAdmin ? (
          <div className="empty-state">
            <div className="empty-icon"><BookOpen size={64} /></div>
            <h3>No sections available</h3>
            <p>Create a section first before adding students</p>
          </div>
        ) : (
          <>
            {!isAdmin && (
              <div className="filter-bar">
                <label className="filter-label">Section:</label>
                <select 
                  className="filter-select"
                  value={selectedSection || ''}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  {sections.map((section) => (
                    <option key={section.sectionId} value={section.sectionId}>
                      {section.sectionName}
                    </option>
                  ))}
                </select>
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
                      <th>Name</th>
                      <th>Username</th>
                      {isAdmin && <th>Section</th>}
                      <th>Email</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.userId}>
                        <td className="font-medium">{getFullName(student)}</td>
                        <td><code>{student.username}</code></td>
                        {isAdmin && (
                          <td>
                            {student.sectionName || sections.find(s => s.sectionId === student.sectionId)?.sectionName || 'No Section'}
                          </td>
                        )}
                        <td>{student.email || '—'}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon btn-edit" 
                              onClick={() => handleEdit(student)}
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="btn-icon btn-delete" 
                              onClick={() => handleDelete(student.userId)}
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
      </div>
    </Layout>
  );
}
