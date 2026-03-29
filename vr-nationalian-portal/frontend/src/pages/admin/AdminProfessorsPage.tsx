import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Pagination from '../../components/Pagination';
import { GraduationCap, Edit2, Trash2, ArrowLeft, BookOpen, X, Archive, Calendar } from 'lucide-react';
import { SkeletonTable } from '../../components/Skeleton';
import '../shared/ManagementPage.css';

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
  const [selectedProfessors, setSelectedProfessors] = useState<Set<number>>(new Set());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    firstName: '',
    middleInitial: '',
    lastName: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

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
            email: formData.email,
            firstName: formData.firstName,
            middleInitial: formData.middleInitial || null,
            lastName: formData.lastName
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
      email: '',
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

  const handleArchive = async (userId: number) => {
    if (!confirm('Are you sure you want to archive this professor? They will no longer be able to access the system.')) return;

    try {
      const response = await fetch(`/api/users/${userId}/archive`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to archive professor');
      fetchProfessors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBulkArchive = async () => {
    if (selectedProfessors.size === 0) return;

    if (!confirm(`Are you sure you want to archive ${selectedProfessors.size} professor(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedProfessors).map(userId =>
          fetch(`/api/users/${userId}/archive`, { method: 'PATCH' })
        )
      );

      setSuccess(`${selectedProfessors.size} professor(s) archived successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedProfessors(new Set());
      fetchProfessors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleScheduleArchive = async () => {
    if (selectedProfessors.size === 0 || !scheduleDate || !scheduleTime) return;

    const scheduledDateTime = `${scheduleDate}T${scheduleTime}`;

    try {
      await Promise.all(
        Array.from(selectedProfessors).map(userId =>
          fetch(`/api/users/${userId}/schedule-archive`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scheduledArchiveDate: scheduledDateTime })
          })
        )
      );

      setSuccess(`Archive scheduled for ${selectedProfessors.size} professor(s)`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedProfessors(new Set());
      setShowScheduleModal(false);
      setScheduleDate('');
      setScheduleTime('');
      fetchProfessors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProfessors.size === 0) return;

    if (!confirm(`Are you sure you want to permanently delete ${selectedProfessors.size} professor(s)? This action cannot be undone.`)) return;

    try {
      await Promise.all(
        Array.from(selectedProfessors).map(userId =>
          fetch(`/api/professors/${userId}`, { method: 'DELETE' })
        )
      );

      setSuccess(`${selectedProfessors.size} professor(s) deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
      setSelectedProfessors(new Set());
      fetchProfessors();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleProfessorSelection = (userId: number) => {
    const newSelection = new Set(selectedProfessors);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedProfessors(newSelection);
  };

  // Moving toggleSelectAll closer to pagination logic

  const openCreateModal = () => {
    setEditingProfessor(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredProfessors.length / ITEMS_PER_PAGE);
  const paginatedProfessors = filteredProfessors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (paginatedProfessors.length === 0) return;
    
    const currentViewIds = paginatedProfessors.map(p => p.userId);
    const allSelectedInView = currentViewIds.every(id => selectedProfessors.has(id));
    
    if (allSelectedInView) {
      const newSelection = new Set(selectedProfessors);
      currentViewIds.forEach(id => newSelection.delete(id));
      setSelectedProfessors(newSelection);
    } else {
      const newSelection = new Set(selectedProfessors);
      currentViewIds.forEach(id => newSelection.add(id));
      setSelectedProfessors(newSelection);
    }
  };

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
        {success && <div className="success-banner">{success}</div>}

        {!loading && professors.length > 0 && (
          <>
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
            {selectedProfessors.size > 0 && (
              <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-warning" onClick={handleBulkArchive}>
                  <Archive size={16} />
                  Archive ({selectedProfessors.size})
                </button>
                <button className="btn btn-secondary" onClick={() => setShowScheduleModal(true)}>
                  <Calendar size={16} />
                  Schedule Archive
                </button>
                <button className="btn btn-danger" onClick={handleBulkDelete}>
                  <Trash2 size={16} />
                  Delete ({selectedProfessors.size})
                </button>
              </div>
            )}
          </>
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
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={paginatedProfessors.length > 0 && paginatedProfessors.every(p => selectedProfessors.has(p.userId))}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProfessors.map((professor) => (
                  <tr 
                    key={professor.userId}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedProfessors.has(professor.userId)}
                        onChange={() => toggleProfessorSelection(professor.userId)}
                      />
                    </td>
                    <td 
                      className="font-medium"
                      onClick={() => handleProfessorClick(professor)}
                      style={{ cursor: 'pointer' }}
                    >
                      {getFullName(professor)}
                    </td>
                    <td
                      onClick={() => handleProfessorClick(professor)}
                      style={{ cursor: 'pointer' }}
                    >
                      <code>{professor.username}</code>
                    </td>
                    <td
                      onClick={() => handleProfessorClick(professor)}
                      style={{ cursor: 'pointer' }}
                    >
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
                          className="btn-icon btn-archive" 
                          onClick={() => handleArchive(professor.userId)}
                          title="Archive"
                        >
                          <Archive size={16} />
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
        {!selectedProfessor && totalPages > 1 && (
          <div style={{ marginTop: '1rem' }}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredProfessors.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
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
                          placeholder="professor@example.com"
                          required
                        />
                      </div>
                    </>
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

        {showScheduleModal && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule Archive</h2>
                <button className="modal-close" onClick={() => setShowScheduleModal(false)}>×</button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                  Schedule {selectedProfessors.size} professor(s) to be archived on a specific date and time.
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
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
