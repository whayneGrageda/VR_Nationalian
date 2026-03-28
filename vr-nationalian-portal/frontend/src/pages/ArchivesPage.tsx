import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { Archive, RefreshCw, Trash2, Users, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SkeletonTable } from '../components/Skeleton';
import './ManagementPage.css';

interface ArchivedUser {
  userId: string;
  username: string;
  email: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  roleId: number;
  roleName: string;
  sectionId?: string;
  sectionName?: string;
  scheduledArchiveDate?: string;
  createdAt: string;
}

export default function ArchivesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<ArchivedUser[]>([]);
  const [professors, setProfessors] = useState<ArchivedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'students' | 'professors'>('students');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const isAdmin = user?.roleId === 3;

  useEffect(() => {
    fetchArchivedUsers();
  }, [user]);

  useEffect(() => {
    // Extract unique sections from students
    const uniqueSections = new Set<string>();
    students.forEach(student => {
      if (student.sectionName) {
        uniqueSections.add(student.sectionName);
      }
    });
    setSections(Array.from(uniqueSections).sort());
  }, [students]);

  const fetchArchivedUsers = async () => {
    try {
      setLoading(true);
      setError('');

      if (isAdmin) {
        const [studentsRes, professorsRes] = await Promise.all([
          fetch('/api/students/archived'),
          fetch('/api/professors/archived')
        ]);

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          setStudents(studentsData);
        }

        if (professorsRes.ok) {
          const professorsData = await professorsRes.json();
          setProfessors(professorsData);
        }
      } else {
        // Professor can only see their archived students
        const response = await fetch(`/api/students/archived/professor/${user?.userId}`);
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (userId: string) => {
    const user = currentList.find(u => u.userId === userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : 'this user';
    
    if (!confirm(`Are you sure you want to reactivate ${userName}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}/reactivate`, {
        method: 'PATCH'
      });

      if (!response.ok) throw new Error('Failed to reactivate user');

      setSuccess('User reactivated successfully');
      fetchArchivedUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const endpoint = activeTab === 'students' 
        ? `/api/students/${userId}`
        : `/api/professors/${userId}`;

      const response = await fetch(endpoint, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setSuccess('User deleted successfully');
      fetchArchivedUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBulkReactivate = async () => {
    if (selectedUsers.size === 0) return;

    if (!confirm(`Are you sure you want to reactivate ${selectedUsers.size} user(s)?`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedUsers).map(userId =>
          fetch(`/api/users/${userId}/reactivate`, { method: 'PATCH' })
        )
      );

      setSuccess(`${selectedUsers.size} user(s) reactivated successfully`);
      setSelectedUsers(new Set());
      fetchArchivedUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) return;

    if (!confirm(`Are you sure you want to permanently delete ${selectedUsers.size} user(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedUsers).map(userId => {
          const endpoint = activeTab === 'students'
            ? `/api/students/${userId}`
            : `/api/professors/${userId}`;
          return fetch(endpoint, { method: 'DELETE' });
        })
      );

      setSuccess(`${selectedUsers.size} user(s) deleted successfully`);
      setSelectedUsers(new Set());
      fetchArchivedUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  // toggleSelectAll moved down

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = !selectedSection || student.sectionName === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  const filteredProfessors = professors.filter(prof =>
    prof.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${prof.firstName} ${prof.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentList = activeTab === 'students' ? filteredStudents : filteredProfessors;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSection, activeTab]);

  const totalPages = Math.ceil(currentList.length / ITEMS_PER_PAGE);
  const paginatedList = currentList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSelectAll = () => {
    if (paginatedList.length === 0) return;
    
    const currentViewIds = paginatedList.map(u => u.userId);
    const allSelectedInView = currentViewIds.every(id => selectedUsers.has(id));
    
    if (allSelectedInView) {
      const newSelection = new Set(selectedUsers);
      currentViewIds.forEach(id => newSelection.delete(id));
      setSelectedUsers(newSelection);
    } else {
      const newSelection = new Set(selectedUsers);
      currentViewIds.forEach(id => newSelection.add(id));
      setSelectedUsers(newSelection);
    }
  };

  return (
    <Layout>
      <div className="management-page">
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Archive size={32} style={{ marginRight: '0.75rem' }} />
              Archives
            </h1>
            <p className="page-subtitle">Manage archived users</p>
          </div>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}

        {isAdmin && (
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('students');
                setSelectedUsers(new Set());
                setSelectedSection('');
              }}
            >
              <Users size={20} />
              Students ({students.length})
            </button>
            <button
              className={`tab ${activeTab === 'professors' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('professors');
                setSelectedUsers(new Set());
                setSelectedSection('');
              }}
            >
              <GraduationCap size={20} />
              Professors ({professors.length})
            </button>
          </div>
        )}

        {(activeTab === 'students' ? students.length : professors.length) > 0 && (
          <div className="filter-bar">
            <label className="filter-label">Search:</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search archived users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            {activeTab === 'students' && sections.length > 0 && (
              <>
                <label className="filter-label" style={{ marginLeft: '1rem' }}>Section:</label>
                <select
                  className="filter-select"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  style={{ minWidth: '150px' }}
                >
                  <option value="">All Sections</option>
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        )}

        {selectedUsers.size > 0 && (
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleBulkReactivate}>
              <RefreshCw size={16} />
              Reactivate ({selectedUsers.size})
            </button>
            {isAdmin && (
              <button className="btn btn-danger" onClick={handleBulkDelete}>
                <Trash2 size={16} />
                Delete ({selectedUsers.size})
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="table-container">
            <SkeletonTable rows={5} />
          </div>
        ) : currentList.length === 0 ? (
          <div className="empty-state">
            <Archive size={48} />
            <p>No archived {activeTab}</p>
          </div>
        ) : (
          <div className="table-container">
              <table className="data-table">
              <thead>
                  <tr>
                    <th style={{ width: '40px' }}>
                      <input
                        type="checkbox"
                        checked={paginatedList.length > 0 && paginatedList.every(u => selectedUsers.has(u.userId))}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    {activeTab === 'students' && <th>Section</th>}
                    <th>Scheduled Archive</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.map((user) => (
                    <tr key={user.userId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.userId)}
                          onChange={() => toggleUserSelection(user.userId)}
                        />
                      </td>
                      <td>{user.username}</td>
                      <td>
                        {user.firstName} {user.middleInitial ? `${user.middleInitial}. ` : ''}{user.lastName}
                      </td>
                      <td>{user.email}</td>
                      {activeTab === 'students' && <td>{user.sectionName || 'N/A'}</td>}
                      <td>
                        {user.scheduledArchiveDate
                          ? new Date(user.scheduledArchiveDate).toLocaleDateString()
                          : 'Manual'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-archive"
                            onClick={() => handleReactivate(user.userId)}
                            title="Reactivate"
                          >
                            <RefreshCw size={16} />
                          </button>
                          {isAdmin && (
                            <button
                              className="btn-icon btn-danger"
                              onClick={() => handleDelete(user.userId)}
                              title="Delete Permanently"
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
          
          {!loading && currentList.length > 0 && totalPages > 1 && (
            <div style={{ marginTop: '1rem' }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={currentList.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </div>
          )}
      </div>
    </Layout>
  );
}
