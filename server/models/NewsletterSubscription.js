import mongoose from 'mongoose';

const newsletterSubscriptionSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    status: {
        type: String,
        enum: ['subscribed', 'unsubscribed', 'bounced'],
        default: 'subscribed'
    },
    verificationToken: String,
    verified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,
    unsubscribedAt: Date,
    lastEmailSentAt: Date,
    tags: [String], // For segmentation
    ipAddress: String,
    userAgent: String,
}, { timestamps: true });

// Index for search
newsletterSubscriptionSchema.index({ email: 1 });
newsletterSubscriptionSchema.index({ status: 1 });
newsletterSubscriptionSchema.index({ createdAt: -1 });

const NewsletterSubscription = mongoose.model('NewsletterSubscription', newsletterSubscriptionSchema);
export default NewsletterSubscription;
