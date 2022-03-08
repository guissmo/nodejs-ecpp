const fs = require('fs');
const hb = require('handlebars');

const util = require('util');

const exec = util.promisify(require('child_process').exec);

const latex = require('node-latex');
// const input = fs.readFileSync('./tex-templates/test-template.tex');

const texHead = hb.compile(fs.readFileSync('./tex-templates/template-head.tex').toString());
const texBody = hb.compile(fs.readFileSync('./tex-templates/template-body.tex').toString());
const texLast = hb.compile(fs.readFileSync('./tex-templates/template-last.tex').toString());
const texFoot = hb.compile(fs.readFileSync('./tex-templates/template-foot.tex').toString());

const fsWriteFileSync = util.promisify(fs.writeFileSync);
const fsReadFileSync = util.promisify(fs.readFileSync);

async function primalityCertificate(integer, ngalan, filename) {
    await fs.writeFileSync(
        './aux_files/script.gp',
        `default("parisizemax",4G);\nfor(i=1,10^7,1+1);F=fileopen("./aux_files/cert.txt","w");N=primecert(${ integer });ret=if(type(N)=="t_INT",if(N==0, concat("C",Str(factor(${ integer },10^6))), Str(N)),vector(#N,i, apply( x->Str(x), [i, N[i][1],N[i][2], N[i][1]+1-N[i][2], (N[i][1]+1-N[i][2])/N[i][3], N[i][4], (N[i][5][2]^2-N[i][5][1]^3-N[i][4]*N[i][5][1])%N[i][1], N[i][5][1], N[i][5][2] ])));filewrite(F, ret);fileclose(F);quit()`,
        );
    await exec('gp -fq ./aux_files/script.gp');

    const ret = fs.readFileSync('./aux_files/cert.txt').toString();

    console.log(ret[0], "~~~~")
    
    if(ret[0] == '[') {
        const cert = JSON.parse(ret);
        let texCode = texHead({});
        first = true;
        for(let c in cert){
            const [i, Ni, ti, mi, qi, ai, bi, xi, yi] = cert[c];
            let hence = `It will henceforth be known as \\textbf{The ${ ngalan } Prime}.`;
            if( !first ){
                hence = "";
            }
            let sizeForThis = '\\tiny\\vspace{0.2em}';
            if( Ni.length < 160){
                sizeForThis = '\\footnotesize\\vspace{-0.6em}'
            }
            if( Ni.length < 120){
                sizeForThis = '\\normalsize\\vspace{-0.9em}'
            }
            if( Ni.length < 80){
                sizeForThis = '\\Large\\vspace{-1.3em}'
            }
            if( Ni.length < 40){
                sizeForThis = '\\Huge\\vspace{-1.6em}'
            }
            texCode += texBody({
                i: i,
                Ni: Ni,
                ti: ti,
                mi: mi,
                qi: qi,
                ai: ai,
                bi: bi,
                xi: xi,
                yi: yi,
                size: sizeForThis,
                henceforth: hence
            });
            first = false;
        }
        texCode += texLast({
            i: cert.length,
            qi: cert[cert.length-1][4]
        })
        texCode += texFoot({});

        const output = fs.createWriteStream('./aux_files/'+filename+'.pdf');
        const pdf = latex(texCode);
        pdf.pipe(output);
        pdf.on('error', err => console.error(err))
        pdf.on('finish', () => {
            console.log('PDF generated!');
        })
    }else if(ret[0] == 'C'){
        console.log("HERE!")
        fs.rename('./aux_files/cert.txt', `./aux_files/composite${ integer }.txt`, (err) => {
            console.log("done", err)
        })
    } else{
        console.log("HERE2!")
        fs.rename('./aux_files/cert.txt', `./aux_files/smallPrime${ integer }.txt`, (err) => {
            console.log("done", err)
        })
    }
    
}

exports.primalityCertificate = primalityCertificate;