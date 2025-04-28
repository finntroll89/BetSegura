class Calculator {
    constructor() {
        this.setupEventListeners();
        this.MAX_VALUE = 100000000;
        this.marketLabels = {
            resultado: ['Casa', 'Empate', 'Visitante'],
            escanteios: ['Mais', 'Menos', 'Exato'],
            cartoes: ['Mais', 'Menos', 'Exato'],
            gols: ['Mais', 'Menos', 'Exato']
        };
        this.firstEntryType = null;  // Primeira odd inserida
        this.secondEntryType = null; // Segunda odd inserida
    }

    setupEventListeners() {
        // Monitora mudanças nos campos de odd
        ['oddCasa', 'oddEmpate', 'oddVisitante'].forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => {
                this.formatInputValue(input);
                
                // Registra a ordem das odds inseridas
                if (input.value) {
                    if (!this.firstEntryType) {
                        this.firstEntryType = id;
                    } else if (this.firstEntryType !== id && !this.secondEntryType) {
                        this.secondEntryType = id;
                    }
                } else {
                    // Se uma odd for removida, ajusta a ordem
                    if (this.firstEntryType === id) {
                        this.firstEntryType = this.secondEntryType;
                        this.secondEntryType = null;
                    } else if (this.secondEntryType === id) {
                        this.secondEntryType = null;
                    }
                }
                
                this.calcular();
            });
        });

        // Monitora mudanças no valor apostado
        document.getElementById('valorCasa').addEventListener('input', (e) => {
            this.formatInputValue(e.target);
            this.calcular();
        });

        document.getElementById('lucroDesejado').addEventListener('input', (e) => {
            this.formatInputValue(e.target);
            this.calcular();
        });

        // Market type change listener
        const marketSelect = document.getElementById('tipoMercado');
        marketSelect.addEventListener('change', () => {
            this.updateMarketLabels(marketSelect.value);
        });

        // Mantém os outros event listeners existentes
        document.querySelectorAll('.donation-item button').forEach(button => {
            button.addEventListener('click', (e) => {
                const textToCopy = e.target.previousElementSibling.querySelector('.text-muted').textContent;
                this.copyToClipboard(textToCopy);
            });
        });

        const toggleBtn = document.getElementById('toggleDonation');
        const donationInfo = document.getElementById('donationInfo');
        toggleBtn.addEventListener('click', () => {
            const isHidden = donationInfo.style.display === 'none';
            donationInfo.style.display = isHidden ? 'block' : 'none';
            toggleBtn.textContent = isHidden ? 'Fechar informações de doação' : 'Ajude a manter o projeto vivo, Obrigado!';
        });

        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetCalculator());
        }
    }

    calcular() {
        const valorApostado = this.parseLocalNumber(document.getElementById('valorCasa').value);
        const oddCasa = this.parseLocalNumber(document.getElementById('oddCasa').value);
        const oddEmpate = this.parseLocalNumber(document.getElementById('oddEmpate').value);
        const oddVisitante = this.parseLocalNumber(document.getElementById('oddVisitante').value);
        const lucroDesejado = this.parseLocalNumber(document.getElementById('lucroDesejado').value);

        // Se não tiver valor apostado ou nenhuma odd, não calcula
        if (!valorApostado || (!oddCasa && !oddEmpate && !oddVisitante)) {
            document.getElementById('resultados').innerHTML = '';
            return;
        }

        // Inicializa o objeto apostas
        let apostas = {
            casa: 0,
            empate: 0,
            visitante: 0
        };

        // Identifica qual é a terceira entrada (se houver)
        let terceiraEntryType = null;
        if (this.firstEntryType && this.secondEntryType) {
            if (oddCasa && this.firstEntryType !== 'oddCasa' && this.secondEntryType !== 'oddCasa') {
                terceiraEntryType = 'oddCasa';
            } else if (oddEmpate && this.firstEntryType !== 'oddEmpate' && this.secondEntryType !== 'oddEmpate') {
                terceiraEntryType = 'oddEmpate';
            } else if (oddVisitante && this.firstEntryType !== 'oddVisitante' && this.secondEntryType !== 'oddVisitante') {
                terceiraEntryType = 'oddVisitante';
            }
        }

        // Primeira entrada: valor apostado diretamente
        if (this.firstEntryType === 'oddCasa') {
            apostas.casa = valorApostado;
        } else if (this.firstEntryType === 'oddEmpate') {
            apostas.empate = valorApostado;
        } else if (this.firstEntryType === 'oddVisitante') {
            apostas.visitante = valorApostado;
        }

        // Calcula o retorno desejado baseado na primeira aposta e lucro desejado
        let primeiraOdd = 0;
        if (this.firstEntryType === 'oddCasa') primeiraOdd = oddCasa;
        else if (this.firstEntryType === 'oddEmpate') primeiraOdd = oddEmpate;
        else if (this.firstEntryType === 'oddVisitante') primeiraOdd = oddVisitante;

        const retornoDesejado = valorApostado * primeiraOdd * (1 + (lucroDesejado / 100));

        // Segunda entrada: baseada no retorno desejado
        if (this.secondEntryType) {
            let segundaOdd = 0;
            if (this.secondEntryType === 'oddCasa') segundaOdd = oddCasa;
            else if (this.secondEntryType === 'oddEmpate') segundaOdd = oddEmpate;
            else if (this.secondEntryType === 'oddVisitante') segundaOdd = oddVisitante;

            if (segundaOdd > 0) {
                if (this.secondEntryType === 'oddCasa') {
                    apostas.casa = retornoDesejado / segundaOdd;
                } else if (this.secondEntryType === 'oddEmpate') {
                    apostas.empate = retornoDesejado / segundaOdd;
                } else if (this.secondEntryType === 'oddVisitante') {
                    apostas.visitante = retornoDesejado / segundaOdd;
                }
            }
        }

        // Terceira entrada: calculada independentemente
        if (terceiraEntryType) {
            let terceiraOdd = 0;
            if (terceiraEntryType === 'oddCasa') terceiraOdd = oddCasa;
            else if (terceiraEntryType === 'oddEmpate') terceiraOdd = oddEmpate;
            else if (terceiraEntryType === 'oddVisitante') terceiraOdd = oddVisitante;

            if (terceiraOdd > 0) {
                if (terceiraEntryType === 'oddCasa') {
                    apostas.casa = retornoDesejado / terceiraOdd;
                } else if (terceiraEntryType === 'oddEmpate') {
                    apostas.empate = retornoDesejado / terceiraOdd;
                } else if (terceiraEntryType === 'oddVisitante') {
                    apostas.visitante = retornoDesejado / terceiraOdd;
                }
            }
        }

        // Calcula o total das apostas
        const totalTodasApostas = (apostas.casa || 0) + (apostas.empate || 0) + (apostas.visitante || 0);

        // CORREÇÃO: Calcule os resultados usando o total de todas as apostas
        const resultados = {
            casa: (oddCasa && apostas.casa) ? (apostas.casa * oddCasa - totalTodasApostas) : null,
            empate: (oddEmpate && apostas.empate) ? (apostas.empate * oddEmpate - totalTodasApostas) : null,
            visitante: (oddVisitante && apostas.visitante) ? (apostas.visitante * oddVisitante - totalTodasApostas) : null
        };

        // Não há mais necessidade de tratamento especial para a terceira entrada
        // pois agora estamos usando o total de todas as apostas para todos os cálculos

        this.mostrarResultados(apostas, totalTodasApostas, resultados, null);
    }

    mostrarResultados(apostas, totalApostado, resultados, terceiraEntryType) {
        const marketType = document.getElementById('tipoMercado').value;
        const labels = this.marketLabels[marketType];

        // Prepara o HTML para os valores de aposta
        let htmlApostas = '';
        
        if (apostas.casa > 0) {
            htmlApostas += `<li>• ${labels[0]}: R$ ${this.formatNumber(apostas.casa)}${this.firstEntryType === 'oddCasa' ? ' (já apostado)' : ''}</li>`;
        }
        
        if (apostas.empate > 0) {
            htmlApostas += `<li>• ${labels[1]}: R$ ${this.formatNumber(apostas.empate)}${this.firstEntryType === 'oddEmpate' ? ' (já apostado)' : ''}</li>`;
        }
        
        if (apostas.visitante > 0) {
            htmlApostas += `<li>• ${labels[2]}: R$ ${this.formatNumber(apostas.visitante)}${this.firstEntryType === 'oddVisitante' ? ' (já apostado)' : ''}</li>`;
        }

        // Prepara o HTML para os resultados
        let htmlResultados = '';
        
        if (resultados.casa !== null) {
            htmlResultados += `<li>• ${labels[0]}: <span class="${resultados.casa >= 0 ? 'lucro' : 'prejuizo'}">
                R$ ${this.formatNumber(resultados.casa)}</span></li>`;
        }
        
        if (resultados.empate !== null) {
            htmlResultados += `<li>• ${labels[1]}: <span class="${resultados.empate >= 0 ? 'lucro' : 'prejuizo'}">
                R$ ${this.formatNumber(resultados.empate)}</span></li>`;
        }
        
        if (resultados.visitante !== null) {
            htmlResultados += `<li>• ${labels[2]}: <span class="${resultados.visitante >= 0 ? 'lucro' : 'prejuizo'}">
                R$ ${this.formatNumber(resultados.visitante)}</span></li>`;
        }

        // Removemos a nota sobre a terceira entrada, já que agora todos os cálculos são iguais
        const html = `
            <div class="alert alert-success">
                <p class="fw-bold mb-2">Valores para apostar:</p>
                <ul class="list-unstyled mb-3">
                    ${htmlApostas}
                    <li class="mt-2 fw-bold">→ Total: R$ ${this.formatNumber(totalApostado)}</li>
                </ul>
                <p class="fw-bold mb-2">Resultados (lucro/prejuízo):</p>
                <ul class="list-unstyled mb-2">
                    ${htmlResultados}
                </ul>
            </div>`;

        document.getElementById('resultados').innerHTML = html;
    }

    resetCalculator() {
        document.getElementById('valorCasa').value = '';
        document.getElementById('oddCasa').value = '';
        document.getElementById('lucroDesejado').value = '10,00';
        document.getElementById('oddEmpate').value = '';
        document.getElementById('oddVisitante').value = '';
        document.getElementById('resultados').innerHTML = '';
        document.getElementById('tipoMercado').selectedIndex = 0;
        this.firstEntryType = null;
        this.secondEntryType = null;
        this.updateMarketLabels('resultado');
    }

    updateMarketLabels(marketType) {
        const labels = this.marketLabels[marketType];
        document.querySelector('.label-opcao1').textContent = labels[0];
        document.querySelector('.label-opcao2').textContent = labels[1];
        document.querySelector('.label-opcao3').textContent = labels[2];
        this.calcular();
    }

    formatNumber(number) {
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    parseLocalNumber(str) {
        if (!str) return 0;
        const value = parseFloat(str.replace(/\./g, '').replace(',', '.'));
        return Math.min(value, this.MAX_VALUE);
    }

    formatInputValue(input) {
        let value = input.value.replace(/\D/g, '');
        value = (parseFloat(value) / 100).toFixed(2);
        value = Math.min(parseFloat(value), this.MAX_VALUE);
        input.value = this.formatNumber(value);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Copiado com sucesso!');
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    }
}

// Inicialização
window.calculator = new Calculator();