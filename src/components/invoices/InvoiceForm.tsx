import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, generateInvoiceNumber } from '../../lib/utils';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  price: z.number().min(0, 'Price must be 0 or greater'),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  taxRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface Client {
  _id: string;
  name: string;
  company?: string;
}

interface InvoiceFormProps {
  invoiceId?: string | null;
  onClose: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ invoiceId, onClose }) => {
  const { user, signOut } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      taxRate: 0,
      items: [{ description: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items');
  const watchedTaxRate = watch('taxRate');

  // Calculate totals in real-time
  useEffect(() => {
    const newSubtotal = watchedItems.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      return sum + (quantity * price);
    }, 0);

    const newTaxAmount = newSubtotal * (Number(watchedTaxRate) / 100);
    const newTotal = newSubtotal + newTaxAmount;

    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setTotal(newTotal);
  }, [watchedItems, watchedTaxRate]);

  // Fetch clients
  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        const response = await fetch('/api/clients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch clients');

        const data = await response.json();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, [user]);

  // Load existing invoice data if editing
  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId || !user) return;

      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch invoice');

        const invoice = await response.json();

        // Set form values
        const clientId = invoice.clientId && typeof invoice.clientId === 'object'
          ? invoice.clientId._id
          : invoice.clientId;

        setValue('clientId', clientId || '');
        setValue('issueDate', invoice.issueDate.split('T')[0]);
        setValue('dueDate', invoice.dueDate.split('T')[0]);
        setValue('taxRate', invoice.taxRate);
        setValue('notes', invoice.notes || '');
        setValue('items', invoice.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        })));
      } catch (error) {
        console.error('Error loading invoice:', error);
        setError('Failed to load invoice data');
      }
    };

    loadInvoice();
  }, [invoiceId, user, setValue]);

  const onSubmit = async (data: InvoiceFormData) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const invoiceData = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          amount: item.quantity * item.price,
        })),
      };

      const url = invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices';
      const method = invoiceId ? 'PUT' : 'POST';

      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await signOut();
          return;
        }

        let errorMessage = 'Failed to save invoice';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }
        throw new Error(errorMessage);
      }


      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
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
            {invoiceId ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {invoiceId ? 'Update invoice details' : 'Create a professional invoice for your client'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invoice Details
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Client"
                    {...register('clientId')}
                    error={errors.clientId?.message}
                  >
                    <option value="">Select a client</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Issue Date"
                    type="date"
                    {...register('issueDate')}
                    error={errors.issueDate?.message}
                  />

                  <Input
                    label="Due Date"
                    type="date"
                    {...register('dueDate')}
                    error={errors.dueDate?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Tax Rate (%)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    {...register('taxRate', { valueAsNumber: true })}
                    error={errors.taxRate?.message}
                  />
                </div>

                <Input
                  label="Notes (Optional)"
                  placeholder="Additional notes or payment terms"
                  {...register('notes')}
                  error={errors.notes?.message}
                />
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Invoice Items
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ description: '', quantity: 1, price: 0 })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-12 md:col-span-5">
                        <Input
                          label={index === 0 ? "Description" : ""}
                          placeholder="Item description"
                          {...register(`items.${index}.description`)}
                          error={errors.items?.[index]?.description?.message}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <Input
                          label={index === 0 ? "Qty" : ""}
                          type="number"
                          step="0.01"
                          min="0.01"
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          error={errors.items?.[index]?.quantity?.message}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <Input
                          label={index === 0 ? "Price" : ""}
                          type="number"
                          step="0.01"
                          min="0"
                          {...register(`items.${index}.price`, { valueAsNumber: true })}
                          error={errors.items?.[index]?.price?.message}
                        />
                      </div>
                      <div className="col-span-8 md:col-span-2">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {index === 0 && <div className="mb-2 text-gray-700 dark:text-gray-300">Amount</div>}
                          {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.price || 0))}
                        </div>
                      </div>
                      <div className="col-span-4 md:col-span-1">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="p-2 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.items && Array.isArray(errors.items) && (
                  <div className="space-y-2 mt-2">
                    {errors.items.map((itemError: any, index: number) => {
                      if (!itemError) return null;
                      return (
                        <div key={index} className="text-sm text-red-600 dark:text-red-400">
                          {itemError.description && <p>Item {index + 1}: {itemError.description.message}</p>}
                          {itemError.quantity && <p>Item {index + 1}: {itemError.quantity.message}</p>}
                          {itemError.price && <p>Item {index + 1}: {itemError.price.message}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Fallback for general array error if not an array of items (e.g. min length) */}
                {errors.items && !Array.isArray(errors.items) && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {(errors.items as any).message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Invoice Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Invoice Summary
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tax ({watchedTaxRate}%):
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(taxAmount)}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <Button type="submit" loading={loading} className="w-full">
                    {invoiceId ? 'Update Invoice' : 'Create Invoice'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose} className="w-full">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};