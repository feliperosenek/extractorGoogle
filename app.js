const puppeteer = require('puppeteer');
const fs = require('fs')
const express = require('express');
const bodyParser = require('body-parser')

const api = express();
api.use(express.json());
api.use(express.urlencoded({
    extended: true
}));
api.use(bodyParser.urlencoded({ extended: false }))
api.use(bodyParser.json())

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

app()

async function app() {

    var options = {
        // args: ['--no-sandbox', '--disable-setuid-sandbox'],
        //ignoreDefaultArgs: ['--disable-extensions'],
        headless: false,
    };

    let browser = await puppeteer.launch(options);
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 600 });

    console.log("Browser Opened!");

    try {


        const form = `<!DOCTYPE html>
        <html>
        <body>
            <h1>Formulário POST</h1>
            <form action="http://localhost:3000" method="POST">
                <textarea id="mensagem" name="data" rows="4" cols="50" required></textarea><br><br>
        
                <input type="submit" value="Enviar">
            </form>
        </body>
        </html>
        `

        api.get('/', async (req, res) => {
            res.send(form)
        })

        api.post('/', async (req, res) => {
            console.log(req.body)
           

            var search = req.body.data
            var emails = []

            search = search.split("\n")

            console.log(search)

            var i = search.length

            while (i != 0) {                

                var url = search[i-1].split(" ").join("+")
                console.log(url)

                await page.goto("https://www.google.com/search?q=" + url)

                await delay(2000)

                const pageContent = await page.evaluate(() => {
                    return document.body.textContent;
                  });

                  const emailRegex = /[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/g;
                  const emailsEncontrados = pageContent.match(emailRegex);
                
                  // Exibir os endereços de e-mail encontrados
                  if (emailsEncontrados) {
                    console.log('Endereços de e-mail encontrados:');
                    emailsEncontrados.forEach(email => {
                        emails.push(email)
                        fs.appendFileSync('emails.txt', email+ '\n');
                    });
                  } else {
                    console.log('Nenhum endereço de e-mail encontrado.');
                  }
                i--

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
            res.status(200).end()

        })

    } catch (err) {
        console.log(err)
        app()
    }
}


api.listen(process.env.PORT || 3000, () => {
    console.log('API RUN!');
});