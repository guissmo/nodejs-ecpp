const generateButton = async (btn) => {
    
    console.log("Clicked!")
    console.log(btn);

    const ngalan = btn.parentNode.querySelector('[name=name]').value;
    const numero = btn.parentNode.querySelector('[name=number]').value;

    const resultDiv = btn.parentNode.querySelector('[id=result]');
    resultDiv.innerHTML = `<img src='./public/calculating-puzzled.gif' height='200'></img>`;

    const info = await fetch('/generate-pdf', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({name: ngalan, number: numero})
    });

    const content = await info.json();
    if (content.error){
        resultDiv.classList.add('bad');
        resultDiv.innerHTML = content.message;
    } else {
        btn.parentNode.querySelector('[name=name]').value = "";
        btn.parentNode.querySelector('[name=number]').value = "";
        if (content.special){
            resultDiv.classList.add('bad');
            resultDiv.classList.remove('good');
            resultDiv.innerHTML = content.message;
        }else{
            if (content.isBigPrime) {
                resultDiv.classList.add('good');
                resultDiv.classList.remove('bad');
                resultDiv.innerHTML = `We have verified that the number ${content.number} is prime.<br><br>It will henceforth be known as The ${ ngalan } Prime.<br>You can download its primality certificate <a href='/lala/${ content.filename }.pdf'>here</a>!`;
            } else {
                resultDiv.classList.add('bad');
                resultDiv.classList.remove('good');
                let message = "ERROR";
                if(content.isPrime){
                    message = `The integer ${ content.number } is a prime less than 2<sup>64</sup>. We don't do certificates for that! Try a larger prime.`;
                }else{
                    message = `The integer ${ content.number } is NOT prime.`;
                }
                resultDiv.innerHTML = message;
            }
        }
    }
    console.log(content);

}