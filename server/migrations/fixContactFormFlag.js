/**
 * Migration: Set fromContactForm flag on existing records
 * 
 * This migration sets fromContactForm = true for all existing contact submission records
 * that don't have the flag set. This ensures backward compatibility.
 * 
 * Run: node server/migrations/fixContactFormFlag.js
 */

const mongoose = require('mongoose');
const ContactSubmission = require('../models/ContactSubmission.js');

const fixContactFormFlag = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);

    // Find all records where fromContactForm is undefined
    const result = await ContactSubmission.updateMany(
      { fromContactForm: { $exists: false } },
      { $set: { fromContactForm: true } }
    );

    // Show breakdown by type
    const chatCount = await ContactSubmission.countDocuments({ fromContactForm: false });
    const contactCount = await ContactSubmission.countDocuments({ fromContactForm: true });

    process.exit(0);
  } catch (error) {

    process.exit(1);
  }
};

fixContactFormFlag();

