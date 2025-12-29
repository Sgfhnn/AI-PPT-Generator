const Presentation = require('../models/Presentation.model');
const User = require('../models/User.model');
const pptxService = require('../services/pptx.service');
const path = require('path');
const fs = require('fs');

// Get all presentations for current user
exports.getAll = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        const query = { user: req.user._id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        const presentations = await Presentation.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .select('-originalContent -slides.notes');

        const total = await Presentation.countDocuments(query);

        res.json({
            success: true,
            data: {
                presentations,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });
    } catch (error) {
        console.error('Get presentations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch presentations',
            error: error.message
        });
    }
};

// Get single presentation
exports.getOne = async (req, res) => {
    try {
        const presentation = await Presentation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!presentation) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        res.json({
            success: true,
            data: { presentation }
        });
    } catch (error) {
        console.error('Get presentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch presentation',
            error: error.message
        });
    }
};

// Update presentation
exports.update = async (req, res) => {
    try {
        const { title, description, slides, theme } = req.body;

        const updates = {};
        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (slides) updates.slides = slides;
        if (theme) updates.theme = theme;

        const presentation = await Presentation.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        if (!presentation) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        res.json({
            success: true,
            message: 'Presentation updated successfully',
            data: { presentation }
        });
    } catch (error) {
        console.error('Update presentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update presentation',
            error: error.message
        });
    }
};

// Delete presentation
exports.delete = async (req, res) => {
    try {
        const presentation = await Presentation.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!presentation) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        // Delete associated PPTX file if exists
        if (presentation.generatedPptxUrl) {
            const filePath = path.join(__dirname, '../../uploads/pptx', path.basename(presentation.generatedPptxUrl));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Update user's presentation count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { presentationsCount: -1 }
        });

        res.json({
            success: true,
            message: 'Presentation deleted successfully'
        });
    } catch (error) {
        console.error('Delete presentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete presentation',
            error: error.message
        });
    }
};

// Export presentation as PPTX
exports.export = async (req, res) => {
    try {
        const presentation = await Presentation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!presentation) {
            return res.status(404).json({
                success: false,
                message: 'Presentation not found'
            });
        }

        // Generate PPTX
        const outputDir = path.join(__dirname, '../../uploads/pptx');
        const { enableAnimations } = req.body;
        const result = await pptxService.generatePptx(presentation, outputDir, { enableAnimations });

        // Update presentation with PPTX URL
        presentation.generatedPptxUrl = result.url;
        presentation.status = 'exported';
        await presentation.save();

        res.json({
            success: true,
            message: 'Presentation exported successfully',
            data: {
                downloadUrl: result.url,
                filename: result.filename
            }
        });
    } catch (error) {
        console.error('Export presentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to export presentation',
            error: error.message
        });
    }
};

// Download PPTX file
exports.download = async (req, res) => {
    try {
        const presentation = await Presentation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!presentation || !presentation.generatedPptxUrl) {
            return res.status(404).json({
                success: false,
                message: 'Presentation file not found. Please export first.'
            });
        }

        const filename = path.basename(presentation.generatedPptxUrl);
        const filePath = path.join(__dirname, '../../uploads/pptx', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'File not found on server. Please re-export.'
            });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${presentation.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Download presentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to download presentation',
            error: error.message
        });
    }
};
