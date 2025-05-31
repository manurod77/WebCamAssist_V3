import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/generate', async (req, res) => {
  try {
    const { message, tone, intensity } = req.body;

    const prompt = `
Genera una respuesta creativa para el siguiente mensaje.
Tono: ${tone}
Intensidad: ${intensity}
Mensaje: "${message}"

Respuesta:
`;

    const completion = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 150,
      temperature: intensity === 'alta' ? 0.9 : intensity === 'media' ? 0.7 : 0.5,
    });

    res.json({ reply: completion.data.choices[0].text.trim() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: 'Error al generar la respuesta.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});
