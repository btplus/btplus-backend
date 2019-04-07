const AssistantV1 = require('watson-developer-cloud/assistant/v1');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var cors = require('cors');
app.use(cors())

let Promise = require('bluebird');

app.get('/', function (req, res) {
    res.send("response");
});

var port = process.env.PORT || 3001
app.listen(port, function () {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

var fs = require('fs');
var https = require('https');

var options = {
    key: fs.readFileSync('./certs/server-key.pem'),
    cert: fs.readFileSync('./certs/server-crt.pem'),
    ca: fs.readFileSync('./certs/ca-crt.pem'),
};

https.createServer(options, app, function (req, res) {
}).listen(3000);


const assistant = new AssistantV1({
    username: 'apikey',
    password: 'wXgR4HPVBQ3ta2JoOYeNRRR4rxv0vSryJ4QhpxeazeYK',
    url: 'https://gateway.watsonplatform.net/assistant/api/',
    version: '2018-02-16',
});

app.post('/conversation/', (req, res) => {
    const { text, context = {} } = req.body;

    const params = {
        input: { text },
        workspace_id: 'a6ac6811-d963-4989-bd47-e6d651aa6575',
        context,
    };

    assistant.message(params, (err, response) => {
        if (err) {
            console.error(err);
            res.status(500).json(err);
        } else {

            let resp = {
                text: response.output.text[0],
                context: response.context,
                output: response.output.text[0]
            }





            res.json(resp);
        }
    });
});

// USUARIO
// {
//     _id: 1234
//     "nome": "Catossi",
//     "idade": 21
//     "dataAdmissao": "21/03/2019"
// }

// COMPROMISSO
// {
//  "titulo": "Exame de sangue",
//  "status": "S" // A
//  "tipo": "EXAME" // CURSO
// }

// AGENDA
// {
//     "idUsario": 1234,
//     "idCompromisso": 123,
//     "tipo": "EXAME", // CURSO
//     "status": "P" // F
//     "horario": "23/05/2019 12:00:00"
// }


