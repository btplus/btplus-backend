const AssistantV1 = require('watson-developer-cloud/assistant/v1');
var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var connFactory = require("./connection/connFactory.js");

var cors = require('cors');
app.use(cors())

let Promise = require('bluebird');

let paramsCloudant = {
    "username": "96ba32ad-e17d-494f-a93e-72240b1e0b16-bluemix",
    "host": "96ba32ad-e17d-494f-a93e-72240b1e0b16-bluemix.cloudant.com",
    "dbname": "btplus",
    "password": "e373c010bcb53c3ea89a59f7fa2642789e7bfe3128bab1c3e2762b713ab04641"
};

app.get('/', function (req, res) {
    res.send("response");
});

// GET
// https://btplus.mybluemix.net/compromissos
// https://btplus.mybluemix.net/agenda/{idUsuario}
// https://btplus.mybluemix.net/usuarios


app.get('/compromissos', function (req, res) {
    let query = {
        selector: {
            tipo: "COMPROMISSO"
        }
    };

    let request = connFactory.getDocument(paramsCloudant, query)
    request.then(function (result) {
        if (result[0] != undefined) {
            res.send(result);
        } else {
            res.send({});
        }
    })
});

app.get('/agenda/:id', function (req, res) {
    let query = {
        selector: {
            tipo: "AGENDA",
            idUsuario: (req.params.id)
        }
    };

    let request = connFactory.getDocument(paramsCloudant, query)
    request.then(function (result) {
        if (result[0] != undefined) {
            res.send(result);
        } else {
            res.send({});
        }
    })
});

app.get('/usuarios', function (req, res) {
    let query = {
        selector: {
            tipo: "USUARIO",
        }
    };

    let request = connFactory.getDocument(paramsCloudant, query)
    request.then(function (result) {
        if (result[0] != undefined) {
            res.send(result);
        } else {
            res.send({});
        }
    })
});

app.post('/usuarios', function (req, res) {
    let request = connFactory.insert(req, paramsCloudant, req.body)
    request.then(function (result) {
        res.json(result);
    });
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

            if(resp.text == "function:CONSULTA_PENDENCIAS") {
                let query = {
                    selector: {
                        tipo: "COMPROMISSO",
                        realizado: false
                    }
                };
            
                let request = connFactory.getDocument(paramsCloudant, query)
                request.then(function (result) {

                    resp.compromissos = result;
                    resp.output = "Veja suas pendências!";

                    if (result[0] != undefined) {
                        res.json(resp);
                    } else {
                        res.send({});
                    }
                })

            } else {
                res.json(resp);
            }

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


