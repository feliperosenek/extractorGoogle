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

function removerCaracteresAposBr(email) {
    const novoEmail = email.replace(/\.br.*/, '.br');
    return novoEmail;
}

api.get('/', (req, res) => {
    const form = `<!DOCTYPE html>
    <html>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossorigin="anonymous">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossorigin="anonymous"></script>
    <body>
        <style>
        body {
            padding: 100px;
        }
        
        h1 {
            margin-bottom: 34px;
        }</style>
        <h1 class="text-center" >Pesquisa E-mails Google</h1>
        <form action="/" method="POST">
        <div class="form-group">
        <textarea class="form-control" name="data" rows="5" cols="5"></textarea>
      </div>
      <div style="margin-top:30px" class="row">
      <div class="col-md-12 text-center">
      <button type="submit" class="btn btn-primary btn-lg">Pesquisar</button>
        </div>
        </div>
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
                    emails.push(removerCaracteresAposBr(email));
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
