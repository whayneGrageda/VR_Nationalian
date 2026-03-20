import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, GraduationCap, LogOut, TrendingUp, Trophy } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfessor = user?.roleId === 2;

  const menuItems = isProfessor
    ? [
        { path: '/professor', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/professor/sections', label: 'My Sections', icon: BookOpen },
        { path: '/professor/students', label: 'My Students', icon: Users },
        { path: '/professor/leaderboards', label: 'Leaderboards', icon: Trophy },
      ]
    : [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/sections', label: 'All Sections', icon: BookOpen },
        { path: '/admin/students', label: 'All Students', icon: Users },
        { path: '/admin/professors', label: 'All Professors', icon: GraduationCap },
        { path: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
        { path: '/admin/leaderboards', label: 'Leaderboards', icon: Trophy },
      ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">VR Nationalian</h1>
        <p className="sidebar-subtitle">Portal</p>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.firstName?.[0] || user?.username?.[0] || 'U'}</div>
        <div className="user-info">
          <div className="user-name">{user?.firstName || user?.username}</div>
          <div className="user-role">{user?.roleName}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon"><Icon size={20} /></span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"><LogOut size={20} /></span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
