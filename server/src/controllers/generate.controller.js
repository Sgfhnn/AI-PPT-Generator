const Presentation = require('../models/Presentation.model');
const User = require('../models/User.model');
const geminiService = require('../services/gemini.service');
const fileService = require('../services/file.service');

const ALLOWED_THEMES = new Set([
    'dark-gradient',
    'dark-minimal',
    'dark-corporate',
    'dark-creative',
    'dark-tech'
]);

const getTheme = (theme) => (ALLOWED_THEMES.has(theme) ? theme : 'dark-gradient');

const getSlideCount = (value, maxSlides = 15) => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return 8;
    }

    return Math.min(Math.max(parsed, 3), maxSlides);
};

exports.fromText = async (req, res) => {
    try {
        const { content, title } = req.body;
        const slideCount = getSlideCount(req.body.slideCount);
        const theme = getTheme(req.body.theme);

        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Content must be at least 50 characters long'
            });
        }

        const generatedContent = await geminiService.generatePresentationContent(content, {
            slideCount,
            theme
        });

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

exports.fromFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const slideCount = getSlideCount(req.body.slideCount);
        const theme = getTheme(req.body.theme);
        const { title } = req.body;

        const extractedData = await fileService.extractText(req.file.path);
        const content = extractedData.text;

        if (!content || content.trim().length < 50) {
            await fileService.deleteFile(req.file.path);
            return res.status(400).json({
                success: false,
                message: 'Extracted content is too short. Please upload a file with more content.'
            });
        }

        let processedContent = content;
        if (content.length > 10000) {
            processedContent = await geminiService.summarizeText(content, 2000);
        }

        const generatedContent = await geminiService.generatePresentationContent(processedContent, {
            slideCount,
            theme
        });

        const sourceType = fileService.getFileType(req.file.originalname);

        const presentation = new Presentation({
            user: req.user._id,
            title: title || generatedContent.presentationTitle,
            originalContent: content.substring(0, 5000),
            sourceType,
            slides: generatedContent.slides,
            theme,
            status: 'generated'
        });

        await presentation.save();

        await User.findByIdAndUpdate(req.user._id, {
            $inc: { presentationsCount: 1 }
        });

        await fileService.deleteFile(req.file.path);

        res.status(201).json({
            success: true,
            message: 'Presentation generated from file successfully',
            data: { presentation }
        });
    } catch (error) {
        console.error('Generate from file error:', error);

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

exports.improve = async (req, res) => {
    try {
        const instruction = req.body?.instruction?.trim();

        if (!instruction || instruction.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an improvement instruction of at least 10 characters.'
            });
        }

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

        const currentContent = {
            presentationTitle: presentation.title,
            slides: presentation.slides
        };

        const improvedContent = await geminiService.improveContent(currentContent, instruction);

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

exports.preview = async (req, res) => {
    try {
        const { content } = req.body;
        const slideCount = getSlideCount(req.body.slideCount, 5);

        if (!content || content.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Content must be at least 50 characters long'
            });
        }

        const generatedContent = await geminiService.generatePresentationContent(content, {
            slideCount
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
