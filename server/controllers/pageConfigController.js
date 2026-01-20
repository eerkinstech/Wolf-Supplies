import PageConfig from '../models/PageConfig.js';

// Get page configuration
export const getPageConfig = async (req, res) => {
  try {
    const { pageName } = req.params;

    // Validate page name
    const validPages = ['home', 'categories', 'products', 'about', 'contact'];
    if (!validPages.includes(pageName)) {
      return res.status(400).json({ message: 'Invalid page name' });
    }

    let pageConfig = await PageConfig.findOne({ pageName });

    if (!pageConfig) {
      // If page config doesn't exist, create default one
      pageConfig = new PageConfig({
        pageName,
        sections: [],
        isPublished: true
      });
      await pageConfig.save();
    }

    // Return the complete node tree structure
    let sections = pageConfig.sections || [];

    // Fix corrupted data: convert string children to empty arrays
    const fixChildren = (nodes) => {
      if (!Array.isArray(nodes)) return nodes;
      return nodes.map(node => {
        if (node && typeof node === 'object') {
          // If children is a string (corrupted), convert to array
          if (typeof node.children === 'string') {
            node.children = [];
          } else if (Array.isArray(node.children)) {
            // Recursively fix nested children
            node.children = fixChildren(node.children);
          }
        }
        return node;
      });
    };

    sections = fixChildren(sections);

    // Return the sections array (which contains the full node tree)
    res.json({
      _id: pageConfig._id,
      pageName: pageConfig.pageName,
      sections: sections,
      meta: pageConfig.meta,
      isPublished: pageConfig.isPublished,
      createdAt: pageConfig.createdAt,
      updatedAt: pageConfig.updatedAt
    });
  } catch (error) {
    console.error('Error fetching page config:', error);
    res.status(500).json({ message: 'Error fetching page configuration' });
  }
};

// Save page configuration
export const savePageConfig = async (req, res) => {
  try {
    const { pageName } = req.params;
    const { sections, meta } = req.body;
    const userId = req.user?._id;

    // Validate request body
    if (!sections || !Array.isArray(sections)) {
      console.error('❌ Invalid request: sections not an array', typeof sections, sections?.length);
      return res.status(400).json({ message: 'Invalid request: sections must be an array' });
    }

    console.log(`💾 [PageConfig] Received save request for page "${pageName}" with ${sections.length} sections`);

    // Recursively find and log widgets to verify responsive data
    const findWidgets = (nodes, depth = 0) => {
      const widgets = [];
      if (!Array.isArray(nodes)) return widgets;

      for (const node of nodes) {
        if (node.kind === 'widget') {
          widgets.push({
            id: node.id,
            widgetType: node.widgetType,
            hasStyle: !!node.style,
            hasResponsive: !!node.responsive,
            responsiveKeys: node.responsive ? Object.keys(node.responsive) : [],
            style: node.style,
            responsive: node.responsive
          });
        }
        if (Array.isArray(node.children)) {
          widgets.push(...findWidgets(node.children, depth + 1));
        }
      }
      return widgets;
    };

    const widgets = findWidgets(sections);
    if (widgets.length > 0) {
      console.log(`📝 [PageConfig] Found ${widgets.length} widgets in sections:`);
      widgets.forEach((w, i) => {
        console.log(`  Widget ${i + 1}: ${w.id} (${w.widgetType})`);
        console.log(`    - Has style: ${w.hasStyle}`);
        console.log(`    - Has responsive: ${w.hasResponsive}`);
        if (w.hasResponsive) {
          console.log(`    - Responsive keys: ${w.responsiveKeys.join(', ')}`);
          console.log(`    - Responsive data:`, JSON.stringify(w.responsive, null, 2));
        }
      });
    } else {
      console.log(`⚠️  [PageConfig] No widgets found in sections`);
    }

    // Validate page name
    const validPages = ['home', 'categories', 'products', 'about', 'contact'];
    if (!validPages.includes(pageName)) {
      return res.status(400).json({ message: 'Invalid page name' });
    }

    // Ensure sections have required fields and sort by order
    // Use deep cloning to preserve responsive data and all nested properties
    const deepClone = (obj) => {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj.getTime());
      if (Array.isArray(obj)) return obj.map(item => deepClone(item));

      const cloned = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = deepClone(obj[key]);
        }
      }
      return cloned;
    };

    const sortedSections = sections
      .map(section => {
        const clonedSection = deepClone(section);
        clonedSection.order = section.order || 0;
        clonedSection.updatedAt = Date.now();
        return clonedSection;
      })
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    console.log(`✅ [PageConfig] Prepared ${sortedSections.length} sections for ${pageName}`);

    let pageConfig = await PageConfig.findOne({ pageName });

    if (pageConfig) {
      // Update existing
      pageConfig.sections = sortedSections;
      if (meta) {
        pageConfig.meta = meta;
      }
      pageConfig.updatedBy = userId;
      pageConfig.updatedAt = Date.now();
      console.log(`🔄 [PageConfig] Updating existing config for ${pageName}`);
    } else {
      // Create new
      pageConfig = new PageConfig({
        pageName,
        sections: sortedSections,
        meta: meta || {
          title: pageName,
          description: '',
          layout: 'default'
        },
        createdBy: userId,
        updatedBy: userId,
        isPublished: true
      });
      console.log(`✨ [PageConfig] Creating new config for ${pageName}`);
    }

    await pageConfig.save();
    console.log(`✅ [PageConfig] Saved successfully for ${pageName}`);

    // Verify what was actually saved
    const checkResponsive = (nodes) => {
      if (!Array.isArray(nodes)) return false;
      for (const node of nodes) {
        if (node.responsive) return true;
        if (node.children && checkResponsive(node.children)) return true;
      }
      return false;
    };

    const hasResponsive = checkResponsive(pageConfig.sections);
    console.log(`📊 [PageConfig] Saved data includes responsive: ${hasResponsive}`);

    res.json({
      success: true,
      message: 'Page configuration saved successfully',
      data: pageConfig
    });
  } catch (error) {
    console.error('Error saving page config:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Error saving page configuration',
      error: error.message
    });
  }
};

// Get all page configurations
export const getAllPageConfigs = async (req, res) => {
  try {
    const configs = await PageConfig.find().select('pageName isPublished updatedAt');
    res.json(configs);
  } catch (error) {
    console.error('Error fetching page configs:', error);
    res.status(500).json({ message: 'Error fetching page configurations' });
  }
};

// Update specific section
export const updatePageSection = async (req, res) => {
  try {
    const { pageName, sectionId } = req.params;
    const { content, style } = req.body;

    const pageConfig = await PageConfig.findOne({ pageName });
    if (!pageConfig) {
      return res.status(404).json({ message: 'Page configuration not found' });
    }

    const section = pageConfig.sections.find(s => s.id === sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    if (content) {
      section.content = { ...section.content, ...content };
    }
    if (style) {
      section.style = { ...section.style, ...style };
    }

    section.updatedAt = Date.now();
    await pageConfig.save();

    res.json({
      message: 'Section updated successfully',
      data: section
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ message: 'Error updating section' });
  }
};

// Delete specific section
export const deletePageSection = async (req, res) => {
  try {
    const { pageName, sectionId } = req.params;

    const pageConfig = await PageConfig.findOne({ pageName });
    if (!pageConfig) {
      return res.status(404).json({ message: 'Page configuration not found' });
    }

    pageConfig.sections = pageConfig.sections.filter(s => s.id !== sectionId);
    await pageConfig.save();

    res.json({
      message: 'Section deleted successfully',
      data: pageConfig
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ message: 'Error deleting section' });
  }
};

// Publish/Unpublish page
export const togglePagePublish = async (req, res) => {
  try {
    const { pageName } = req.params;

    const pageConfig = await PageConfig.findOne({ pageName });
    if (!pageConfig) {
      return res.status(404).json({ message: 'Page configuration not found' });
    }

    pageConfig.isPublished = !pageConfig.isPublished;
    pageConfig.publishedAt = Date.now();
    await pageConfig.save();

    res.json({
      message: `Page ${pageConfig.isPublished ? 'published' : 'unpublished'} successfully`,
      data: pageConfig
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ message: 'Error toggling publish status' });
  }
};
