const express = require('express');
const bodyParser = require('body-parser');
const cheerio = require('cheerio'); // Adicionamos Cheerio
const axios = require('axios'); // Adicionamos Axios

const api = express();
api.use(express.json());
api.use(express.urlencoded({
    extended: true
}));
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())

api.get('/', (req, res) => {
    const form = `<!DOCTYPE html>
    <html>
    <body>
        <h1>Formulário POST</h1>
        <form action="/" method="POST">
            <textarea id="mensagem" name="data" rows="4" cols="50" required></textarea><br><br>
            <input type="submit" value="Enviar">
        </form>
    </body>
    </html>
    `
    res.send(form);
});

api.post('/', async (req, res) => {
    try {
        const search = req.body.data;
        const emails = [];

        const searchLines = search.split('\n');

        for (const line of searchLines) {
            const formattedLine = line.trim().replace(/\s+/g, '+');
            const googleUrl = `https://www.google.com/search?q=${formattedLine}`;

            const response = await axios.get(googleUrl);
            const html = response.data;

            const $ = cheerio.load(html);
            const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
            const textContent = $('body').text();
            const emailsEncontrados = textContent.match(emailRegex);

            if (emailsEncontrados) {
                emailsEncontrados.forEach(email => {
                    emails.push(email);
                });
            }
        }

        var emailsList = await JSON.stringify(emails)
        emailsList = emailsList.split('"').join()
        emailsList = emailsList.split('[').join()
        emailsList = emailsList.split(']').join()
        emailsList = emailsList.split(',,,').join(",")
        emailsList = emailsList.split(',').join("\n")
        emailsList = emailsList.split(' ').join("\n")
        emailsList = emailsList.replace(/\n/g, '<br>');
        res.send(emailsList)
        res.status(200).end();
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro interno do servidor');
    }
});

api.listen(process.env.PORT || 3000, () => {
    console.log('API RUN!');
});
