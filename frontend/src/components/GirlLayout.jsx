import { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { ACTIVITY_CATEGORIES } from '../constants/activityCategories';
import './GirlLayout.css';

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=user';

export default function GirlLayout({ profile, me, children }) {
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const myName = me ? `${me.name || ''} ${me.surname || ''}`.trim() || 'Profilim' : 'Profilim';
  const myPhoto = (me && me.profilePhotoUrl) || DEFAULT_AVATAR;
  const girlName = profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : '';
  const girlPhoto = (profile && profile.photoUrl) || DEFAULT_AVATAR;

  return (
    <div className="girl-layout">
      <aside className={`girl-sidebar ${sidebarOpen ? 'girl-sidebar--open' : 'girl-sidebar--closed'}`}>
        <div className="girl-sidebar-accent" />
        <button
          type="button"
          className="girl-sidebar-toggle"
          onClick={() => setSidebarOpen((o) => !o)}
          title={sidebarOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-label={sidebarOpen ? 'Kapat' : 'Aç'}
        >
          <span className="girl-sidebar-toggle-icon">{sidebarOpen ? '‹' : '›'}</span>
        </button>
        <div className="girl-sidebar-content">
          <div className="girl-sidebar-header">
            <img src="/logo.png" alt="Timely Love" className="girl-sidebar-logo" />
            {sidebarOpen && (
              <p className="girl-sidebar-title">Birlikte yapacaklarımız</p>
            )}
          </div>
          <nav className="girl-sidebar-nav">
            <NavLink
              to={`/profile/girl/${id}`}
              end
              className={({ isActive }) => `girl-sidebar-link ${isActive ? 'girl-sidebar-link--active' : ''}`}
            >
              <span className="girl-sidebar-link-icon-wrap girl-sidebar-link-icon-wrap--calendar">
                <span className="girl-sidebar-link-icon">📅</span>
              </span>
              {sidebarOpen && <span className="girl-sidebar-link-label">Takvim</span>}
            </NavLink>
            {sidebarOpen && <div className="girl-sidebar-divider" />}
            {ACTIVITY_CATEGORIES.map((cat) => (
              <NavLink
                key={cat.key}
                to={`/profile/girl/${id}/activity/${cat.key}`}
                className={({ isActive }) => `girl-sidebar-link ${isActive ? 'girl-sidebar-link--active' : ''}`}
              >
                <span className={`girl-sidebar-link-icon-wrap girl-sidebar-link-icon-wrap--${cat.key}`}>
                  <span className="girl-sidebar-link-icon">{cat.icon}</span>
                </span>
                {sidebarOpen && <span className="girl-sidebar-link-label">{cat.label}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="girl-sidebar-footer">
            <div className="girl-sidebar-footer-label">{sidebarOpen && 'Hesabım'}</div>
            <Link to="/profile" className="girl-sidebar-me">
              <img src={myPhoto} alt="" className="girl-sidebar-me-avatar" />
              {sidebarOpen && <span className="girl-sidebar-me-name">{myName}</span>}
            </Link>
          </div>
        </div>
      </aside>
      <div className="girl-layout-main">
        <Link to="/profile" className="girl-layout-logo">
          <img src="/logo.png" alt="Timely Love" />
        </Link>
        {profile && (
          <div className="girl-corner-profile">
            <img src={girlPhoto} alt="" className="girl-corner-avatar" />
            <span className="girl-corner-name">{girlName}</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
