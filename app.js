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

    const regexAlphaNumericSpace = /[A-Za-z0-9 ]+/g;
    const regexStrictlyNumeric = /[0-9]+/g;
    const nameArray = req.body.name.match(regexAlphaNumericSpace);
    const numbArray = req.body.number.match(regexStrictlyNumeric);

    console.log(nameArray)
    console.log(numbArray)
    console.log(req.body.name)
    console.log(req.body.number)

    if(nameArray === null || numbArray === null || nameArray.length != 1 || numbArray.length != 1 || nameArray[0] != req.body.name || numbArray[0] != req.body.number){
        res.status(200).json({
            error: 1,
            message: "Invalid input. Try again."
        })
        return;
    }

    if(req.body.number == "57"){
        res.status(200).json({
            error: 0,
            special: 1,
            message: "I'm sorry, this number has already been named after Grothendieck!"
        })
        return;
    }

    pari.primalityCertificate(req.body.number, req.body.name, filename)
    const watch = fs.watch('./aux_files/', (et, fn) => {
        console.log(et)
        console.log(fn)
        if(fn === filename+'.pdf'){
            res.status(200).json({
                error: 0,
                isBigPrime: 1,
                special: 0,
                name: req.body.name,
                number: req.body.number,
                filename: filename
            })
            watch.close()
        }
        if(fn === `composite${ req.body.number }.txt`){
            res.status(200).json({
                error: 0,
                isBigPrime: 0,
                isPrime: 0,
                special: 0,
                name: req.body.name,
                number: req.body.number
            })
            watch.close()
        }
        if(fn === `smallPrime${ req.body.number }.txt`){
            res.status(200).json({
                error: 0,
                isBigPrime: 0,
                special: 0,
                isPrime: 1,
                name: req.body.name,
                number: req.body.number
            })
            watch.close()
        }
    })
})

server.listen(3000)

