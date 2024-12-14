import express from 'express';
import bodyParser from 'body-parser';
import WebSocket from 'ws';
import dotenv from 'dotenv';

dotenv.config();

const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
const ws = new WebSocket(url, {
    headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1",
    },
});

ws.on("open", function open() {
    console.log("Connected to OpenAI server.");
});

ws.on("message", function incoming(message) {
    console.log('Received from OpenAI:', message);
});

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/message', (req, res) => {
    const userMessage = req.body.message;
    console.log('Received message from user:', userMessage);
    
    ws.send(JSON.stringify({
        type: "response.create",
        response: {
            modalities: ["text"],
            instructions: userMessage,
        }
    }));
    console.log('Sent message to OpenAI.');

    ws.on("message", (message) => {
        console.log('Received response from OpenAI:', message);
        const response = JSON.parse(message);
        if (response.type === 'response.complete') {
            console.log('OpenAI response complete:', response.response.text);
            res.json({ response: response.response.text });
        }
    });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
