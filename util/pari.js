const fs = require('fs');
const hb = require('handlebars');

const { join } = require('path');
const auxFilesDir = join('__dirname', '..', 'aux_files');

const util = require('util');

const exec = util.promisify(require('child_process').exec);

const latex = require('node-latex');

function latexPrimeSize(Ni) {
    let sizeForThis = '\\tiny\\vspace{0.2em}';
    if( Ni.length < 160) sizeForThis = '\\footnotesize\\vspace{-0.6em}'
    if( Ni.length < 120) sizeForThis = '\\normalsize\\vspace{-0.9em}'
    if( Ni.length < 80)  sizeForThis = '\\Large\\vspace{-1.3em}'
    if( Ni.length < 40)  sizeForThis = '\\Huge\\vspace{-1.6em}'
    return(sizeForThis)
}

function latexAddPage(partialCert, ngalan, first) {
    const [i, Ni, ti, mi, qi, ai, bi, xi, yi] = partialCert;
    return(texBody({
        i: i,
        Ni: Ni,
        ti: ti,
        mi: mi,
        qi: qi,
        ai: ai,
        bi: bi,
        xi: xi,
        yi: yi,
        size: latexPrimeSize(Ni),
        henceforth: hence(ngalan, first)
    }));
}

function hbCompile(templateFile) {
    return hb.compile(fs.readFileSync(join('__dirname', '..', 'tex-templates', templateFile)).toString());
}

function hence(ngalan) {
    let hence = `It will henceforth be known as \\textbf{The ${ ngalan } Prime}.`;
    if( !first ) hence = "";
    return(hence)
}

const texHead = hbCompile('template-head.tex');
const texBody = hbCompile('template-body.tex');
const texLast = hbCompile('template-last.tex');
const texFoot = hbCompile('template-foot.tex');

const fsWriteFileSync = util.promisify(fs.writeFileSync);
const fsReadFileSync = util.promisify(fs.readFileSync);

async function primalityCertificate(integer, ngalan, filename) {
    await fs.writeFileSync(
        `${ join(auxFilesDir, 'script.gp')}`,
        `default("parisizemax",1G);\nF=fileopen("${ join(auxFilesDir, 'cert.txt') }","w");N=primecert(${ integer });ret=if(type(N)=="t_INT",if(N==0, concat("C",Str(factor(${ integer },10^6))), Str(N)),vector(#N,i, apply( x->Str(x), [i, N[i][1],N[i][2], N[i][1]+1-N[i][2], (N[i][1]+1-N[i][2])/N[i][3], N[i][4], (N[i][5][2]^2-N[i][5][1]^3-N[i][4]*N[i][5][1])%N[i][1], N[i][5][1], N[i][5][2] ])));filewrite(F, ret);fileclose(F);quit()`,
        );
    await exec(`gp -fq ${ join(auxFilesDir, 'script.gp') }`);

    const ret = fs.readFileSync(`${ join(auxFilesDir, 'cert.txt') }`).toString();

    console.log(ret[0], "~~~~")
    
    if(ret[0] == '[') {
        const cert = JSON.parse(ret);
        let texCode = texHead({});
        first = true;
        for(let c in cert){
            texCode += latexAddPage(cert[c], ngalan, first);
            first = false;
        }
        texCode += texLast({
            i: cert.length,
            qi: cert[cert.length-1][4]
        })
        texCode += texFoot({});

        console.log(__dirname)

        const output = fs.createWriteStream(`${ join(auxFilesDir, filename+'.pdf') }`);
        const pdf = latex(texCode, {
            cmd: 'pdflatex',
            errorLogs: join(__dirname, 'latexerrors.log')
        });
        pdf.pipe(output);
        pdf.on('error', err => console.log(err))
        pdf.on('finish', () => {
            console.log('PDF generated!');
        })
    }else if(ret[0] == 'C'){
        console.log("HERE!")
        fs.rename(`${ join(auxFilesDir, 'cert.txt') }`, join(auxFilesDir, 'composite'+integer+'.txt'), (err) => {
            console.log("done", err)
        })
    } else{
        console.log("HERE2!")
        fs.rename(`${ join(auxFilesDir, 'cert.txt') }`, join(auxFilesDir, 'smallPrime'+integer+'.txt'), (err) => {
            console.log("done", err)
        })
    }
    
}

exports.primalityCertificate = primalityCertificate;