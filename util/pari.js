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

async function primalityCertificate(integer, filename) {
    await fs.writeFileSync(
        './aux_files/script.gp',
        'F=fileopen("./aux_files/cert.txt","w");N=primecert('+integer+');filewrite(F, vector(#N,i, apply( x->Str(x), [i, N[i][1],N[i][2], N[i][1]+1-N[i][2], (N[i][1]+1-N[i][2])/N[i][3], N[i][4], (N[i][5][2]^2-N[i][5][1]^3-N[i][4]*N[i][5][1])%N[i][1], N[i][5][1], N[i][5][2] ]))  );fileclose(F);quit()',
        );
    await exec('gp -fq ./aux_files/script.gp');
    const ret = fs.readFileSync('./aux_files/cert.txt').toString();
    
    const cert = JSON.parse(ret);
    
    let texCode = texHead({});
    for(let c in cert){
        const [i, Ni, ti, mi, qi, ai, bi, xi, yi] = cert[c];
        texCode += texBody({
            i: i,
            Ni: Ni,
            ti: ti,
            mi: mi,
            qi: qi,
            ai: ai,
            bi: bi,
            xi: xi,
            yi, yi
        })
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

}

exports.primalityCertificate = primalityCertificate;