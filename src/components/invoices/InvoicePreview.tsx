import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { ArrowLeft, Download } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  client: {
    name: string;
    email: string;
    company?: string;
    phone?: string;
    address: string;
  };
  items: Array<{
    description: string;
    quantity: number;
    price: number;
    amount: number;
  }>;
}

interface InvoicePreviewProps {
  invoiceId: string;
  onClose: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoiceId, onClose }) => {
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch invoice');

        const data = await response.json();
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId, user]);

  const exportToPDF = async () => {
    if (!invoiceRef.current || !invoice) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Loading Invoice...
          </h2>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invoice Not Found
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onClose} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Invoice Preview
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {invoice.invoiceNumber}
            </p>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={exportToPDF}
            loading={exporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-0">
          <div ref={invoiceRef} className="bg-white p-8 text-gray-900">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-blue-600 mb-2">INVOICE</h1>
                <p className="text-lg font-semibold">{invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  Your Company Name
                </div>
                <div className="text-sm text-gray-600">
                  <p>123 Business Street</p>
                  <p>City, State 12345</p>
                  <p>contact@yourcompany.com</p>
                  <p>(555) 123-4567</p>
                </div>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-900">Bill To:</h3>
                <div className="text-sm">
                  <p className="font-semibold">{invoice.client.name}</p>
                  {invoice.client.company && <p>{invoice.client.company}</p>}
                  <p>{invoice.client.address}</p>
                  <p>{invoice.client.email}</p>
                  {invoice.client.phone && <p>{invoice.client.phone}</p>}
                </div>
              </div>
              <div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Issue Date:</span>
                    <span>{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Due Date:</span>
                    <span>{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Status:</span>
                    <span className="capitalize font-medium">{invoice.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 font-semibold">Description</th>
                    <th className="text-right py-3 font-semibold w-20">Qty</th>
                    <th className="text-right py-3 font-semibold w-24">Price</th>
                    <th className="text-right py-3 font-semibold w-24">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3">{item.description}</td>
                      <td className="text-right py-3">{item.quantity}</td>
                      <td className="text-right py-3">{formatCurrency(item.price)}</td>
                      <td className="text-right py-3 font-medium">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-64">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Notes:</h3>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-gray-300 pt-6 text-center text-sm text-gray-600">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};