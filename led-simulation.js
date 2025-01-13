class LEDSimulation {
    constructor() {
        this.voltage = 0;
        this.current = 20; // mA
        this.ledSpecs = {
            red: { forwardVoltage: 1.8, wavelength: 625 },
            green: { forwardVoltage: 2.0, wavelength: 525 },
            blue: { forwardVoltage: 3.0, wavelength: 470 },
            white: { forwardVoltage: 3.2, wavelength: 550 }
        };
        this.selectedLED = 'red';
        this.initCharts();
        this.setupEventListeners();
        this.initializeThemeAndLanguage();
    }

    // Tema ve dil başlatma
    initializeThemeAndLanguage() {
        // Tema kontrolü
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);

        // Dil kontrolü
        const preferredLanguage = localStorage.getItem('preferredLanguage') || 'tr';
        document.getElementById('languageSelect').value = preferredLanguage;
        this.changeLanguage(preferredLanguage);
    }

    // Tema değiştirme
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.updateThemeIcon(newTheme);
        this.updateChartsTheme(newTheme === 'dark');
    }

    // Tema ikonunu güncelleme
    updateThemeIcon(theme) {
        const themeToggle = document.querySelector('.theme-toggle');
        if (theme === 'dark') {
            themeToggle.innerHTML = `
                <svg class="moon-icon" viewBox="0 0 24 24">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z"/>
                </svg>
                <span data-translate="theme">Tema</span>
            `;
        } else {
            themeToggle.innerHTML = `
                <svg class="sun-icon" viewBox="0 0 24 24">
                    <path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3z"/>
                </svg>
                <span data-translate="theme">Tema</span>
            `;
        }
    }

    // Grafiklerin temasını güncelleme
    updateChartsTheme(isDark) {
        const textColor = isDark ? '#ffffff' : '#333333';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

        [this.ivChart, this.powerChart].forEach(chart => {
            if (chart) {
                // Başlık rengini güncelle
                if (chart.options.plugins.title) {
                    chart.options.plugins.title.color = textColor;
                }
                
                // Legend rengini güncelle
                if (chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                
                // Eksen renklerini güncelle
                Object.values(chart.options.scales).forEach(scale => {
                    scale.grid.color = gridColor;
                    scale.ticks.color = textColor;
                });
                
                chart.update();
            }
        });
    }

    // Dil değiştirme
    changeLanguage(lang) {
        // Tüm çevrilebilir elementleri güncelle
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            if (translations[lang] && translations[lang][key]) {
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translations[lang][key];
                } else {
                    element.textContent = translations[lang][key];
                }
            }
        });

        // Grafik başlıklarını güncelle
        this.updateChartTitles(lang);
        
        // Dil tercihini kaydet
        localStorage.setItem('preferredLanguage', lang);
    }

    // Grafik başlıklarını güncelleme
    updateChartTitles(lang) {
        if (this.ivChart) {
            this.ivChart.data.datasets[0].label = lang === 'tr' ? 'I-V Karakteristiği' : 'I-V Characteristic';
            this.ivChart.options.scales.x.title.text = lang === 'tr' ? 'Voltaj (V)' : 'Voltage (V)';
            this.ivChart.options.scales.y.title.text = lang === 'tr' ? 'Akım (mA)' : 'Current (mA)';
            this.ivChart.update();
        }

        if (this.powerChart) {
            this.powerChart.data.datasets[0].label = lang === 'tr' ? 'Güç Tüketimi' : 'Power Consumption';
            this.powerChart.options.scales.x.title.text = lang === 'tr' ? 'Voltaj (V)' : 'Voltage (V)';
            this.powerChart.options.scales.y.title.text = lang === 'tr' ? 'Güç (mW)' : 'Power (mW)';
            this.powerChart.update();
        }
    }

    initCharts() {
        // I-V karakteristik eğrisi
        const ivCtx = document.getElementById('ivChart').getContext('2d');
        this.ivChart = new Chart(ivCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'I-V Karakteristiği',
                    data: [],
                    borderColor: '#4CAF50',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Voltaj (V)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Akım (mA)'
                        }
                    }
                }
            }
        });

        // Güç grafiği
        const powerCtx = document.getElementById('powerChart').getContext('2d');
        this.powerChart = new Chart(powerCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Güç Tüketimi',
                    data: [],
                    borderColor: '#2196F3',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Voltaj (V)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Güç (mW)'
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        document.getElementById('voltage').addEventListener('input', (e) => {
            this.voltage = parseFloat(e.target.value);
            document.getElementById('voltageValue').textContent = this.voltage + ' V';
            this.updateSimulation();
        });

        document.getElementById('current').addEventListener('input', (e) => {
            this.current = parseFloat(e.target.value);
            this.updateSimulation();
        });

        document.getElementById('ledColor').addEventListener('change', (e) => {
            this.selectedLED = e.target.value;
            this.updateSimulation();
        });
    }

    calculateLEDParameters() {
        const Vf = this.ledSpecs[this.selectedLED].forwardVoltage;
        let current = 0;

        if (this.voltage > Vf) {
            // Basit LED modeli
            current = Math.min(
                this.current,
                (this.voltage - Vf) * 20 // 20 mA/V yaklaşık iletkenlik
            );
        }

        const power = this.voltage * current;
        const efficiency = this.calculateEfficiency(current);

        return {
            current: current,
            power: power,
            efficiency: efficiency
        };
    }

    calculateEfficiency(current) {
        // Basit verimlilik modeli
        const opticalPower = current * 0.3; // %30 optik verimlilik varsayımı
        return (opticalPower / (this.voltage * current)) * 100;
    }

    updateSimulation() {
        const params = this.calculateLEDParameters();
        
        // Sonuçları güncelle
        document.getElementById('forwardVoltage').textContent = 
            this.ledSpecs[this.selectedLED].forwardVoltage.toFixed(1);
        document.getElementById('ledCurrent').textContent = 
            params.current.toFixed(2);
        document.getElementById('powerConsumption').textContent = 
            params.power.toFixed(2);
        document.getElementById('efficiency').textContent = 
            params.efficiency.toFixed(1);

        // LED parlaklığını güncelle
        const ledLight = document.querySelector('.led-light');
        ledLight.style.opacity = params.current / this.current;
        ledLight.style.backgroundColor = this.selectedLED;

        this.updateCharts();
    }

    updateCharts() {
        // I-V eğrisi için veri oluştur
        const voltagePoints = Array.from({length: 50}, (_, i) => i * 0.1);
        const currentPoints = voltagePoints.map(v => {
            if (v < this.ledSpecs[this.selectedLED].forwardVoltage) return 0;
            return Math.min(this.current, (v - this.ledSpecs[this.selectedLED].forwardVoltage) * 20);
        });

        // Güç grafiği için veri
        const powerPoints = voltagePoints.map((v, i) => v * currentPoints[i]);

        // Grafikleri güncelle
        this.ivChart.data.labels = voltagePoints;
        this.ivChart.data.datasets[0].data = currentPoints;
        this.ivChart.update();

        this.powerChart.data.labels = voltagePoints;
        this.powerChart.data.datasets[0].data = powerPoints;
        this.powerChart.update();
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
    simulation = new LEDSimulation();
}); 