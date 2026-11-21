import React from 'react';
import { cn } from '../../lib/utils';
import { Receipt, Users, FileText, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'invoices', label: 'Invoices', icon: Receipt },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'templates', label: 'Templates', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, collapsed, onToggle }) => {
  return (
    <aside
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <nav className="p-2 space-y-2 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center px-3 py-3 rounded-lg text-left transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                collapsed ? 'justify-center' : 'space-x-3'
              )}
              title={collapsed ? tab.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{tab.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
};