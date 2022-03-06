const fs = require('fs');
const hb = require('handlebars');

const util = require('util');

const exec = util.promisify(require('child_process').exec);

const latex = require('node-latex');
const input = fs.readFileSync('./aux_files/test-template.tex');
const temp = hb.compile(input.toString());

const fsWriteFileSync = util.promisify(fs.writeFileSync);
const fsReadFileSync = util.promisify(fs.readFileSync);

async function primalityCertificate(integer) {
    await fs.writeFileSync(
        './aux_files/script.gp',
        'F=fileopen("./aux_files/cert.txt","w");N=primecert('+integer+');filewrite(F,vector(#N,i,vector(#N[i],j,Str(N[i][j]))));fileclose(F);quit()',
        );
    await exec('gp -fq ./aux_files/script.gp');
    const ret = fs.readFileSync('./aux_files/cert.txt').toString();
    console.log( JSON.parse(ret) )
    // const contents = temp({data: [{
    //     number: 69,
    //     string: "Hey"
    // }]});

    // console.log(contents)
    // const output = fs.createWriteStream('./aux_files/output.pdf');
    // const pdf = latex(contents)
    // pdf.pipe(output)
    // pdf.on('error', err => console.error(err))
    // pdf.on('finish', () => console.log('PDF generated!'))

}

exports.primalityCertificate = primalityCertificate;