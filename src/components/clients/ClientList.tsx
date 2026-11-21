import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ClientForm } from './ClientForm';
import { Plus, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import { Users } from 'lucide-react';

interface ClientData {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  address: string;
}

const API_BASE_URL = '/api';

export const ClientList: React.FC = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setClients(clients.filter(c => c._id !== clientId));
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleEdit = (client: ClientData) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingClient(null);
    fetchClients();
  };

  if (showForm) {
    return (
      <ClientForm
        client={editingClient}
        onClose={handleFormClose}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clients
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Clients
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your client database
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No clients yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Get started by adding your first client
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card key={client._id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {client.name}
                    </h3>
                    {client.company && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {client.company}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(client)}
                      className="p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(client._id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {client.email}
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 mr-2" />
                      {client.phone}
                    </div>
                  )}
                </div>

                {client.address && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {client.address}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};