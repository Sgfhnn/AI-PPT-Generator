const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
    slideNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: [String],
        default: []
    },
    notes: {
        type: String,
        default: ''
    },
    layout: {
        type: String,
        enum: ['title', 'title-content', 'two-column', 'image-content', 'bullets', 'quote'],
        default: 'title-content'
    },
    imageUrl: {
        type: String,
        default: null
    }
});

const presentationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: [true, 'Presentation title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        default: '',
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    originalContent: {
        type: String,
        required: true
    },
    sourceType: {
        type: String,
        enum: ['text', 'pdf', 'docx', 'txt'],
        default: 'text'
    },
    slides: [slideSchema],
    theme: {
        type: String,
        enum: ['dark-gradient', 'dark-minimal', 'dark-corporate', 'dark-creative', 'dark-tech'],
        default: 'dark-gradient'
    },
    slideCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['draft', 'generated', 'exported'],
        default: 'draft'
    },
    generatedPptxUrl: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update slide count before saving
presentationSchema.pre('save', function (next) {
    this.slideCount = this.slides.length;
    next();
});

// Index for faster queries
presentationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Presentation', presentationSchema);
