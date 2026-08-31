import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LayoutDashboard, Calculator, Users, BarChart3, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/quoters', icon: Calculator, label: 'Quoters' },
  { to: '/dashboard/leads', icon: Users, label: 'Leads' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
  const { signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-brand-600/10 text-brand-500'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-white/5">
        <img src="/image.png" alt="SureQuote AI" className="h-8 w-auto" />
        <span className="text-base font-bold text-white">SureQuote<span className="text-brand-500">AI</span></span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-4">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <aside className="hidden lg:block w-64 bg-gray-900/50 border-r border-white/5 fixed inset-y-0 left-0">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-gray-900 h-full">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 lg:px-8 h-14 flex items-center lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="ml-3 text-sm font-bold text-white">SureQuote<span className="text-brand-500">AI</span></span>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
