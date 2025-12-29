const Presentation = require('../models/Presentation.model');
const User = require('../models/User.model');
const geminiService = require('../services/gemini.service');
const fileService = require('../services/file.service');

// Generate presentation from text
exports.fromText = async (req, res) => {
    try {
        const { content, title, slideCount = 8, theme = 'dark-gradient' } = req.body;

        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Content must be at least 50 characters long'
            });
        }

        // Generate presentation using Gemini
        const generatedContent = await geminiService.generatePresentationContent(content, {
            slideCount: parseInt(slideCount),
            theme
        });

        // Create presentation in database
        const presentation = new Presentation({
            user: req.user._id,
            title: title || generatedContent.presentationTitle,
            originalContent: content,
            sourceType: 'text',
            slides: generatedContent.slides,
            theme,
            status: 'generated'
        });

        await presentation.save();

        // Update user's presentation count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { presentationsCount: 1 }
        });

        res.status(201).json({
            success: true,
            message: 'Presentation generated successfully',
            data: { presentation }
        });
    } catch (error) {
        console.error('Generate from text error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate presentation',
            error: error.message
        });
    }
};

// Generate presentation from file
exports.fromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { slideCount = 8, theme = 'dark-gradient', title } = req.body;

        // Extract text from file
        const extractedData = await fileService.extractText(req.file.path);
        const content = extractedData.text;

        if (!content || content.trim().length < 50) {
            // Clean up uploaded file
            await fileService.deleteFile(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Extracted content is too short. Please upload a file with more content.'
            });
        }

        // Summarize if content is too long (> 10000 chars)
        let processedContent = content;
        if (content.length > 10000) {
            processedContent = await geminiService.summarizeText(content, 2000);
        }

        // Generate presentation using Gemini
        const generatedContent = await geminiService.generatePresentationContent(processedContent, {
            slideCount: parseInt(slideCount),
            theme
        });

        // Determine file type
        const sourceType = fileService.getFileType(req.file.originalname);

        // Create presentation in database
        const presentation = new Presentation({
            user: req.user._id,
            title: title || generatedContent.presentationTitle,
            originalContent: content.substring(0, 5000), // Store first 5000 chars
            sourceType,
            slides: generatedContent.slides,
            theme,
            status: 'generated'
        });

        await presentation.save();

        // Update user's presentation count
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { presentationsCount: 1 }
        });

        // Clean up uploaded file
        await fileService.deleteFile(req.file.path);

        res.status(201).json({
            success: true,
            message: 'Presentation generated from file successfully',
            data: { presentation }
        });
    } catch (error) {
        console.error('Generate from file error:', error);

        // Clean up uploaded file on error
        if (req.file) {
            await fileService.deleteFile(req.file.path);
        }

        res.status(500).json({
            success: false,
            message: 'Failed to generate presentation from file',
            error: error.message
        });
    }
};

// Regenerate/improve existing presentation
exports.improve = async (req, res) => {
    try {
        const { instruction } = req.body;

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

        // Get current slides
        const currentContent = {
            presentationTitle: presentation.title,
            slides: presentation.slides
        };

        // Improve with AI
        const improvedContent = await geminiService.improveContent(currentContent, instruction);

        // Update presentation
        presentation.title = improvedContent.presentationTitle || presentation.title;
        presentation.slides = improvedContent.slides;
        presentation.status = 'generated';
        await presentation.save();

        res.json({
            success: true,
            message: 'Presentation improved successfully',
            data: { presentation }
        });
    } catch (error) {
        console.error('Improve presentation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to improve presentation',
            error: error.message
        });
    }
};

// Preview generation (without saving)
exports.preview = async (req, res) => {
    try {
        const { content, slideCount = 5 } = req.body;

        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Content must be at least 50 characters long'
            });
        }

        // Generate preview
        const generatedContent = await geminiService.generatePresentationContent(content, {
            slideCount: Math.min(parseInt(slideCount), 5) // Limit preview to 5 slides
        });

        res.json({
            success: true,
            message: 'Preview generated successfully',
            data: {
                preview: generatedContent,
                note: 'This is a preview. Save to keep this presentation.'
            }
        });
    } catch (error) {
        console.error('Preview generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate preview',
            error: error.message
        });
    }
};
