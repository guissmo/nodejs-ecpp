const http = require('http')
const express = require('express')

const app = express();

const server = http.createServer(app);

app.use('/', (req, res, next) => {
    res.send('<h1>Hello World!</h1>')
})

server.listen(3000)

