import mongoose from 'mongoose';

// Define a recursive submenu schema
const submenuSchema = new mongoose.Schema(
  {
    id: { type: String },
    label: { type: String },
    name: { type: String },
    url: { type: String },
    link: { type: String },
    submenu: {
      type: [this],
      default: [],
    },
  },
  { _id: false }
);

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
    // Browse menu structure for site header/navigation (supports unlimited nesting)
    browseMenu: {
      type: [
        {
          id: { type: String },
          label: { type: String },
          name: { type: String },
          url: { type: String },
          link: { type: String },
          submenu: {
            type: [submenuSchema],
            default: [],
          },
          // Keep legacy 'sub' field for backward compatibility
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

