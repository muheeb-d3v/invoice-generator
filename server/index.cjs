const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb://127.0.0.1:27017/invoice-app';
const JWT_SECRET = process.env.JWT_SECRET || process.env.VITE_JWT_SECRET || '32bc0098fef91d4e017b2d61c9f23c14e548e6c7e53324ddac071b9a95d1eecc474e46d126364b839c5426f107f584247da2243e5908d960ef5ac0616bbc287a';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.log('Please make sure MongoDB is running or set VITE_MONGODB_URI to a valid MongoDB connection string');
  });

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dbConnected: mongoose.connection.readyState === 1,
    dbState: mongoose.connection.readyState, // 0=disconnected,1=connected,2=connecting,3=disconnecting
  });
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Client Schema
const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

clientSchema.index({ userId: 1, createdAt: -1 });

const Client = mongoose.model('Client', clientSchema);

// Invoice Schema
const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid'],
    default: 'draft',
  },
  issueDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    default: 0,
    min: 0,
  },
  taxRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    default: 0,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

invoiceSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);
  this.taxAmount = this.subtotal * (this.taxRate / 100);
  this.total = this.subtotal + this.taxAmount;
  next();
});

invoiceSchema.index({ userId: 1, createdAt: -1 });
invoiceSchema.index({ clientId: 1 });
invoiceSchema.index({ status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password must be strings' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Ensure DB is connected before attempting to save
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database is not connected. Please try again shortly.' });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: newUser._id.toString(), email: newUser.email }
    });
  } catch (error) {
    console.error('Sign up error:', error);
    if (error && error.code === 11000) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }
    if (error && error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid user data' });
    }
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      error: 'An error occurred during sign up',
      ...(isDev && { details: error?.message || String(error) })
    });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password must be strings' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await existingUser.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: existingUser._id.toString(), email: existingUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: existingUser._id.toString(), email: existingUser.email }
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: 'An error occurred during sign in' });
  }
});

// Client Routes
app.get('/api/clients', authenticateToken, async (req, res) => {
  try {
    const clients = await Client.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json(clients.map(client => ({
      ...client,
      _id: client._id.toString(),
    })));
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

app.post('/api/clients', authenticateToken, async (req, res) => {
  try {
    const { name, email, company, phone, address } = req.body;

    const newClient = new Client({
      userId: req.user.userId,
      name,
      email,
      company: company || undefined,
      phone: phone || undefined,
      address,
    });

    await newClient.save();
    res.json({ ...newClient.toObject(), _id: newClient._id.toString() });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Failed to create client' });
  }
});

app.put('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, company, phone, address } = req.body;

    const updatedClient = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        name,
        email,
        company: company || undefined,
        phone: phone || undefined,
        address,
      },
      { new: true }
    );

    if (!updatedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ ...updatedClient.toObject(), _id: updatedClient._id.toString() });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

app.delete('/api/clients/:id', authenticateToken, async (req, res) => {
  try {
    const deletedClient = await Client.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deletedClient) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Dashboard Routes
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [invoices, clients] = await Promise.all([
      Invoice.find({ userId: req.user.userId }).lean(),
      Client.find({ userId: req.user.userId }).lean(),
    ]);

    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingInvoices = invoices.filter(inv => inv.status !== 'paid').length;

    res.json({
      totalInvoices: invoices.length,
      totalClients: clients.length,
      totalRevenue,
      pendingInvoices,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Invoice Routes
app.get('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.userId })
      .populate('clientId', 'name email company')
      .sort({ createdAt: -1 })
      .lean();

    res.json(invoices.map(invoice => ({
      ...invoice,
      _id: invoice._id.toString(),
      clientId: invoice.clientId._id.toString(),
      client: invoice.clientId,
    })));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

app.get('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).populate('clientId').lean();

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      ...invoice,
      _id: invoice._id.toString(),
      client: invoice.clientId,
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

app.post('/api/invoices', authenticateToken, async (req, res) => {
  try {
    const { clientId, items, taxRate, notes, issueDate, dueDate } = req.body;
    console.log('Received invoice creation request:', { clientId, items, taxRate, notes, issueDate, dueDate });


    // Generate invoice number
    const invoiceCount = await Invoice.countDocuments({ userId: req.user.userId });
    const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(4, '0')}`;

    const newInvoice = new Invoice({
      userId: req.user.userId,
      clientId,
      invoiceNumber,
      items,
      taxRate: taxRate || 0,
      notes,
      issueDate: new Date(issueDate),
      dueDate: new Date(dueDate),
    });

    await newInvoice.save();
    await newInvoice.populate('clientId');

    res.json({
      ...newInvoice.toObject(),
      _id: newInvoice._id.toString(),
      client: newInvoice.clientId,
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

app.put('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const { clientId, items, taxRate, notes, issueDate, dueDate, status } = req.body;

    const updatedInvoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      {
        clientId,
        items,
        taxRate: taxRate || 0,
        notes,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status,
      },
      { new: true }
    ).populate('clientId');

    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({
      ...updatedInvoice.toObject(),
      _id: updatedInvoice._id.toString(),
      client: updatedInvoice.clientId,
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

app.delete('/api/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deletedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});