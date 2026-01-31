import Settings from '../models/Settings.js';

// GET global settings
export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// UPDATE global settings
export const updateSettings = async (req, res) => {
  try {
    const { requireReviewApproval, defaultAssistantModel } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    if (requireReviewApproval !== undefined) {
      settings.requireReviewApproval = requireReviewApproval;
    }
    if (defaultAssistantModel !== undefined) {
      settings.defaultAssistantModel = defaultAssistantModel;
    }
    await settings.save();
    res.json(settings);
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// GET featured collections (categories and products)
export const getFeaturedCollections = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({
      featuredCategories: settings.featuredCategories || { categoryNames: [], limit: 6, layout: 'grid' },
      featuredProducts: settings.featuredProducts || [],
    });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// SAVE featured collections (admin only)
export const saveFeaturedCollections = async (req, res) => {
  try {
    const { featuredCategories, featuredProducts } = req.body;

    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();

    if (featuredCategories) {
      settings.featuredCategories = featuredCategories;
    }
    if (featuredProducts) {
      settings.featuredProducts = featuredProducts;
    }

    await settings.save();
    res.json({
      featuredCategories: settings.featuredCategories,
      featuredProducts: settings.featuredProducts,
    });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// GET browse menu
export const getMenu = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json({ browseMenu: settings.browseMenu || [] });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

// Save or update browse menu (admin only)
export const saveMenu = async (req, res) => {
  try {
    const { browseMenu } = req.body;
    if (!Array.isArray(browseMenu)) {
      return res.status(400).json({ message: 'browseMenu must be an array' });
    }
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    settings.browseMenu = browseMenu;
    await settings.save();
    res.json({ browseMenu: settings.browseMenu });
  } catch (error) {

    res.status(500).json({ message: error.message });
  }
};

