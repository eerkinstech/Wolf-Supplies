/**
 * Migration: Set fromContactForm flag on existing records
 * 
 * This migration sets fromContactForm = true for all existing contact submission records
 * that don't have the flag set. This ensures backward compatibility.
 * 
 * Run: node server/migrations/fixContactFormFlag.js
 */

import mongoose from 'mongoose';
import ContactSubmission from '../models/ContactSubmission.js';

const fixContactFormFlag = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all records where fromContactForm is undefined
    const result = await ContactSubmission.updateMany(
      { fromContactForm: { $exists: false } },
      { $set: { fromContactForm: true } }
    );

    console.log(`\n✅ Migration Complete!`);
    console.log(`📝 Records updated: ${result.modifiedCount}`);
    console.log(`⏭️  Records already had flag: ${result.matchedCount - result.modifiedCount}`);
    console.log(`\n📊 Summary:`);
    console.log(`   - Total records checked: ${result.matchedCount}`);
    console.log(`   - Records set to fromContactForm=true: ${result.modifiedCount}`);

    // Show breakdown by type
    const chatCount = await ContactSubmission.countDocuments({ fromContactForm: false });
    const contactCount = await ContactSubmission.countDocuments({ fromContactForm: true });
    
    console.log(`\n📈 Current Distribution:`);
    console.log(`   - Chat Messages: ${chatCount}`);
    console.log(`   - Contact Forms: ${contactCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

fixContactFormFlag();
