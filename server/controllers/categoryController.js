import Category from '../models/Category.js';

export const getCategories = async (req, res) => {
  try {
    // Get all main categories (no parent) with their subcategories populated
    const categories = await Category.find({ parent: null })
      .populate({
        path: 'subcategories',
        populate: {
          path: 'subcategories',
          populate: {
            path: 'subcategories',
          },
        },
      })
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('getCategories error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, parent, image, color } = req.body;
    
    // Generate slug from name if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const existing = await Category.findOne({ slug: finalSlug });
    if (existing) return res.status(400).json({ message: 'Category slug already exists' });
    
    const category = await Category.create({ 
      name, 
      slug: finalSlug, 
      description, 
      parent: parent || null, 
      image, 
      color 
    });
    res.status(201).json(category);
  } catch (error) {
    console.error('createCategory error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (category) res.json(category);
  else res.status(404).json({ message: 'Category not found' });
};

export const getCategoryBySlug = async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug })
    .populate({
      path: 'subcategories',
      populate: {
        path: 'subcategories',
        populate: {
          path: 'subcategories',
        },
      },
    });
  if (category) res.json(category);
  else res.status(404).json({ message: 'Category not found' });
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    const { name, slug, description, parent, image, color } = req.body;
    
    // Only update fields if they are provided
    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description) category.description = description;
    if (parent !== undefined) category.parent = parent;
    if (image) category.image = image; // Handle base64 or URL images
    if (color) category.color = color;
    
    const updated = await category.save();
    res.json(updated);
  } catch (error) {
    console.error('updateCategory error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  await Category.deleteOne({ _id: req.params.id });
  res.json({ message: 'Category removed' });
};
