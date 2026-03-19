import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { GraduationCap, Edit2, Trash2 } from 'lucide-react';
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

export default function AdminProfessorsPage() {
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    firstName: '',
    middleInitial: '',
    lastName: ''
  });
  const [error, setError] = useState('');

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

  return (
    <Layout>
      <div className="management-page">
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
                {professors.map((professor) => (
                  <tr key={professor.userId}>
                    <td className="font-medium">{getFullName(professor)}</td>
                    <td><code>{professor.username}</code></td>
                    <td>
                      {professor.createdAt 
                        ? new Date(professor.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      <div className="action-buttons">
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
      </div>
    </Layout>
  );
}
