const http = require('http')
const express = require('express')
const app = express();

const fs = require('fs');
const hb = require('handlebars');

const server = http.createServer(app);

const pari = require('./util/pari');

pari.primalityCertificate("1000000000000000000000000000000000000000000000000000000000000000000009")

app.use('/', (req, res, next) => {
    res.send("Hello world...")
})

server.listen(3000)

