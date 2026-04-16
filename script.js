let currentMode = 'current';
let myChart;

const baseElec = 158500;
const baseAgua = 950;
const baseOficinaEur = 2273.5;
const baseLimpiezaEur = 1262.4;

function updateView(mode) {
    currentMode = mode;
    document.querySelectorAll('.selector-temporal button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    render();
    updateChart();
}

function getMultiplier() {
    if (currentMode === 'past') return 1.05;
    if (currentMode === 'future') return 0.90;
    if (currentMode === 'goal') return 0.70;
    return 1.0;
}

// Función para calcular el IPC acumulado según el modo
function getIPC() {
    if (currentMode === 'past') return -3.1; // Se descuenta el IPC del año anterior
    if (currentMode === 'current') return 0;  // Precio base actual
    if (currentMode === 'future') return 2.5; // Inflación estimada 1 año
    if (currentMode === 'goal') return 7.7;   // Inflación acumulada estimada 3 años (compuesta)
    return 0;
}

function applyIPC(value) {
    const ipc = getIPC();
    return value * (1 + (ipc / 100));
}

function render() {
    const m = getMultiplier();
    const ipcPercent = getIPC();
    const grid = document.getElementById('main-grid');

    grid.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-bolt"></i> Energía Eléctrica</h3>
            <table>
                <thead><tr><th>Indicador</th><th>Gasto Anual</th><th>Lectivo (Sep-Jun)</th></tr></thead>
                <tr><td>Electricidad IT <span class="label-sub">Servidores + Aulas</span></td><td class="val-total">${(baseElec * m).toLocaleString()} kWh</td><td class="val-total">${(baseElec * m * 0.88).toLocaleString()} kWh</td></tr>
            </table>
        </div>

        <div class="card">
            <h3><i class="fas fa-tint"></i> Agua</h3>
            <table>
                <thead><tr><th>Indicador</th><th>Gasto Anual</th><th>Lectivo (Sep-Jun)</th></tr></thead>
                <tr><td>Agua <span class="label-sub">1.000 usuarios + Limpieza</span></td><td class="val-total">${(baseAgua * m).toFixed(1)} m³</td><td class="val-total">${(baseAgua * m * 0.9).toFixed(1)} m³</td></tr>
            </table>
        </div>

        <div class="card">
            <h3><i class="fas fa-copy"></i> Material de oficina</h3>
            <table>
                <thead><tr><th>Elemento</th><th>Cantidad (12m)</th><th>IPC %</th><th>Gasto (€)</th></tr></thead>
                <tr><td>Papel A4 Blanco</td><td>${Math.round(495 * m)} paq</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(2079 * m).toFixed(2)} €</td></tr>
                <tr><td>Recambios Pizarra</td><td>${Math.round(120 * m)} ud</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(132 * m).toFixed(2)} €</td></tr>
                <tr><td>Carpetas/Subcarpetas</td><td>${Math.round(250 * m)} ud</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(62.5 * m).toFixed(2)} €</td></tr>
                <tr class="row-total-gasto"><td>TOTAL GASTO OFICINA</td><td>-</td><td>-</td><td class="val-total">${applyIPC(baseOficinaEur * m).toFixed(2)} €</td></tr>
            </table>
        </div>

        <div class="card">
            <h3><i class="fas fa-shining"></i> Material de limpieza</h3>
            <table>
                <thead><tr><th>Elemento</th><th>Cantidad (12m)</th><th>IPC %</th><th>Gasto (€)</th></tr></thead>
                <tr><td>Detergente Multiusos</td><td>${(150 * m).toFixed(1)} L</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(270 * m).toFixed(2)} €</td></tr>
                <tr><td>Desinfectante</td><td>${(96 * m).toFixed(1)} L</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(307.2 * m).toFixed(2)} €</td></tr>
                <tr><td>Papel Higiénico</td><td>${Math.round(1140 * m)} ud</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(433.2 * m).toFixed(2)} €</td></tr>
                <tr><td>Jabón de manos</td><td>${(120 * m).toFixed(1)} L</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(252 * m).toFixed(2)} €</td></tr>
                <tr class="row-total-gasto"><td>TOTAL GASTO LIMPIEZA</td><td>-</td><td>-</td><td class="val-total">${applyIPC(baseLimpiezaEur * m).toFixed(2)} €</td></tr>
            </table>
        </div>
    `;
}

function updateChart() {
    const m = getMultiplier();
    const dElec = (baseElec * m) / 100;
    const dAgua = (baseAgua * m);
    const dOfic = applyIPC(baseOficinaEur * m);
    const dLimp = applyIPC(baseLimpiezaEur * m);

    const config = {
        type: 'bar',
        data: {
            labels: ['Energía (kWh/100)', 'Agua (m³)', 'Oficina (€)', 'Limpieza (€)'],
            datasets: [{
                label: 'Impacto Ambiental / Económico (inc. IPC)',
                data: [dElec, dAgua, dOfic, dLimp],
                backgroundColor: ['#004a99', '#28a745', '#f39c12', '#ff0000'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 2500,
                    title: { display: true, text: 'Consumo / Coste' }
                }
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Impacto ITB', font: { size: 18 } }
            }
        }
    };

    if (myChart) myChart.destroy();
    myChart = new Chart(document.getElementById('sustainabilityChart').getContext('2d'), config);
}

// Inicialización al cargar el script
render();
updateChart();