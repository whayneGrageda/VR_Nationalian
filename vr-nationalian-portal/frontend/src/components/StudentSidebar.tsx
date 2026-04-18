import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Award, FileText, Settings, LogOut, Trophy, QrCode } from 'lucide-react';
import './Sidebar.css';

export default function StudentSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/student/achievements', label: 'Achievements', icon: Award },
    { path: '/student/leaderboards', label: 'Leaderboards', icon: Trophy },
    { path: '/student/assessments', label: 'Assessment Results', icon: FileText },
    { path: '/student/settings', label: 'Settings', icon: Settings },
    { path: '/student/qr-code', label: 'QR Code', icon: QrCode },
  ];

  const getFullName = () => {
    if (!user) return 'Student';
    let name = user.firstName || user.username;
    if (user.middleInitial) name += ` ${user.middleInitial}.`;
    if (user.lastName) name += ` ${user.lastName}`;
    return name;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">VR Nationalian</h1>
        <p className="sidebar-subtitle">Student Portal</p>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.firstName?.[0] || user?.username?.[0] || 'S'}</div>
        <div className="user-info">
          <div className="user-name">{getFullName()}</div>
          <div className="user-role">Student</div>
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
