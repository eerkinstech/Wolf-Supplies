import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    requireReviewApproval: {
      type: Boolean,
      default: true, // By default, reviews require approval before showing
    },
    // Default assistant/model used for AI features (if any)
    defaultAssistantModel: {
      type: String,
      default: 'claude-haiku-4.5',
    },
    // Browse menu structure for site header/navigation
    browseMenu: {
      type: [
        {
          id: { type: String },
          name: { type: String },
          link: { type: String },
          sub: [
            {
              id: { type: String },
              name: { type: String },
              link: { type: String },
            },
          ],
        },
      ],
      default: [],
    },
    // Featured Categories Configuration
    featuredCategories: {
      categoryNames: [{ type: String }],
      limit: { type: Number, default: 6 },
      layout: { type: String, enum: ['grid', 'carousel'], default: 'grid' },
    },
    // Featured Products Configuration (3 sections)
    featuredProducts: [
      {
        title: { type: String, default: 'Featured Products' },
        category: { type: String },
        limit: { type: Number, default: 4 },
        layout: { type: String, enum: ['grid', 'carousel'], default: 'grid' },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Settings', settingsSchema);
