class CircuitSimulation {
    constructor() {
        this.initializeCharts();
        this.setupEventListeners();
        this.initializeThemeAndLanguage();
        this.updateComponentInputs();
    }

    initializeThemeAndLanguage() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const preferredLanguage = localStorage.getItem('preferredLanguage') || 'tr';
        document.getElementById('languageSelect').value = preferredLanguage;
        this.changeLanguage(preferredLanguage);
    }

    setupEventListeners() {
        document.getElementById('calculateCircuit').addEventListener('click', () => this.calculate());
        document.getElementById('circuitType').addEventListener('change', () => {
            const circuitType = document.getElementById('circuitType').value;
            this.updateComponentInputs();
            this.calculate();
        });
        
        // Input değerlerindeki değişiklikleri dinle
        ['inputVoltage', 'frequency', 'load'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                if (document.getElementById('autoCalculate').checked) {
                    this.calculate();
                }
            });
        });
    }

    updateComponentInputs() {
        const circuitType = document.getElementById('circuitType').value;
        const componentInputs = document.getElementById('componentInputs');
        componentInputs.innerHTML = ''; // Mevcut inputları temizle

        switch(circuitType) {
            case 'diode':
                this.addComponentInput('forwardVoltage', 'forwardVoltageInput', 0.7);
                break;
            case 'bridge':
                this.addComponentInput('diodeDropVoltage', 'diodeDropVoltageInput', 0.7);
                this.addComponentInput('capacitance', 'capacitanceInput', 1000);
                break;
            case 'regulator':
                this.addComponentInput('outputVoltage', 'outputVoltageInput', 5);
                this.addComponentInput('dropoutVoltage', 'dropoutVoltageInput', 2);
                break;
            // Diğer devre tipleri için benzer inputlar eklenebilir
        }
    }

    addComponentInput(id, translationKey, defaultValue) {
        const div = document.createElement('div');
        div.className = 'input-group';
        div.innerHTML = `
            <label for="${id}" data-translate="${translationKey}">
                ${translations[localStorage.getItem('preferredLanguage') || 'tr'][translationKey]}
            </label>
            <input type="number" id="${id}" value="${defaultValue}" step="0.1">
        `;
        document.getElementById('componentInputs').appendChild(div);
    }

    calculate() {
        const circuitType = document.getElementById('circuitType').value;
        const inputVoltage = parseFloat(document.getElementById('inputVoltage').value);
        const frequency = parseFloat(document.getElementById('frequency').value);
        const load = parseFloat(document.getElementById('load').value);

        let results;
        switch(circuitType) {
            case 'diode':
                results = this.calculateDiodeCircuit(inputVoltage, load);
                break;
            case 'bridge':
                results = this.calculateBridgeRectifier(inputVoltage, frequency, load);
                break;
            case 'regulator':
                results = this.calculateVoltageRegulator(inputVoltage, load);
                break;
            // Diğer devre tipleri için hesaplamalar eklenebilir
        }

        this.updateResults(results);
        this.updateWaveform(circuitType, inputVoltage, frequency);
    }

    updateResults(results) {
        if (results) {
            Object.keys(results).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    element.textContent = results[key].toFixed(2);
                }
            });
        }
    }

    initializeCharts() {
        const ctx = document.getElementById('waveformChart').getContext('2d');
        this.waveformChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Giriş',
                    data: [],
                    borderColor: '#4CAF50',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Çıkış',
                    data: [],
                    borderColor: '#2196F3',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    tooltip: {
                        position: 'nearest',
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}V`;
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 14
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Zaman (ms)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 10
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Gerilim (V)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            padding: 10
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Devre tiplerine göre hesaplama metodları...
    calculateDiodeCircuit(inputVoltage, load) {
        const forwardVoltage = parseFloat(document.getElementById('forwardVoltage').value);
        const outputVoltage = inputVoltage - forwardVoltage;
        const current = outputVoltage / load;
        const power = outputVoltage * current;
        const efficiency = (outputVoltage * current) / (inputVoltage * current) * 100;

        return {
            rippleVoltage: 0,
            efficiency: efficiency,
            powerDissipation: forwardVoltage * current,
            regulation: ((inputVoltage - outputVoltage) / inputVoltage) * 100,
            gain: outputVoltage / inputVoltage
        };
    }

    calculateBridgeRectifier(inputVoltage, frequency, load) {
        const diodeDropVoltage = parseFloat(document.getElementById('diodeDropVoltage').value);
        const capacitance = parseFloat(document.getElementById('capacitance').value) * 1e-6; // µF to F

        const peakVoltage = inputVoltage * Math.SQRT2 - 2 * diodeDropVoltage;
        const current = peakVoltage / load;
        const rippleVoltage = peakVoltage / (2 * frequency * capacitance * load);
        const efficiency = (peakVoltage * current) / (inputVoltage * current) * 100;

        return {
            rippleVoltage: rippleVoltage,
            efficiency: efficiency,
            powerDissipation: 2 * diodeDropVoltage * current,
            regulation: (rippleVoltage / peakVoltage) * 100,
            gain: peakVoltage / inputVoltage
        };
    }

    calculateVoltageRegulator(inputVoltage, load) {
        const outputVoltage = parseFloat(document.getElementById('outputVoltage').value);
        const dropoutVoltage = parseFloat(document.getElementById('dropoutVoltage').value);

        const current = outputVoltage / load;
        const efficiency = (outputVoltage * current) / (inputVoltage * current) * 100;
        const powerDissipation = (inputVoltage - outputVoltage) * current;

        return {
            rippleVoltage: 0.1, // Tipik değer
            efficiency: efficiency,
            powerDissipation: powerDissipation,
            regulation: ((inputVoltage - outputVoltage) / inputVoltage) * 100,
            gain: outputVoltage / inputVoltage
        };
    }

    updateWaveform(circuitType, inputVoltage, frequency) {
        const points = 200;
        const period = 1000 / frequency;
        const labels = Array.from({length: points}, (_, i) => (i * period / points).toFixed(2));
        
        const inputData = Array.from({length: points}, (_, i) => 
            inputVoltage * Math.sin(2 * Math.PI * i / points));
        
        let outputData;
        switch(circuitType) {
            case 'diode':
                outputData = inputData.map(v => v > 0 ? v - 0.7 : 0);
                break;
            case 'bridge':
                const peakVoltage = inputVoltage * Math.SQRT2;
                const diodeDropVoltage = parseFloat(document.getElementById('diodeDropVoltage').value);
                outputData = inputData.map(v => Math.abs(v) - 2 * diodeDropVoltage);
                break;
            case 'regulator':
                const outputVoltage = parseFloat(document.getElementById('outputVoltage').value);
                outputData = Array(points).fill(outputVoltage);
                break;
            default:
                outputData = inputData;
        }

        this.waveformChart.data.labels = labels;
        this.waveformChart.data.datasets[0].data = inputData;
        this.waveformChart.data.datasets[1].data = outputData;
        this.waveformChart.update();
    }

    changeLanguage(lang) {
        // Tüm çevrilebilir elementleri güncelle
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translations[lang][key];
                } else if (element.tagName === 'OPTION') {
                    element.textContent = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });

        // Komponent değerlerini güncelle
        this.updateComponentInputs();

        // Grafik başlıklarını güncelle
        if (this.waveformChart) {
            this.waveformChart.data.datasets[0].label = lang === 'tr' ? 'Giriş Sinyali' : 'Input Signal';
            this.waveformChart.data.datasets[1].label = lang === 'tr' ? 'Çıkış Sinyali' : 'Output Signal';
            this.waveformChart.options.scales.x.title.text = lang === 'tr' ? 'Zaman (ms)' : 'Time (ms)';
            this.waveformChart.options.scales.y.title.text = lang === 'tr' ? 'Gerilim (V)' : 'Voltage (V)';
            this.waveformChart.update();
        }

        // Dil tercihini kaydet
        localStorage.setItem('preferredLanguage', lang);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Grafiklerin temasını güncelle
        const isDark = newTheme === 'dark';
        const textColor = isDark ? '#ffffff' : '#333333';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        if (this.waveformChart) {
            this.waveformChart.options.scales.x.grid.color = gridColor;
            this.waveformChart.options.scales.y.grid.color = gridColor;
            this.waveformChart.options.scales.x.ticks.color = textColor;
            this.waveformChart.options.scales.y.ticks.color = textColor;
            this.waveformChart.options.scales.x.title.color = textColor;
            this.waveformChart.options.scales.y.title.color = textColor;
            this.waveformChart.update();
        }
    }
}

// Global fonksiyonlar
window.toggleTheme = function() {
    simulation.toggleTheme();
};

window.changeLanguage = function(lang) {
    simulation.changeLanguage(lang);
};

// Simülasyonu başlat
let simulation;
window.addEventListener('DOMContentLoaded', () => {
    simulation = new CircuitSimulation();
}); 