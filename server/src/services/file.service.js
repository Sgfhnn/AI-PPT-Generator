const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class FileService {
    async extractText(filePath) {
        const ext = path.extname(filePath).toLowerCase();

        switch (ext) {
            case '.pdf':
                return await this.extractFromPdf(filePath);
            case '.docx':
            case '.doc':
                return await this.extractFromWord(filePath);
            case '.txt':
                return await this.extractFromText(filePath);
            default:
                throw new Error(`Unsupported file type: ${ext}`);
        }
    }

    async extractFromPdf(filePath) {
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return {
                text: data.text,
                pageCount: data.numpages,
                info: data.info
            };
        } catch (error) {
            throw new Error(`Failed to extract text from PDF: ${error.message}`);
        }
    }

    async extractFromWord(filePath) {
        try {
            const result = await mammoth.extractRawText({ path: filePath });
            return {
                text: result.value,
                messages: result.messages
            };
        } catch (error) {
            throw new Error(`Failed to extract text from Word document: ${error.message}`);
        }
    }

    async extractFromText(filePath) {
        try {
            const text = fs.readFileSync(filePath, 'utf-8');
            return {
                text,
                encoding: 'utf-8'
            };
        } catch (error) {
            throw new Error(`Failed to read text file: ${error.message}`);
        }
    }

    async deleteFile(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (error) {
            console.error(`Failed to delete file: ${error.message}`);
        }
    }

    getFileType(filename) {
        const ext = path.extname(filename).toLowerCase();
        const typeMap = {
            '.pdf': 'pdf',
            '.docx': 'docx',
            '.doc': 'docx',
            '.txt': 'txt'
        };
        return typeMap[ext] || 'unknown';
    }
}

module.exports = new FileService();
