import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const mongoUri = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const run = async () => {
  try {
    await mongoose.connect(mongoUri);

    const users = await User.find({});

    for (const user of users) {
      const pw = user.password || '';
      // crude check for bcrypt hash: starts with $2
      if (!pw.startsWith('$2')) {

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(pw, salt);
        user.password = hash;
        await user.save();

      } else {

      }
    }

    process.exit(0);
  } catch (err) {

    process.exit(1);
  }
};

run();

