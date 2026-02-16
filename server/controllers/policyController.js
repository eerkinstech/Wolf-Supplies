const Policy = require('../models/Policy.js');

// Get all policies
const getAllPolicies = async (req, res) => {
    try {
        const policies = await Policy.find({ isPublished: true }).select('_id title slug description');
        res.status(200).json({ policies, success: true });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching policies', error: err.message });
    }
};

// Get single policy
const getPolicy = async (req, res) => {
    try {
        const { slug } = req.params;
        const policy = await Policy.findOne({ slug });
        if (!policy) return res.status(404).json({ message: 'Policy not found' });
        res.status(200).json(policy);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching policy', error: err.message });
    }
};

// Create policy (admin)
const createPolicy = async (req, res) => {
    try {
        const { title, slug, description, content, metaDescription, metaKeywords } = req.body;

        const newPolicy = new Policy({
            title,
            slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
            description,
            content,
            metaDescription,
            metaKeywords
        });

        await newPolicy.save();
        res.status(201).json({ message: 'Policy created successfully', policy: newPolicy });
    } catch (err) {
        res.status(500).json({ message: 'Error creating policy', error: err.message });
    }
};

// Update policy (admin)
const updatePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const policy = await Policy.findByIdAndUpdate(id, updates, { new: true });
        if (!policy) return res.status(404).json({ message: 'Policy not found' });

        res.status(200).json({ message: 'Policy updated successfully', policy });
    } catch (err) {
        res.status(500).json({ message: 'Error updating policy', error: err.message });
    }
};

// Delete policy (admin)
const deletePolicy = async (req, res) => {
    try {
        const { id } = req.params;
        const policy = await Policy.findByIdAndDelete(id);
        if (!policy) return res.status(404).json({ message: 'Policy not found' });

        res.status(200).json({ message: 'Policy deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting policy', error: err.message });
    }
};

module.exports = {
    getAllPolicies,
    getPolicy,
    createPolicy,
    updatePolicy,
    deletePolicy
};

