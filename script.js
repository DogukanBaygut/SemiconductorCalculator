const semiconductorProperties = {
    Si: {
        name: 'Silisyum',
        Eg: 1.12,    // Band aralığı (eV)
        ni: 1.5e10,  // Intrinsik taşıyıcı yoğunluğu at 300K (cm^-3)
        defaultElectronMobility: 1400,
        defaultHoleMobility: 450,
        type: 'intrinsic'  // Varsayılan tip
    },
    Ge: {
        name: 'Germanyum',
        Eg: 0.67,
        ni: 2.4e13,
        defaultElectronMobility: 3900,
        defaultHoleMobility: 1900,
        type: 'intrinsic'
    },
    GaAs: {
        name: 'Galyum Arsenit',
        Eg: 1.42,
        ni: 2.1e6,
        defaultElectronMobility: 8500,
        defaultHoleMobility: 400,
        type: 'intrinsic'
    }
};

const constants = {
    k: 8.617e-5, // Boltzmann sabiti (eV/K)
    ni: 1.5e10,   // Intrinsic carrier concentration at 300K (cm^-3)
    Eg: 1.12      // Silicon band gap at 300K (eV)
};

let carrierChart = null;
let conductivityChart = null;
let electricFieldChart = null;
let chargeDensityChart = null;
let potentialChart = null;

// Chart.js için zoom plugin'ini ekle
const zoomOptions = {
    pan: {
        enabled: true,
        mode: 'xy'
    },
    zoom: {
        wheel: {
            enabled: true,
        },
        pinch: {
            enabled: true
        },
        mode: 'xy'
    }
};

// Sayfa yüklendiğinde grafikleri oluştur
window.onload = function() {
    initializeCharts();
    calculate();
};

function initializeCharts() {
    // Tema kontrolü
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // Ortak grafik seçenekleri
    const commonOptions = {
        responsive: true,
        plugins: {
            zoom: zoomOptions,
            title: {
                display: true,
                color: isDarkMode ? '#ffffff' : '#333333'
            },
            legend: {
                labels: {
                    color: isDarkMode ? '#ffffff' : '#333333'
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333'
                }
            },
            y: {
                grid: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color: isDarkMode ? '#ffffff' : '#333333'
                }
            }
        }
    };

    // Taşıyıcı yoğunluğu grafiği
    const carrierCtx = document.getElementById('carrierChart').getContext('2d');
    carrierChart = new Chart(carrierCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Elektron Yoğunluğu (n)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }, {
                label: 'Boşluk Yoğunluğu (p)',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    type: 'logarithmic'
                }
            }
        }
    });

    // İletkenlik grafiği
    const conductivityCtx = document.getElementById('conductivityChart').getContext('2d');
    conductivityChart = new Chart(conductivityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'İletkenlik',
                data: [],
                borderColor: 'rgb(153, 102, 255)',
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions
        }
    });

    // Band diyagramı canvas'ını hazırla
    const bandCanvas = document.getElementById('bandDiagram');
    // Canvas genişliğini container'a göre ayarla
    bandCanvas.width = bandCanvas.parentElement.offsetWidth - 20; // padding için 20px çıkar
    bandCanvas.height = 600;

    // Elektrik alan grafiği
    const electricFieldCtx = document.getElementById('electricFieldChart').getContext('2d');
    electricFieldChart = new Chart(electricFieldCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Elektrik Alan (V/cm)',
                data: [],
                borderColor: '#FF4081',
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Elektrik Alan (V/cm)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mesafe (μm)'
                    }
                }
            }
        }
    });

    // Yük yoğunluğu grafiği
    const chargeDensityCtx = document.getElementById('chargeDensityChart').getContext('2d');
    chargeDensityChart = new Chart(chargeDensityCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Yük Yoğunluğu (C/cm³)',
                data: [],
                borderColor: '#4CAF50',
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Yük Yoğunluğu (C/cm³)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mesafe (μm)'
                    }
                }
            }
        }
    });

    // Potansiyel grafiği
    const potentialCtx = document.getElementById('potentialChart').getContext('2d');
    potentialChart = new Chart(potentialCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Potansiyel (V)',
                data: [],
                borderColor: '#2196F3',
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Potansiyel (V)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mesafe (μm)'
                    }
                }
            }
        }
    });
}

function calculate() {
    const material = document.getElementById('semiconductor').value;
    const T = parseFloat(document.getElementById('temperature').value);
    const Nd = parseFloat(document.getElementById('donor').value);
    const Na = parseFloat(document.getElementById('acceptor').value);
    const electronMobility = parseFloat(document.getElementById('electronMobility').value);
    const holeMobility = parseFloat(document.getElementById('holeMobility').value);
    const biasVoltage = parseFloat(document.getElementById('biasVoltage').value);

    const materialProps = semiconductorProperties[material];
    
    // Fiziksel sabitler
    const q = 1.6e-19;
    const eps_0 = 8.85e-14;
    const eps_r = 11.7;
    const eps = eps_0 * eps_r;
    const kT = constants.k * 300;
    const ni = materialProps.ni;
    const Vbi = kT * Math.log((Nd * Na)/(ni * ni));
    
    // Depletion width hesaplamaları
    const Xn = Math.sqrt((2 * eps * Vbi * Na) / (q * Nd * (Na + Nd)));
    const Xp = Math.sqrt((2 * eps * Vbi * Nd) / (q * Na * (Na + Nd)));
    const W = Xn + Xp;
    const V_total = Vbi - biasVoltage;
    const deplWidth = W * Math.sqrt(Math.max(0, V_total/Vbi));

    // Taşıyıcı yoğunluğu ve iletkenlik hesaplamaları
    const temperatures = [];
    const electronDensities = [];
    const holeDensities = [];
    const conductivities = [];

    // 200K ile 400K arasında hesaplamalar
    for(let temp = 200; temp <= 400; temp += 10) {
        temperatures.push(temp);
        const kT_temp = constants.k * temp;
        
        // Taşıyıcı yoğunluklarını hesapla
        const ni_temp = ni * Math.sqrt(Math.pow(temp/300, 3)) * 
                       Math.exp(-materialProps.Eg/(2 * kT_temp));
        const n = Nd * (1 + Math.sqrt(1 + 4 * Math.pow(ni_temp/Nd, 2)))/2;
        const p = Math.pow(ni_temp, 2)/n;
        
        electronDensities.push(n);
        holeDensities.push(p);
        
        // İletkenliği hesapla
        const conductivity = q * (n * electronMobility + p * holeMobility);
        conductivities.push(conductivity);
    }

    // Carrier ve conductivity grafiklerini güncelle
    updateCharts(temperatures, electronDensities, holeDensities, conductivities);

    // PN junction dağılımları için hesaplamalar
    const distance = [];
    const electricField = [];
    const chargeDensity = [];
    const potential = [];
    
    // x değerlerini mikrometre cinsinden oluştur
    for(let x = -2; x <= 2; x += 0.1) {
        distance.push(x);
        
        // Elektrik alan hesabı (V/cm)
        const E = calculateElectricField(x * 1e-4, Nd, Na, deplWidth, biasVoltage);
        electricField.push(E);
        
        // Yük yoğunluğu hesabı (C/cm³)
        const rho = calculateChargeDensity(x * 1e-4, Nd, Na, deplWidth);
        chargeDensity.push(rho);
        
        // Potansiyel hesabı (V)
        const V = calculatePotential(x * 1e-4, Vbi, biasVoltage, deplWidth);
        potential.push(V);
    }

    // Dağılım grafiklerini güncelle
    updateDistributionCharts(distance, electricField, chargeDensity, potential);
    
    // Band diyagramını çiz
    drawBandDiagram(material, Nd, Na);

    // Sonuçları göster
    const results = document.getElementById('results');
    results.innerHTML = `
        <h3>Sonuçlar:</h3>
        <p>Built-in Potansiyel (Vbi): ${Vbi.toFixed(3)} V</p>
        <p>Depletion Genişliği (W): ${deplWidth.toExponential(3)} cm</p>
        <p>Maksimum Elektrik Alan: ${Math.max(...electricField.map(Math.abs)).toExponential(3)} V/cm</p>
        <p>Elektron Yoğunluğu (n): ${electronDensities[20].toExponential(3)} cm⁻³</p>
        <p>Boşluk Yoğunluğu (p): ${holeDensities[20].toExponential(3)} cm⁻³</p>
        <p>İletkenlik: ${conductivities[20].toExponential(3)} S/cm</p>
    `;
}

function updateCharts(temperatures, electronDensities, holeDensities, conductivities) {
    // Taşıyıcı yoğunluğu grafiğini güncelle
    carrierChart.data.labels = temperatures;
    carrierChart.data.datasets[0].data = electronDensities;
    carrierChart.data.datasets[1].data = holeDensities;
    carrierChart.update();

    // İletkenlik grafiğini güncelle
    conductivityChart.data.labels = temperatures;
    conductivityChart.data.datasets[0].data = conductivities;
    conductivityChart.update();
}

// Yeni fonksiyon: Verileri dışa aktarma
function exportData() {
    const material = document.getElementById('semiconductor').value;
    const data = {
        material: semiconductorProperties[material].name,
        temperature: document.getElementById('temperature').value,
        donor: document.getElementById('donor').value,
        acceptor: document.getElementById('acceptor').value,
        electronMobility: document.getElementById('electronMobility').value,
        holeMobility: document.getElementById('holeMobility').value,
        results: {
            electronDensity: carrierChart.data.datasets[0].data,
            holeDensity: carrierChart.data.datasets[1].data,
            conductivity: conductivityChart.data.datasets[0].data,
            temperatures: carrierChart.data.labels
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'semiconductor-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function drawBandDiagram(material, Nd, Na) {
    const canvas = document.getElementById('bandDiagram');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.parentElement.offsetWidth - 20;
    canvas.height = 500;
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const materialProps = semiconductorProperties[material];
    const Eg = materialProps.Eg;
    
    // Fiziksel sabitler ve hesaplamalar
    const q = 1.6e-19;
    const eps_0 = 8.85e-14;
    const eps_r = 11.7;
    const eps = eps_0 * eps_r;
    const kT = constants.k * 300;
    const ni = materialProps.ni;
    const Vbi = kT * Math.log((Nd * Na)/(ni * ni));
    
    // Bias voltajı
    const biasVoltage = parseFloat(document.getElementById('biasVoltage').value);
    const V_total = Vbi - biasVoltage;
    
    // Depletion width hesaplamaları
    const Xn = Math.sqrt((2 * eps * Vbi * Na) / (q * Nd * (Na + Nd)));
    const Xp = Math.sqrt((2 * eps * Vbi * Nd) / (q * Na * (Na + Nd)));
    const W = Xn + Xp;
    const W_bias = W * Math.sqrt(Math.max(0, V_total/Vbi));
    
    // Çizim parametreleri
    const margin = 50;
    const graphWidth = width - 2 * margin;
    const graphHeight = height - 2 * margin;
    const scale = graphHeight / (Eg * 2.5);
    const centerY = height/2;
    const junctionX = width/2;
    
    // Depletion bölgesi gösterimi
    const deplWidth = graphWidth * 0.4;
    
    // n-bölgesi arka planı
    ctx.fillStyle = 'rgba(200, 200, 255, 0.15)';
    ctx.fillRect(margin, margin, junctionX - margin, graphHeight);
    
    // p-bölgesi arka planı
    ctx.fillStyle = 'rgba(255, 200, 200, 0.15)';
    ctx.fillRect(junctionX, margin, width - margin - junctionX, graphHeight);
    
    // Depletion bölgesi arka planı
    ctx.fillStyle = 'rgba(230, 230, 230, 0.3)';
    ctx.fillRect(junctionX - deplWidth/2, margin, deplWidth, graphHeight);
    
    // Band eğilmesi
    const bandBending = V_total * scale;
    
    // İletim bandı
    ctx.beginPath();
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 3;
    ctx.moveTo(margin, centerY - bandBending);
    ctx.lineTo(junctionX - deplWidth/2, centerY - bandBending);
    ctx.bezierCurveTo(
        junctionX - deplWidth/4, centerY - bandBending,
        junctionX + deplWidth/4, centerY,
        junctionX + deplWidth/2, centerY
    );
    ctx.lineTo(width - margin, centerY);
    ctx.stroke();
    
    // Valans bandı
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.moveTo(margin, centerY - bandBending + Eg * scale);
    ctx.lineTo(junctionX - deplWidth/2, centerY - bandBending + Eg * scale);
    ctx.bezierCurveTo(
        junctionX - deplWidth/4, centerY - bandBending + Eg * scale,
        junctionX + deplWidth/4, centerY + Eg * scale,
        junctionX + deplWidth/2, centerY + Eg * scale
    );
    ctx.lineTo(width - margin, centerY + Eg * scale);
    ctx.stroke();
    
    // Fermi/Quasi-Fermi seviyeleri
    ctx.beginPath();
    ctx.strokeStyle = '#FF9800';
    ctx.setLineDash([5, 5]);

    if (biasVoltage !== 0) {
        // İletim ve valans bandı seviyeleri
        const Ec_n = centerY - bandBending;  // n-tarafı iletim bandı
        const Ev_n = centerY - bandBending + Eg * scale;  // n-tarafı valans bandı
        const Ec_p = centerY;  // p-tarafı iletim bandı
        const Ev_p = centerY + Eg * scale;  // p-tarafı valans bandı
        
        // Güvenli marjin
        const margin_band = scale * 0.1;
        
        // n-tarafı quasi-Fermi seviyesi (iletim bandına yakın)
        const Efn = Math.min(Ev_n - margin_band, 
                            Math.max(Ec_n + margin_band, 
                            Ec_n + scale * 0.2)); // İletim bandının biraz altında
        
        // p-tarafı quasi-Fermi seviyesi (valans bandına yakın)
        const Efp = Math.min(Ev_p - margin_band,
                            Math.max(Ec_p + Eg * scale * 0.8, // Valans bandına daha yakın
                            Ev_p - scale * 0.2)); // Valans bandının biraz üstünde
        
        // Forward bias'ta quasi-Fermi seviyeleri birbirine yaklaşır
        if (biasVoltage > 0) {
            ctx.moveTo(margin, Efn);
            ctx.lineTo(junctionX - deplWidth/2, Efn);
            
            // Yumuşak geçiş
            ctx.bezierCurveTo(
                junctionX - deplWidth/4, Efn,
                junctionX + deplWidth/4, Efp,
                junctionX + deplWidth/2, Efp
            );
            
            ctx.lineTo(width - margin, Efp);
        } else {
            // Reverse bias'ta quasi-Fermi seviyeleri birbirinden uzaklaşır
            ctx.moveTo(margin, Efn);
            ctx.lineTo(junctionX - deplWidth/2, Efn);
            
            // Yumuşak geçiş
            ctx.bezierCurveTo(
                junctionX - deplWidth/4, Efn,
                junctionX + deplWidth/4, Efp,
                junctionX + deplWidth/2, Efp
            );
            
            ctx.lineTo(width - margin, Efp);
        }
        
        // Enerji seviyesi etiketleri
        drawTextWithBackground('Efn', margin + 25, Efn - 5);
        drawTextWithBackground('Efp', width - margin - 25, Efp - 5);
    } else {
        // Normal Fermi seviyesi (bias yokken)
        const Ec_n = centerY - bandBending;  // n-tarafı iletim bandı
        const Ev_n = centerY - bandBending + Eg * scale;  // n-tarafı valans bandı
        const Ec_p = centerY;  // p-tarafı iletim bandı
        const Ev_p = centerY + Eg * scale;  // p-tarafı valans bandı
        
        // Güvenli marjin
        const margin_band = scale * 0.1;
        
        // n-tarafı Fermi seviyesi (iletim bandına yakın)
        const Efn = Math.min(Ev_n - margin_band, 
                            Math.max(Ec_n + margin_band, 
                            Ec_n + scale * 0.2)); // İletim bandının biraz altında
        
        // p-tarafı Fermi seviyesi (valans bandına yakın)
        const Efp = Math.min(Ev_p - margin_band,
                            Math.max(Ec_p + Eg * scale * 0.8,
                            Ev_p - scale * 0.2)); // Valans bandının biraz üstünde

        // n-tarafı Fermi seviyesi
        ctx.moveTo(margin, Efn);
        ctx.lineTo(junctionX - deplWidth/2, Efn);
        
        // Yumuşak geçiş
        ctx.bezierCurveTo(
            junctionX - deplWidth/4, Efn,
            junctionX + deplWidth/4, Efp,
            junctionX + deplWidth/2, Efp
        );
        
        // p-tarafı Fermi seviyesi
        ctx.lineTo(width - margin, Efp);
        
        // Enerji seviyesi etiketleri
        drawTextWithBackground('Ef (n)', margin + 35, Efn - 5);
        drawTextWithBackground('Ef (p)', width - margin - 35, Efp - 5);
    }

    ctx.stroke();
    ctx.setLineDash([]);
    
    // Depletion bölgesi sınırları
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.7)';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(junctionX - deplWidth/2, margin);
    ctx.lineTo(junctionX - deplWidth/2, height - margin);
    ctx.moveTo(junctionX + deplWidth/2, margin);
    ctx.lineTo(junctionX + deplWidth/2, height - margin);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Metin için yardımcı fonksiyon
    function drawTextWithBackground(text, x, y, bgColor = 'rgba(255, 255, 255, 0.9)') {
        ctx.save();
        ctx.textAlign = 'center';
        
        // Metin boyutlarını ölç
        const metrics = ctx.measureText(text);
        const padding = 5;
        const textHeight = 16;
        
        // Yarı saydam arka plan
        ctx.fillStyle = bgColor;
        ctx.fillRect(
            x - metrics.width/2 - padding,
            y - textHeight + padding,
            metrics.width + padding * 2,
            textHeight + padding
        );
        
        // Metin gölgesi
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Metni çiz - rengi siyah yaptık
        ctx.fillStyle = '#000000'; // Siyah renk
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    // Değerleri göster
    ctx.font = 'bold 14px Arial';
    
    // Üst kısımdaki değerler
    drawTextWithBackground(`Eg = ${Eg.toFixed(2)} eV`, junctionX, margin + 20);
    drawTextWithBackground(`Vbi = ${Vbi.toFixed(3)} V`, junctionX - deplWidth/4, margin + 20);
    drawTextWithBackground(`Vbias = ${biasVoltage.toFixed(2)} V`, junctionX + deplWidth/4, margin + 20);
    
    // Depletion bölgesi içindeki değerler
    drawTextWithBackground(`W = ${W_bias.toExponential(2)} cm`, junctionX, centerY - 30);
    drawTextWithBackground(`Xn = ${Xn.toExponential(2)} cm`, junctionX - deplWidth/4, centerY);
    drawTextWithBackground(`Xp = ${Xp.toExponential(2)} cm`, junctionX + deplWidth/4, centerY);
    
    // Enerji seviyeleri
    drawTextWithBackground('Ec', margin + 25, centerY - bandBending - 5);
    drawTextWithBackground('Ef', margin + 25, fermiY - 5);
    drawTextWithBackground('Ev', margin + 25, centerY - bandBending + Eg * scale - 5);
    
    // Bölge etiketleri
    ctx.font = 'bold 16px Arial';
    drawTextWithBackground('n-type', margin + 60, height - margin - 10);
    drawTextWithBackground('p-type', width - margin - 60, height - margin - 10);
    
    // Malzeme bilgisi ve tipi
    const type = Nd > Na ? 'n-type' : (Na > Nd ? 'p-type' : 'intrinsic');
    drawTextWithBackground(`${materialProps.name} (${type})`, 
        width - margin - 60, margin + 20);
    
    // Katkılama seviyeleri
    drawTextWithBackground(`Nd = ${Nd.toExponential(2)} cm⁻³`, margin + 80, margin + 40);
    drawTextWithBackground(`Na = ${Na.toExponential(2)} cm⁻³`, width - margin - 80, margin + 40);

    // Bölge etiketleri ve çizgileri
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;

    // n-bölgesi için çizgi ve etiket
    ctx.moveTo(margin, height - margin + 15);
    ctx.lineTo(junctionX - deplWidth/2, height - margin + 15);
    drawTextWithBackground('n-region', (margin + junctionX - deplWidth/2)/2, height - margin + 30);

    // Depletion bölgesi için çizgi ve etiket
    ctx.moveTo(junctionX - deplWidth/2, height - margin + 15);
    ctx.lineTo(junctionX + deplWidth/2, height - margin + 15);
    drawTextWithBackground('depletion region', junctionX, height - margin + 30);

    // p-bölgesi için çizgi ve etiket
    ctx.moveTo(junctionX + deplWidth/2, height - margin + 15);
    ctx.lineTo(width - margin, height - margin + 15);
    drawTextWithBackground('p-region', (junctionX + deplWidth/2 + width - margin)/2, height - margin + 30);

    ctx.stroke();

    // Bölge sınırlarını gösteren dikey çizgiler
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    ctx.moveTo(junctionX - deplWidth/2, height - margin);
    ctx.lineTo(junctionX - deplWidth/2, height - margin + 15);
    ctx.moveTo(junctionX + deplWidth/2, height - margin);
    ctx.lineTo(junctionX + deplWidth/2, height - margin + 15);
    ctx.stroke();
    ctx.setLineDash([]);

    // N ve P bölge etiketleri
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = 'rgba(0, 0, 255, 0.8)'; // Koyu mavi
    drawTextWithBackground('N', margin + 50, height - margin/2, 'rgba(200, 200, 255, 0.9)');
    ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'; // Koyu kırmızı
    drawTextWithBackground('P', width - margin - 50, height - margin/2, 'rgba(255, 200, 200, 0.9)');

    // Bölgeleri ayıran çizgi
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.setLineDash([5, 5]);
    ctx.moveTo(junctionX, height - margin);
    ctx.lineTo(junctionX, height - margin/4);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Bias değişimini dinle
document.getElementById('biasVoltage').addEventListener('input', function(e) {
    const value = parseFloat(e.target.value);
    document.getElementById('biasValue').textContent = value;
    
    // Dil tercihini al
    const currentLang = localStorage.getItem('preferredLanguage') || 'tr';
    
    // Bias tipini belirle ve çevir
    let biasTypeKey = 'biasType';
    if (value > 0) {
        biasTypeKey = 'forwardBias';
    } else if (value < 0) {
        biasTypeKey = 'reverseBias';
    }
    
    document.getElementById('biasType').textContent = translations[currentLang][biasTypeKey];
    calculate();
}); 

// Yeni fonksiyonlar
function calculateElectricField(x, Nd, Na, deplWidth, biasVoltage) {
    const q = 1.6e-19;
    const eps = 1.05e-12;
    
    if (Math.abs(x) <= deplWidth/2) {
        const E_max = (q * Nd * deplWidth) / (2 * eps);
        return E_max * (2 * x / deplWidth); // V/cm cinsinden
    }
    return 0;
}

function calculateChargeDensity(x, Nd, Na, deplWidth) {
    const q = 1.6e-19;
    
    if (x < -deplWidth/2) {
        return 0; // Nötr bölge
    } else if (x > deplWidth/2) {
        return 0; // Nötr bölge
    } else if (x < 0) {
        return q * Nd; // n bölgesi (C/cm³)
    } else {
        return -q * Na; // p bölgesi (C/cm³)
    }
}

function calculatePotential(x, Vbi, biasVoltage, deplWidth) {
    const V_total = Vbi - biasVoltage;
    
    if (x < -deplWidth/2) {
        return 0;
    } else if (x > deplWidth/2) {
        return -V_total;
    } else {
        // Parabolik değişim
        const normalized_x = (x + deplWidth/2) / deplWidth;
        return -V_total * (1 - Math.pow(normalized_x, 2));
    }
}

function updateDistributionCharts(distance, electricField, chargeDensity, potential) {
    // Elektrik alan grafiğini güncelle
    electricFieldChart.data.labels = distance;
    electricFieldChart.data.datasets[0].data = electricField;
    electricFieldChart.update();

    // Yük yoğunluğu grafiğini güncelle
    chargeDensityChart.data.labels = distance;
    chargeDensityChart.data.datasets[0].data = chargeDensity;
    chargeDensityChart.update();

    // Potansiyel grafiğini güncelle
    potentialChart.data.labels = distance;
    potentialChart.data.datasets[0].data = potential;
    potentialChart.update();
} 

// Dil değiştirme fonksiyonu
function changeLanguage(lang) {
    // Tüm çevrilebilir elementleri bul
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Grafik başlıklarını güncelle
    updateChartTitles(lang);
    
    // Dil tercihini kaydet
    localStorage.setItem('preferredLanguage', lang);
}

// Grafik başlıklarını güncelleme fonksiyonu
function updateChartTitles(lang) {
    if (carrierChart) {
        carrierChart.data.datasets[0].label = lang === 'tr' ? 'Elektron Yoğunluğu (n)' : 'Electron Density (n)';
        carrierChart.data.datasets[1].label = lang === 'tr' ? 'Boşluk Yoğunluğu (p)' : 'Hole Density (p)';
        carrierChart.update();
    }

    if (conductivityChart) {
        conductivityChart.data.datasets[0].label = lang === 'tr' ? 'İletkenlik' : 'Conductivity';
        conductivityChart.update();
    }

    if (electricFieldChart) {
        electricFieldChart.data.datasets[0].label = lang === 'tr' ? 'Elektrik Alan (V/cm)' : 'Electric Field (V/cm)';
        electricFieldChart.update();
    }

    // Diğer grafiklerin başlıklarını da güncelle
}

// Tema değiştirme fonksiyonu
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Tema ikonunu güncelle
    updateThemeIcon(newTheme);
    
    // Grafikleri güncelle
    updateChartsTheme(newTheme === 'dark');
}

// Tema ikonunu güncelleme
function updateThemeIcon(theme) {
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
                <path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.65 0-3 1.35-3 3s1.35 3 3 3 3-1.35 3-3-1.35-3-3-3zm0-2V4c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1zm0 14v-3c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1z"/>
            </svg>
            <span data-translate="theme">Tema</span>
        `;
    }
}

// Tema değiştiğinde grafikleri güncelle
function updateChartsTheme(isDarkMode) {
    const charts = [carrierChart, conductivityChart, electricFieldChart, chargeDensityChart, potentialChart];
    
    const themeColors = {
        grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        text: isDarkMode ? '#ffffff' : '#333333'
    };

    charts.forEach(chart => {
        if (chart) {
            // Başlık rengini güncelle
            if (chart.options.plugins.title) {
                chart.options.plugins.title.color = themeColors.text;
            }
            
            // Legend rengini güncelle
            if (chart.options.plugins.legend) {
                chart.options.plugins.legend.labels.color = themeColors.text;
            }
            
            // Eksen renklerini güncelle
            Object.values(chart.options.scales).forEach(scale => {
                scale.grid.color = themeColors.grid;
                scale.ticks.color = themeColors.text;
            });
            
            chart.update();
        }
    });
}

// Sayfa yüklendiğinde tema kontrolü
window.onload = function() {
    // Tema tercihini kontrol et
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Grafikleri oluştur
    initializeCharts();
    
    // Grafik temalarını güncelle
    updateChartsTheme(savedTheme === 'dark');
    
    // Dil tercihini kontrol et
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'tr';
    document.getElementById('languageSelect').value = preferredLanguage;
    changeLanguage(preferredLanguage);
}; 