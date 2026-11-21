import connectDB from '../lib/mongodb';
import Client from '../models/Client';

export const getClients = async (userId: string) => {
  await connectDB();
  
  const clients = await Client.find({ userId })
    .sort({ name: 1 })
    .lean();

  return clients.map(client => ({
    ...client,
    _id: client._id.toString(),
  }));
};