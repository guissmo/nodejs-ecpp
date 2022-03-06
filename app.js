const http = require('http')
const express = require('express')
const app = express();

const fs = require('fs');
const hb = require('handlebars');

const server = http.createServer(app);

const {exec} = require('child_process');

const latex = require('node-latex');
const input = fs.readFileSync('./aux_files/test-template.tex');

console.log(input)

const temp = hb.compile(input.toString());
const contents = temp({number: '8675309'});

console.log(contents)

const output = fs.createWriteStream('./aux_files/output.pdf');
const pdf = latex(contents)
pdf.pipe(output)
pdf.on('error', err => console.error(err))
pdf.on('finish', () => console.log('PDF generated!'))

const prime = '100000000000000000000000000000000069';
fs.writeFile('./aux_files/script.gp', 'write("./aux_files/cert.txt",primecert('+prime+'))', err => {
    if(err) {
        console.log(err)
    }
    return
})
exec('gp ./aux_files/script.gp');

app.use('/', (req, res, next) => {
    res.send("Hello world...")
})

server.listen(3000)

