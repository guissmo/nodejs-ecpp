const http = require('http')
const express = require('express')
const app = express();

const path = require('path');

const fs = require('fs');
const { engine } = require('express-handlebars');

const bodyParser = require("body-parser");

const server = http.createServer(app);

const pari = require('./util/pari');

app.engine('hbs', engine())
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use('/lala', express.static(path.join(__dirname, './aux_files')));
app.use('/public', express.static(path.join(__dirname, './public')));

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res, next) => {
    res.render('form')
})

app.post('/generate-pdf', (req, res, next) => {
    
    const filename = Math.floor(Math.random()*10000)

    pari.primalityCertificate(req.body.number, req.body.name, filename)
    const watch = fs.watch('./aux_files/', (et, fn) => {
        console.log(et)
        console.log(fn)
        if(fn === filename+'.pdf'){
            res.status(200).json({
                isBigPrime: 1,
                name: req.body.name,
                number: req.body.number,
                filename: filename
            })
            watch.close()
        }
        if(fn === `composite${ req.body.number }.txt`){
            res.status(200).json({
                isBigPrime: 0,
                isPrime: 0,
                name: req.body.name,
                number: req.body.number
            })
            watch.close()
        }
        if(fn === `smallPrime${ req.body.number }.txt`){
            res.status(200).json({
                isBigPrime: 0,
                isPrime: 1,
                name: req.body.name,
                number: req.body.number
            })
            watch.close()
        }
    })
})

server.listen(3000)

