import React from 'react';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
  Folder,
  Tag,
  GraduationCap,
  Rocket,
  FileCheck,
  MonitorPlay,
  BookOpen,
  User,
} from 'lucide-react';
import { TaskCategory } from '../../shared/types';
import { CATEGORY_LABELS } from '../../shared/constants';

export type DashboardTab = 'today' | 'upcoming' | 'overdue' | 'completed' | 'category' | 'settings';

interface SidebarProps {
  currentTab: DashboardTab;
  selectedCategory: TaskCategory | null;
  onSelectTab: (tab: DashboardTab) => void;
  onSelectCategory: (cat: TaskCategory) => void;
  counts: {
    today: number;
    upcoming: number;
    overdue: number;
    completed: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  selectedCategory,
  onSelectTab,
  onSelectCategory,
  counts,
}) => {
  const navItem = (
    id: DashboardTab,
    label: string,
    icon: React.ReactNode,
    count?: number,
    color?: string
  ) => {
    const isActive = currentTab === id;
    return (
      <button
        onClick={() => onSelectTab(id)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '9px 12px',
          borderRadius: 8,
          background: isActive ? '#eff6ff' : 'transparent',
          color: isActive ? '#2563eb' : '#334155',
          border: 'none',
          cursor: 'pointer',
          fontWeight: isActive ? 600 : 500,
          fontSize: 14,
          marginBottom: 2,
          transition: 'all 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon}
          <span>{label}</span>
        </div>
        {count !== undefined && count > 0 && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 10,
              background: color ? color : isActive ? '#dbeafe' : '#f1f5f9',
              color: color ? '#ffffff' : isActive ? '#1d4ed8' : '#64748b',
            }}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  const categories: { key: TaskCategory; icon: React.ReactNode }[] = [
    { key: 'online_tests', icon: <GraduationCap size={15} /> },
    { key: 'hackathons', icon: <Rocket size={15} /> },
    { key: 'reviews', icon: <FileCheck size={15} /> },
    { key: 'presentations', icon: <MonitorPlay size={15} /> },
    { key: 'academics', icon: <BookOpen size={15} /> },
    { key: 'personal', icon: <User size={15} /> },
    { key: 'other', icon: <Tag size={15} /> },
  ];

  return (
    <aside
      style={{
        width: 240,
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.05em',
              padding: '4px 12px 8px',
            }}
          >
            Views
          </div>
          {navItem('today', 'Today', <Calendar size={16} />, counts.today)}
          {navItem('upcoming', 'Upcoming', <Clock size={16} />, counts.upcoming)}
          {navItem(
            'overdue',
            'Overdue',
            <AlertCircle size={16} color="#dc2626" />,
            counts.overdue,
            '#dc2626'
          )}
          {navItem(
            'completed',
            'Completed',
            <CheckCircle size={16} color="#16a34a" />,
            counts.completed
          )}
        </div>

        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#94a3b8',
              letterSpacing: '0.05em',
              padding: '4px 12px 8px',
            }}
          >
            Categories
          </div>
          {categories.map((cat) => {
            const isCatActive = currentTab === 'category' && selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  onSelectCategory(cat.key);
                  onSelectTab('category');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '7px 12px',
                  borderRadius: 8,
                  background: isCatActive ? '#eff6ff' : 'transparent',
                  color: isCatActive ? '#2563eb' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isCatActive ? 600 : 500,
                  marginBottom: 1,
                  gap: 10,
                }}
              >
                {cat.icon}
                <span>{CATEGORY_LABELS[cat.key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 10 }}>
        {navItem('settings', 'Settings', <SettingsIcon size={16} />)}
      </div>
    </aside>
  );
};
