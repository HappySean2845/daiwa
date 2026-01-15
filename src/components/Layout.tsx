import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, ListTodo, Bot, Clock, Settings } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/tasks', icon: ListTodo, label: '任务' },
  { path: '/ai', icon: Bot, label: 'AI顾问' },
  { path: '/rest', icon: Clock, label: '休息' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-item ${location.pathname === path ? 'active' : ''}`}
          >
            <Icon size={24} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
