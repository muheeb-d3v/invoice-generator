import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ArrowLeft } from 'lucide-react';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  client?: {
    _id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address: string;
  } | null;
  onClose: () => void;
}

const API_BASE_URL = '/api';

export const ClientForm: React.FC<ClientFormProps> = ({ client, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: client ? {
      name: client.name,
      email: client.email,
      company: client.company || '',
      phone: client.phone || '',
      address: client.address,
    } : {
      name: '',
      email: '',
      company: '',
      phone: '',
      address: '',
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const url = client
        ? `${API_BASE_URL}/clients/${client._id}`
        : `${API_BASE_URL}/clients`;

      const method = client ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          company: data.company || undefined,
          phone: data.phone || undefined,
          address: data.address,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose} className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {client ? 'Update client information' : 'Add a new client to your database'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Client Information
          </h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                placeholder="Enter client's full name"
                {...register('name')}
                error={errors.name?.message}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="client@example.com"
                {...register('email')}
                error={errors.email?.message}
              />

              <Input
                label="Company (Optional)"
                placeholder="Company name"
                {...register('company')}
                error={errors.company?.message}
              />

              <Input
                label="Phone (Optional)"
                placeholder="(555) 123-4567"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <Input
              label="Address"
              placeholder="Full address"
              {...register('address')}
              error={errors.address?.message}
            />

            <div className="flex justify-end space-x-3 pt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                {client ? 'Update Client' : 'Add Client'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};