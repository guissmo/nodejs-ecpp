const http = require('http')
const express = require('express')
const app = express();

const server = http.createServer(app);

const {exec} = require('child_process')
const child = exec('echo Hello World')

child.stdout.on('data', (msg) => {
    console.log(`I said: ${msg}`);
})

app.use('/', (req, res, next) => {
    res.send("Hello world...")
})

server.listen(3000)

