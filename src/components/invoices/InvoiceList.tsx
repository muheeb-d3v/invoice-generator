import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { InvoiceForm } from './InvoiceForm';
import { InvoicePreview } from './InvoicePreview';
import { Plus, Edit2, Trash2, Eye, Send } from 'lucide-react';
import { Receipt } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid';
  issueDate: string;
  dueDate: string;
  total: number;
  client: {
    name: string;
    company?: string;
  };
}

export const InvoiceList: React.FC = () => {
  const { user, signOut } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<string | null>(null);

  const fetchInvoices = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await signOut();
          return;
        }
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const handleDelete = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete invoice');

      setInvoices(invoices.filter(inv => inv._id !== invoiceId));
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: 'draft' | 'sent' | 'paid') => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update invoice status');

      setInvoices(invoices.map(inv =>
        inv._id === invoiceId ? { ...inv, status: newStatus } : inv
      ));
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingInvoice(null);
    fetchInvoices();
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewInvoice(null);
  };

  if (showForm) {
    return (
      <InvoiceForm
        invoiceId={editingInvoice}
        onClose={handleFormClose}
      />
    );
  }

  if (showPreview && previewInvoice) {
    return (
      <InvoicePreview
        invoiceId={previewInvoice}
        onClose={handlePreviewClose}
      />
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invoices
          </h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
            Invoices
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create and manage your invoices
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No invoices yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first invoice to get started
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <Card key={invoice._id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                      <span>
                        <strong>Client:</strong> {invoice.client.name}
                        {invoice.client.company && ` (${invoice.client.company})`}
                      </span>
                      <span>
                        <strong>Due:</strong> {formatDate(invoice.dueDate)}
                      </span>
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPreviewInvoice(invoice._id);
                        setShowPreview(true);
                      }}
                      className="p-2"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingInvoice(invoice._id);
                        setShowForm(true);
                      }}
                      className="p-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {invoice.status === 'draft' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(invoice._id, 'sent')}
                        className="p-2 text-blue-600 hover:text-blue-700"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    )}

                    {invoice.status === 'sent' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusUpdate(invoice._id, 'paid')}
                        className="p-2 text-emerald-600 hover:text-emerald-700"
                      >
                        Mark Paid
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice._id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};