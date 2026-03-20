import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Edit2, Trash2, Users, ArrowLeft, UserPlus } from 'lucide-react';
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
}

export default function SectionsPage() {
  const { user } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({ sectionName: '' });
  const [studentFormData, setStudentFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    middleInitial: '',
    lastName: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSections();
  }, [user]);

  const fetchSections = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/sections/professor/${user.userId}`);
      
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

  const handleSectionClick = (section: Section) => {
    setSelectedSection(section);
    fetchStudents(section.sectionId);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setStudents([]);
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
            professorId: user?.userId 
          })
        });

        if (!response.ok) throw new Error('Failed to create section');
      }

      setShowModal(false);
      setFormData({ sectionName: '' });
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

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({ sectionName: section.sectionName });
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
    setFormData({ sectionName: '' });
    setShowModal(true);
  };

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
                <button className="btn-primary" onClick={() => setShowStudentModal(true)}>
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
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.userId}>
                        <td className="font-medium">{student.username}</td>
                        <td>
                          {student.firstName} {student.middleInitial ? `${student.middleInitial}. ` : ''}{student.lastName}
                        </td>
                        <td>{student.email}</td>
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
                    {sections.map((section) => (
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
                    onChange={(e) => setFormData({ sectionName: e.target.value })}
                    placeholder="e.g., CS101-A, Math 201"
                    required
                  />
                </div>
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
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Student to {selectedSection?.sectionName}</h2>
                <button className="modal-close" onClick={() => setShowStudentModal(false)}>×</button>
              </div>
              <form onSubmit={handleStudentSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Username *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={studentFormData.username}
                      onChange={(e) => setStudentFormData({ ...studentFormData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      value={studentFormData.password}
                      onChange={(e) => setStudentFormData({ ...studentFormData, password: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={studentFormData.email}
                    onChange={(e) => setStudentFormData({ ...studentFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={studentFormData.firstName}
                      onChange={(e) => setStudentFormData({ ...studentFormData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ maxWidth: '100px' }}>
                    <label className="form-label">M.I.</label>
                    <input
                      type="text"
                      className="form-input"
                      maxLength={1}
                      value={studentFormData.middleInitial}
                      onChange={(e) => setStudentFormData({ ...studentFormData, middleInitial: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
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
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowStudentModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Student
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
