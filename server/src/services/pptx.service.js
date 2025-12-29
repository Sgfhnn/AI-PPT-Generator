const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

class PptxService {
    constructor() {
        this.themes = {
            'dark-gradient': {
                background: { color: '0f0f23' },
                titleColor: 'ffffff',
                textColor: 'e0e0e0',
                accentColor: '6366f1',
                secondaryColor: '8b5cf6'
            },
            'dark-minimal': {
                background: { color: '1a1a2e' },
                titleColor: 'ffffff',
                textColor: 'c0c0c0',
                accentColor: '00d4ff',
                secondaryColor: '0099cc'
            },
            'dark-corporate': {
                background: { color: '16213e' },
                titleColor: 'ffffff',
                textColor: 'd4d4d4',
                accentColor: '4ade80',
                secondaryColor: '22c55e'
            },
            'dark-creative': {
                background: { color: '1e1e2f' },
                titleColor: 'ffffff',
                textColor: 'b8b8b8',
                accentColor: 'f472b6',
                secondaryColor: 'ec4899'
            },
            'dark-tech': {
                background: { color: '0d1117' },
                titleColor: '58a6ff',
                textColor: 'c9d1d9',
                accentColor: '7ee787',
                secondaryColor: '3fb950'
            }
        };
    }

    async generatePptx(presentation, outputDir, options = {}) {
        const pptx = new PptxGenJS();
        const theme = this.themes[presentation.theme] || this.themes['dark-gradient'];
        const { enableAnimations } = options;

        // Set presentation properties
        pptx.author = 'AI PPT Generator';
        pptx.title = presentation.title;
        pptx.subject = presentation.description || 'AI Generated Presentation';
        pptx.company = 'AI PPT Generator';

        // Define master slides
        pptx.defineSlideMaster({
            title: 'DARK_MASTER',
            background: theme.background,
            objects: [
                // Subtle gradient overlay
                {
                    rect: {
                        x: 0, y: 0, w: '100%', h: '100%',
                        fill: { type: 'solid', color: theme.background.color, transparency: 0 }
                    }
                }
            ]
        });

        // Generate slides
        for (const slideData of presentation.slides) {
            const slide = pptx.addSlide({ masterName: 'DARK_MASTER' });

            switch (slideData.layout) {
                case 'title':
                    this.createTitleSlide(slide, slideData, theme, enableAnimations);
                    break;
                case 'quote':
                    this.createQuoteSlide(slide, slideData, theme, enableAnimations);
                    break;
                case 'two-column':
                    this.createTwoColumnSlide(slide, slideData, theme, enableAnimations);
                    break;
                default:
                    this.createContentSlide(slide, slideData, theme, enableAnimations);
            }

            // Add speaker notes if available
            if (slideData.notes) {
                slide.addNotes(slideData.notes);
            }

            // Add slide number
            slide.addText(`${slideData.slideNumber}`, {
                x: 9.2, y: 5.3, w: 0.5, h: 0.3,
                fontSize: 10,
                color: theme.textColor,
                align: 'right'
            });
        }

        // Ensure output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Generate filename
        const filename = `presentation-${Date.now()}.pptx`;
        const filepath = path.join(outputDir, filename);

        // Save the file
        await pptx.writeFile({ fileName: filepath });

        return {
            filename,
            filepath,
            url: `/uploads/pptx/${filename}`
        };
    }

    createTitleSlide(slide, data, theme, enableAnimations) {
        // Main title
        slide.addText(data.title, {
            x: 0.5, y: 2.0, w: 9, h: 1.5,
            fontSize: 44,
            fontFace: 'Arial',
            color: theme.titleColor,
            bold: true,
            align: 'center',
            valign: 'middle'
        });

        // Subtitle/content if available
        if (data.content && data.content.length > 0) {
            slide.addText(data.content[0], {
                x: 0.5, y: 3.5, w: 9, h: 0.8,
                fontSize: 20,
                fontFace: 'Arial',
                color: theme.accentColor,
                align: 'center'
            });
        }

        // Decorative line
        slide.addShape('rect', {
            x: 3.5, y: 3.3, w: 3, h: 0.05,
            fill: { color: theme.accentColor }
        });
    }

    createContentSlide(slide, data, theme, enableAnimations) {
        // Slide title
        slide.addText(data.title, {
            x: 0.5, y: 0.3, w: 9, h: 0.8,
            fontSize: 32,
            fontFace: 'Arial',
            color: theme.titleColor,
            bold: true
        });

        // Accent line under title
        slide.addShape('rect', {
            x: 0.5, y: 1.0, w: 2, h: 0.04,
            fill: { color: theme.accentColor }
        });

        // Bullet points
        if (data.content && data.content.length > 0) {
            const bulletPoints = data.content.map(point => ({
                text: point,
                options: {
                    bullet: { type: 'bullet', color: theme.accentColor },
                    color: theme.textColor,
                    fontSize: 18,
                    fontFace: 'Arial',
                    paraSpaceAfter: 10
                }
            }));

            slide.addText(bulletPoints, {
                x: 0.5, y: 1.3, w: 9, h: 4,
                valign: 'top'
            });
        }
    }

    createQuoteSlide(slide, data, theme, enableAnimations) {
        // Large quote marks
        slide.addText('"', {
            x: 0.3, y: 1.5, w: 1, h: 1,
            fontSize: 100,
            color: theme.accentColor,
            fontFace: 'Georgia',
            transparency: 50
        });

        // Quote text
        const quoteText = data.content && data.content.length > 0 ? data.content[0] : data.title;
        slide.addText(quoteText, {
            x: 1, y: 2, w: 8, h: 2,
            fontSize: 28,
            fontFace: 'Georgia',
            color: theme.textColor,
            italic: true,
            align: 'center',
            valign: 'middle'
        });

        // Attribution if available
        if (data.content && data.content.length > 1) {
            slide.addText(`— ${data.content[1]}`, {
                x: 1, y: 4, w: 8, h: 0.5,
                fontSize: 16,
                color: theme.accentColor,
                align: 'center'
            });
        }
    }

    createTwoColumnSlide(slide, data, theme, enableAnimations) {
        // Slide title
        slide.addText(data.title, {
            x: 0.5, y: 0.3, w: 9, h: 0.8,
            fontSize: 32,
            fontFace: 'Arial',
            color: theme.titleColor,
            bold: true
        });

        // Split content into two columns
        const midPoint = Math.ceil(data.content.length / 2);
        const leftContent = data.content.slice(0, midPoint);
        const rightContent = data.content.slice(midPoint);

        // Left column
        const leftBullets = leftContent.map(point => ({
            text: point,
            options: {
                bullet: { type: 'bullet', color: theme.accentColor },
                color: theme.textColor,
                fontSize: 16,
                paraSpaceAfter: 8
            }
        }));

        slide.addText(leftBullets, {
            x: 0.5, y: 1.3, w: 4.3, h: 4
        });

        // Right column
        const rightBullets = rightContent.map(point => ({
            text: point,
            options: {
                bullet: { type: 'bullet', color: theme.secondaryColor },
                color: theme.textColor,
                fontSize: 16,
                paraSpaceAfter: 8
            }
        }));

        slide.addText(rightBullets, {
            x: 5.2, y: 1.3, w: 4.3, h: 4
        });

        // Divider line
        slide.addShape('line', {
            x: 4.9, y: 1.3, w: 0, h: 3.5,
            line: { color: theme.accentColor, width: 1, transparency: 50 }
        });
    }
}

module.exports = new PptxService();
