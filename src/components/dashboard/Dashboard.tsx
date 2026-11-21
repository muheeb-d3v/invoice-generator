import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import { Receipt, Users, DollarSign, Clock } from 'lucide-react';

interface DashboardStats {
  totalInvoices: number;
  totalClients: number;
  totalRevenue: number;
  pendingInvoices: number;
}

const API_BASE_URL = '/api';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    totalClients: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: Receipt,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: Clock,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your invoice activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 text-center py-8">
              No recent activity to display
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="font-medium text-gray-900 dark:text-white">
                  Create New Invoice
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Start a new invoice for your clients
                </div>
              </button>
              <button className="w-full p-3 text-left rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <div className="font-medium text-gray-900 dark:text-white">
                  Add New Client
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Add a client to your database
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};