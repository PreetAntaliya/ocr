const express = require('express');
const tesseract = require('tesseract.js');
const axios = require('axios');
const cors = require('cors')

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors())

app.post('/ocr', async (req, res) => {
    try {
        const { imageUrl } = req.body;

        if (!imageUrl) {
            return res.status(400).json({ error: 'No image URL provided' });
        }

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });

        const imageBuffer = Buffer.from(response.data, 'binary');

        const { data: { text } } = await tesseract.recognize(imageBuffer);

        // Extract DOB from the text using a regular expression
        const dobRegex = /\b\d{2}\/\d{2}\/\d{4}\b/;
        const dobMatch = text.match(dobRegex);
        const dob = dobMatch ? `DOB: ${dobMatch[0]}` : 'null';
        console.log(dob);
        console.log(dobMatch);
        
        res.json({ extractedData: dob });
    } catch (error) {
        console.error('Error processing the image:', error);
        res.status(500).json({ error: 'Failed to process image' });
    }
});

app.listen(port, () => {
    console.log(`OCR API running on port ${port}`);
});
