import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Manual env config because we're running this script directly
dotenv.config();

// Since we can't easily import models that might use CommonJS if the project is mixed, 
// let's define a temporary schema to test the connection.
// Wait, looking at index.cjs, it uses require(). BUT package.json says "type": "module".
// Verify if server/index.cjs is indeed CJS. Yes extension is .cjs.
// But models might be .js and treated as ESM? Let's check a model file.

const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI;

console.log('Testing connection to:', MONGODB_URI?.replace(/:([^:@]+)@/, ':****@'));

if (!MONGODB_URI) {
    console.error('MONGODB_URI is undefined!');
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Successfully connected to MongoDB');

        try {
            // Define a temporary schema to verify writes
            const TestSchema = new mongoose.Schema({
                name: String,
                createdAt: { type: Date, default: Date.now }
            });
            const TestModel = mongoose.model('TestConn', TestSchema);

            console.log('Attempting to create test document...');
            const doc = new TestModel({ name: 'Connection Test' });
            await doc.save();
            console.log('Document created successfully:', doc._id);

            await TestModel.deleteOne({ _id: doc._id });
            console.log('Test document deleted');

            console.log('Database Write/Read OK');
            process.exit(0);
        } catch (err) {
            console.error('Operation failed:', err);
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('Connection failed:', err);
        process.exit(1);
    });
