const Page = require('../models/Page.js');

// Get all pages
const getAllPages = async (req, res) => {
    try {
        const pages = await Page.find({ isPublished: true }).select('_id title slug description');
        res.status(200).json({ pages, success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pages', error: err.message });
    }
};

// Get single page
const getPage = async (req, res) => {
    try {
        const { slug } = req.params;
        const page = await Page.findOne({ slug });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        res.status(200).json(page);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching page', error: err.message });
    }
};

// Create page (admin)
const createPage = async (req, res) => {
    try {
        const { title, slug, description, content, metaTitle, metaDescription, metaKeywords } = req.body;
        
        const newPage = new Page({
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
            description,
            content,
            metaTitle: metaTitle || title || '',
            metaDescription,
            metaKeywords
        });
        
        await newPage.save();
        res.status(201).json({ message: 'Page created successfully', page: newPage });
    } catch (err) {
        res.status(500).json({ message: 'Error creating page', error: err.message });
    }
};

// Update page (admin)
const updatePage = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const page = await Page.findByIdAndUpdate(id, updates, { new: true });
        if (!page) return res.status(404).json({ message: 'Page not found' });
        
        res.status(200).json({ message: 'Page updated successfully', page });
    } catch (err) {
        res.status(500).json({ message: 'Error updating page', error: err.message });
    }
};

// Delete page (admin)
const deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await Page.findByIdAndDelete(id);
        if (!page) return res.status(404).json({ message: 'Page not found' });
        
        res.status(200).json({ message: 'Page deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting page', error: err.message });
    }
};

module.exports = {
    getAllPages,
    getPage,
    createPage,
    updatePage,
    deletePage
};

