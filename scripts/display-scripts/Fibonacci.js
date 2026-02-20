// Fibonacci sequence generator
const fib = [0, 1];
for (let i = 2; i < 20; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
}
const resultado = fib;
if (typeof document !== 'undefined') {
    document.getElementById('results').textContent = resultado.join(', ');
} else {
    console.log(resultado);
}
