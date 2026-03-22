const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('GEMINI_API_KEY not set. AI features will not work.');
            this.client = null;
            return;
        }

        this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.models = [
            'gemini-2.5-flash',
            'gemini-2.0-flash',
            'gemini-2.0-flash-exp',
            'gemini-1.5-flash',
            'gemini-1.5-pro'
        ];
    }

    normalizeSlideCount(slideCount, maxSlides = 15) {
        const parsed = Number.parseInt(slideCount, 10);

        if (Number.isNaN(parsed)) {
            return 8;
        }

        return Math.min(Math.max(parsed, 3), maxSlides);
    }

    extractJsonPayload(text) {
        const cleanedText = text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();

        const jsonStart = cleanedText.indexOf('{');
        const jsonEnd = cleanedText.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1 || jsonEnd < jsonStart) {
            throw new Error('AI response did not contain a valid JSON object');
        }

        return cleanedText.slice(jsonStart, jsonEnd + 1);
    }

    parsePresentationResponse(text, expectedSlideCount) {
        const parsed = JSON.parse(this.extractJsonPayload(text));

        if (!parsed.presentationTitle || !Array.isArray(parsed.slides)) {
            throw new Error('Invalid response structure from AI');
        }

        const slides = parsed.slides
            .filter((slide) => slide && typeof slide.title === 'string')
            .slice(0, expectedSlideCount)
            .map((slide, index) => ({
                slideNumber: index + 1,
                title: slide.title.trim() || `Slide ${index + 1}`,
                layout: slide.layout || (index === 0 ? 'title' : 'title-content'),
                content: Array.isArray(slide.content)
                    ? slide.content
                        .map((point) => String(point).trim())
                        .filter(Boolean)
                        .slice(0, 5)
                    : [],
                notes: typeof slide.notes === 'string' ? slide.notes.trim() : ''
            }));

        if (slides.length === 0) {
            throw new Error('AI response did not include any usable slides');
        }

        return {
            presentationTitle: parsed.presentationTitle.trim(),
            slides
        };
    }

    async generateWithFallback(prompt) {
        let lastError = null;

        for (const modelName of this.models) {
            try {
                console.log(`Attempting to generate with model: ${modelName}`);
                const model = this.client.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const response = await result.response;
                return response.text();
            } catch (error) {
                console.warn(`Failed with ${modelName}: ${error.message}`);
                lastError = error;
            }
        }

        throw lastError || new Error('All models failed');
    }

    async generatePresentationContent(content, options = {}) {
        if (!this.client) {
            throw new Error('Gemini API key not configured');
        }

        const slideCount = this.normalizeSlideCount(options.slideCount);
        const theme = options.theme || 'professional';
        const language = options.language || 'English';

        const prompt = `You are an expert presentation designer. Create a professional presentation structure from the following content.

INPUT CONTENT:
${content}

REQUIREMENTS:
- Create exactly ${slideCount} slides
- Language: ${language}
- Style: ${theme}
- Each slide should have a clear, concise title
- Content should be bullet points (3-5 per slide)
- Include speaker notes for each slide
- First slide should be a title slide
- Last slide should be a conclusion/summary or Q&A slide

RESPOND IN THIS EXACT JSON FORMAT (no markdown, just pure JSON):
{
  "presentationTitle": "Main title of the presentation",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "layout": "title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes for this slide"
    }
  ]
}

Layout options: "title" (for title slide), "title-content" (standard), "bullets" (list heavy), "two-column" (comparisons), "quote" (for quotes or key statements)

Important:
- Return ONLY valid JSON, no explanations or markdown
- Ensure content is engaging and well-structured
- Make titles catchy and informative
- Keep bullet points concise (max 12 words each)`;

        try {
            const text = await this.generateWithFallback(prompt);
            return this.parsePresentationResponse(text, slideCount);
        } catch (error) {
            console.error('Gemini API Error:', error);

            if (process.env.NODE_ENV === 'production') {
                throw new Error(`Failed to generate presentation content: ${error.message}`);
            }

            console.log('Falling back to mock data due to AI generation error');
            return {
                presentationTitle: 'AI Presentation (Mock Data)',
                slides: [
                    {
                        slideNumber: 1,
                        title: 'Welcome to AI PPT Generator',
                        layout: 'title',
                        content: ['Generated when AI is unavailable', 'Demonstrates app functionality', 'Seamless fallback experience'],
                        notes: 'This sample slide was generated because the Gemini API request failed.'
                    },
                    {
                        slideNumber: 2,
                        title: 'Project Overview',
                        layout: 'title-content',
                        content: ['Full-stack Next.js application', 'Express and MongoDB backend', 'Google Gemini AI integration', 'PowerPoint export capabilities'],
                        notes: 'The application uses a modern stack with robust error handling.'
                    },
                    {
                        slideNumber: 3,
                        title: 'Key Features',
                        layout: 'bullets',
                        content: ['Dark mode UI', 'Glassmorphism design', 'Real-time generation', 'Multiple themes'],
                        notes: 'Users can choose from various themes and export their work instantly.'
                    },
                    {
                        slideNumber: 4,
                        title: 'Next Steps',
                        layout: 'title-content',
                        content: ['Add a valid API key', 'Check Google Cloud Console', 'Enable the Generative Language API', 'Try generation again'],
                        notes: 'To enable real AI generation, add your Gemini API key to the server environment.'
                    }
                ]
            };
        }
    }

    async improveContent(content, instruction) {
        if (!this.client) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = `Improve the following presentation content based on this instruction: "${instruction}"

CONTENT:
${JSON.stringify(content, null, 2)}

Return the improved content in the same JSON format. Only return valid JSON, no explanations.`;

        try {
            const text = await this.generateWithFallback(prompt);
            return this.parsePresentationResponse(text, content.slides?.length || 8);
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to improve content: ${error.message}`);
        }
    }

    async summarizeText(text, maxWords = 500) {
        if (!this.client) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = `Summarize the following text in about ${maxWords} words, preserving the key points and main ideas:

${text}

Provide a clear, structured summary that can be used to generate a presentation.`;

        try {
            return await this.generateWithFallback(prompt);
        } catch (error) {
            console.error('Gemini API Error:', error);
            throw new Error(`Failed to summarize text: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();
