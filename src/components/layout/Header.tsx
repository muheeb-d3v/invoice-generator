import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/Button';
import { Receipt, Moon, Sun, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Invoice Generator
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="p-2"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};