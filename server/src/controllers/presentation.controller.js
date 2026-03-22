const Presentation = require('../models/Presentation.model');
const User = require('../models/User.model');
const pptxService = require('../services/pptx.service');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
    try {
        const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
        const { status, search } = req.query;

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
            .limit(limit)
            .select('-originalContent -slides.notes');

        const total = await Presentation.countDocuments(query);

        res.json({
            success: true,
            data: {
                presentations,
                pagination: {
                    current: page,
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

exports.update = async (req, res) => {
    try {
        const { title, description, slides, theme } = req.body;
        const updates = {};

        if (title) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (slides) {
            updates.slides = slides;
            updates.slideCount = Array.isArray(slides) ? slides.length : 0;
        }
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

        if (presentation.generatedPptxUrl) {
            const filePath = path.join(__dirname, '../../uploads/pptx', path.basename(presentation.generatedPptxUrl));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

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

        const outputDir = path.join(__dirname, '../../uploads/pptx');
        const { enableAnimations } = req.body;
        const result = await pptxService.generatePptx(presentation, outputDir, { enableAnimations });

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

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
        res.setHeader('Content-Disposition', `attachment; filename="${presentation.title.replace(/[^a-zA-Z0-9]/g, '_')}.pptx"`);

        const fileStream = fs.createReadStream(filePath);
        fileStream.on('error', (streamError) => {
            console.error('Download stream error:', streamError);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Failed to stream presentation file'
                });
            }
        });
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
