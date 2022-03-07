const http = require('http')
const express = require('express')
const app = express();

const path = require('path');

const fs = require('fs');
const { engine } = require('express-handlebars');

const server = http.createServer(app);

const pari = require('./util/pari');

app.engine('hbs', engine())
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use('/lala', express.static(path.join(__dirname, './aux_files')));

app.get('/', (req, res, next) => {
    res.render('home')
})

app.get('/createFile', (req, res) => {
    var fs = require("fs");

    var writeStream = fs.createWriteStream("./aux_files/dynamic_file.txt");
    writeStream.write("Hi,  Users. I am generated after the /createFile get request. ");
    writeStream.write("Thank You.");
    writeStream.end();

    res.send('File is generated. Click <a href="./lala/dynamic_file.txt"> here </a> to see the file. Save/download the file using ctrl+s');
});

app.get('/:number', (req, res, next) => {
    const filename = Math.floor(Math.random()*10000)
    console.log(filename)
    pari.primalityCertificate("1329227995784915872903807060280345027", filename)
    const watch = fs.watch('./aux_files/', (et, fn) => {
        console.log(et)
        console.log(fn)
        if(fn === filename+'.pdf'){
            res.render('home', {filename: filename})
            watch.close()
        }
    })
    console.log('bbb')
})

server.listen(3000)

