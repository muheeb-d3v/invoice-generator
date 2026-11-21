import connectDB from '../lib/mongodb';
import Invoice from '../models/Invoice';
import Client from '../models/Client';
import { generateInvoiceNumber } from '../lib/utils';

export const getInvoices = async (userId: string) => {
  await connectDB();
  
  const invoices = await Invoice.find({ userId })
    .populate('clientId', 'name company')
    .sort({ createdAt: -1 })
    .lean();

  return invoices.map(invoice => ({
    ...invoice,
    _id: invoice._id.toString(),
    client: invoice.clientId,
    clientId: invoice.clientId._id.toString(),
  }));
};

export const getInvoiceById = async (invoiceId: string, userId: string) => {
  await connectDB();
  
  const invoice = await Invoice.findOne({ _id: invoiceId, userId })
    .populate('clientId')
    .lean();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return {
    ...invoice,
    _id: invoice._id.toString(),
    client: invoice.clientId,
    clientId: invoice.clientId._id.toString(),
  };
};

export const createInvoice = async (invoiceData: any, userId: string) => {
  await connectDB();
  
  const invoice = new Invoice({
    ...invoiceData,
    userId,
    invoiceNumber: generateInvoiceNumber(),
  });

  await invoice.save();
  return invoice;
};

export const updateInvoice = async (invoiceId: string, invoiceData: any, userId: string) => {
  await connectDB();
  
  const invoice = await Invoice.findOneAndUpdate(
    { _id: invoiceId, userId },
    invoiceData,
    { new: true }
  );

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
};

export const deleteInvoice = async (invoiceId: string, userId: string) => {
  await connectDB();
  
  const invoice = await Invoice.findOneAndDelete({ _id: invoiceId, userId });
  
  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
};