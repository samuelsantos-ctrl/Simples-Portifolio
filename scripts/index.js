const selector = document.getElementById("script-selector");
const title = document.getElementById("script-title");
const results = document.getElementById("results");
const codeDisplay = document.getElementById("code-display");
const copyBtn = document.getElementById("copy-btn");
const downloadBtn = document.getElementById("download-btn");
const truncationNote = document.getElementById("truncation-note");

let currentCode = "";

// Função para formatar e truncar resultados
function formatResult(result) {
    // Se for array
    if (Array.isArray(result)) {
        if (result.length <= 100) {
            return {
                text: result.join(", "),
                note: "",
            };
        } else {
            // Primeiros 10 e últimos 10
            const firstTen = result.slice(0, 100).join(", ");
            //const lastTen = result.slice(-10).join(', ');
            return {
                text: `${firstTen}...`,
                note: `Mostrando primeiros 100. Total: ${result.length} itens.`,
            };
        }
    }
    // Se for string
    else {
        const str = String(result);
        if (str.length <= 1000) {
            return {
                text: str,
                note: "",
            };
        } else {
            return {
                text: str.substring(0, 1500) + "...",
                note: `Total: ${str.length} caracteres. Mostrando primeiros 1500.`,
            };
        }
    }
}

selector.addEventListener("change", async () => {
    const filename = selector.value;
    if (!filename) {
        title.textContent = "Visualizador";
        results.textContent = "Selecione um script para ver os resultados";
        codeDisplay.textContent = "";
        truncationNote.textContent = "";
        currentCode = "";
        return;
    }

    const nameWithoutExt = filename.split(".").slice(0, -1).join(".");
    title.textContent = nameWithoutExt;

    try {
        const response = await fetch(`/scripts/display-scripts/${filename}`);
        currentCode = await response.text();

        codeDisplay.textContent = currentCode;
        hljs.highlightElement(codeDisplay);
        results.textContent = "Executando...";
        truncationNote.textContent = "";
        window.resultado = undefined;

        function executeScript(document) {
            return new Promise((resolve) => {
                const workerCode = `
                self.onmessage = function() {
                    let resultado;
                    try {
                        ${currentCode}

                        self.postMessage({
                            ok: true,
                            result: typeof resultado !== "undefined"
                                ? resultado
                                : "Nenhum resultado retornado"
                        });

                    } catch (err) {
                        self.postMessage({
                            ok: false,
                            error: err.message
                        });
                    }
                };
                `;

                const blob = new Blob([workerCode], { type: "application/javascript" });
                const worker = new Worker(URL.createObjectURL(blob));
                
                let timeout = setTimeout(() => {
                    worker.terminate();
                    resolve("Tempo excedido.");
                }, 10000);

                worker.onmessage = function(e) {
                    clearTimeout(timeout); // Limpa o timeout quando recebe resposta
                    if (e.data.ok) {
                        resolve(e.data.result);
                    } else {
                        resolve("Erro: " + e.data.error);
                    }
                    worker.terminate();
                };

                worker.postMessage({});
            });
        }
        
        const result = await executeScript(document);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Formata e exibe o resultado truncado
        const formatted = formatResult(result);
        results.textContent = formatted.text;
        truncationNote.textContent = formatted.note;
    } catch (err) {
        results.textContent = "Erro: " + err.message;
        codeDisplay.textContent = "";
        truncationNote.textContent = "";
        currentCode = "";
    }
});

copyBtn.addEventListener("click", () => {
    if (!currentCode) return;
    navigator.clipboard.writeText(currentCode).then(() => {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = "Copiado!";
        setTimeout(() => (copyBtn.textContent = originalText), 2000);
    });
});

downloadBtn.addEventListener("click", () => {
    if (!currentCode || !selector.value) return;
    const blob = new Blob([currentCode], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selector.value;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});
