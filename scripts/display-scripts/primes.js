const num = []; // inicializacao do array de 1 - 10k

for (let i = 1; i <= 10000; i++) {
    num.push(i);
}

function verifyPrime(N) {
    if (N === 2) {
        return true;
    }
    for (let i = 2; i * i <= N; i++) {
        if (N % i === 0) {
            return false;
        }
    }
    return true;
}

function findPrimes(raw) {
    let resultadoPrimo = []
    const array = raw.filter(v => v === 2 || v % 2 !== 0);  // descarte de numeros pares
    for (let j = 0; j < array.length - 1; j++) {
        if (verifyPrime(array[j]) === true) { // retorna numeros primos
            resultadoPrimo.push(array[j]);
        }
    }
    return resultadoPrimo;
}
const resultado = findPrimes(num);
console.log(resultado);
