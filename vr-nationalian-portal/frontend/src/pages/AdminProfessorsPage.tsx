import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { GraduationCap, Edit2, Trash2, ArrowLeft, BookOpen, X } from 'lucide-react';
import { SkeletonTable } from '../components/Skeleton';
import './ManagementPage.css';

interface Professor {
  userId: number;
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  createdAt?: string;
}

interface Section {
  sectionId: number;
  sectionName: string;
  professorId: number;
  createdAt: string;
}

export default function AdminProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [selectedSectionToAssign, setSelectedSectionToAssign] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    middleInitial: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfessors();
  }, []);

  const fetchProfessors = async () => {
    try {
      setLoading(true);
      // Note: This endpoint needs to be created in the backend
      const response = await fetch('/api/professors');
      if (response.ok) {
        const data = await response.json();
        setProfessors(data);
      }
    } catch (err) {
      setError('Failed to load professors');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessorSections = async (professorId: number) => {
    try {
      setLoadingSections(true);
      const [sectionsRes, allSectionsRes] = await Promise.all([
        fetch(`/api/sections/professor/${professorId}`),
        fetch('/api/sections')
      ]);
      
      if (!sectionsRes.ok) throw new Error('Failed to load sections');
      
      const professorSections = await sectionsRes.json();
      setSections(Array.isArray(professorSections) ? professorSections : []);
      
      if (allSectionsRes.ok) {
        const all = await allSectionsRes.json();
        setAllSections(Array.isArray(all) ? all : []);
      }
    } catch (err) {
      setError((err as Error).message);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleProfessorClick = (professor: Professor) => {
    setSelectedProfessor(professor);
    fetchProfessorSections(professor.userId);
  };

  const handleBackToProfessors = () => {
    setSelectedProfessor(null);
    setSections([]);
    setAllSections([]);
  };

  const handleAssignSection = async () => {
    if (!selectedProfessor || !selectedSectionToAssign) return;

    try {
      const response = await fetch(`/api/sections/${selectedSectionToAssign}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: selectedProfessor.userId
        })
      });

      if (!response.ok) throw new Error('Failed to assign section');
      
      setShowAssignModal(false);
      setSelectedSectionToAssign('');
      fetchProfessorSections(selectedProfessor.userId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleRevokeSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to revoke access to this section? The section will become unassigned.')) return;

    if (!selectedProfessor) return;

    try {
      // Set professor_id to null to unassign
      const response = await fetch(`/api/sections/${sectionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          professorId: null
        })
      });

      if (!response.ok) throw new Error('Failed to revoke section access');
      
      fetchProfessorSections(selectedProfessor.userId);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProfessor) {
        const response = await fetch(`/api/professors/${editingProfessor.userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            firstName: formData.firstName,
            middleInitial: formData.middleInitial || null,
            lastName: formData.lastName
          })
        });

        if (!response.ok) throw new Error('Failed to update professor');
      } else {
        const response = await fetch('/api/professors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
            firstName: formData.firstName,
            middleInitial: formData.middleInitial || null,
            lastName: formData.lastName,
            roleId: 2
          })
        });

        if (!response.ok) throw new Error('Failed to create professor');
      }

      setShowModal(false);
      resetForm();
      fetchProfessors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      username: professor.username,
      password: '',
      firstName: professor.firstName || '',
      middleInitial: professor.middleInitial || '',
      lastName: professor.lastName || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this professor? All their sections will remain but be unassigned.')) return;

    try {
      const response = await fetch(`/api/professors/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete professor');
      fetchProfessors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const openCreateModal = () => {
    setEditingProfessor(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      firstName: '',
      middleInitial: '',
      lastName: ''
    });
  };

  const getFullName = (professor: Professor) => {
    if (!professor.firstName && !professor.lastName) return professor.username;
    let name = professor.firstName || '';
    if (professor.middleInitial) name += ` ${professor.middleInitial}.`;
    if (professor.lastName) name += ` ${professor.lastName}`;
    return name.trim();
  };

  // Get sections that can be assigned (not already assigned to this professor)
  const availableSections = allSections.filter(
    section => !sections.some(s => s.sectionId === section.sectionId)
  );

  const filteredProfessors = professors.filter(professor => {
    const fullName = getFullName(professor).toLowerCase();
    const username = professor.username.toLowerCase();
    const search = searchQuery.toLowerCase();
    return fullName.includes(search) || username.includes(search);
  });

  return (
    <Layout>
      <div className="management-page">
        {selectedProfessor ? (
          // Professor Sections View
          <>
            <div style={{ marginBottom: '2rem' }}>
              <button className="btn-back" onClick={handleBackToProfessors}>
                <ArrowLeft size={20} />
                Back to Professors
              </button>
              <div className="page-header" style={{ marginBottom: 0 }}>
                <div>
                  <h1 className="page-title">{getFullName(selectedProfessor)}</h1>
                  <p className="page-subtitle">Sections managed by this professor</p>
                </div>
                <button className="btn-primary" onClick={() => setShowAssignModal(true)}>
                  + Assign Section
                </button>
              </div>
            </div>

            {error && <div className="error-banner">{error}</div>}

            {loadingSections ? (
              <div className="table-container">
                <SkeletonTable rows={5} />
              </div>
            ) : sections.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><BookOpen size={64} /></div>
                <h3>No sections yet</h3>
                <p>This professor hasn't created any sections yet</p>
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
                      <tr key={section.sectionId}>
                        <td className="font-medium">{section.sectionName}</td>
                        <td>{new Date(section.createdAt).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-icon btn-delete" 
                              onClick={() => handleRevokeSection(section.sectionId)}
                              title="Revoke Access"
                            >
                              <X size={16} />
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
        ) : (
          // Professors List View
          <>
        <div className="page-header">
          <div>
            <h1 className="page-title">Professors</h1>
            <p className="page-subtitle">Manage professor accounts</p>
          </div>
          <button className="btn-primary" onClick={openCreateModal}>
            + Add Professor
          </button>
        </div>

        {error && <div className="error-banner">{error}</div>}

        {!loading && professors.length > 0 && (
          <div className="filter-bar">
            <label className="filter-label">Search:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search professors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
          </div>
        )}

        {loading ? (
          <div className="table-container">
            <SkeletonTable rows={5} />
          </div>
        ) : professors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><GraduationCap size={64} /></div>
            <h3>No professors yet</h3>
            <p>Add your first professor to get started</p>
            <button className="btn-primary" onClick={openCreateModal}>
              Add Professor
            </button>
          </div>
        ) : filteredProfessors.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><GraduationCap size={64} /></div>
            <h3>No professors found</h3>
            <p>No professors match your search</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProfessors.map((professor) => (
                  <tr 
                    key={professor.userId}
                    onClick={() => handleProfessorClick(professor)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="font-medium">{getFullName(professor)}</td>
                    <td><code>{professor.username}</code></td>
                    <td>
                      {professor.createdAt 
                        ? new Date(professor.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="btn-icon btn-edit" 
                          onClick={() => handleEdit(professor)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-icon btn-delete" 
                          onClick={() => handleDelete(professor.userId)}
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
                <h2>{editingProfessor ? 'Edit Professor' : 'Add Professor'}</h2>
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
                      placeholder="professor123"
                      required
                    />
                  </div>
                  {!editingProfessor && (
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
                  )}
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
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
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingProfessor ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAssignModal && selectedProfessor && (
          <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Assign Section to {getFullName(selectedProfessor)}</h2>
                <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Select Section</label>
                  <select
                    className="form-input"
                    value={selectedSectionToAssign}
                    onChange={(e) => setSelectedSectionToAssign(e.target.value)}
                  >
                    <option value="">Choose a section...</option>
                    {availableSections.map((section) => (
                      <option key={section.sectionId} value={section.sectionId}>
                        {section.sectionName}
                      </option>
                    ))}
                  </select>
                  {availableSections.length === 0 && (
                    <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      All sections are already assigned to this professor
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={handleAssignSection}
                  disabled={!selectedSectionToAssign}
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
