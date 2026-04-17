let myChart;
let comparisonChart;
let currentMode = 'current';

const currentYear = new Date().getFullYear();

const baseElec = 158500;
const baseAgua = 950;
const baseOficinaEur = 2273.5;
const baseLimpiezaEur = 1262.4;

const colors = {
    energia: '0, 74, 153',
    agua: '40, 167, 69',
    oficina: '243, 156, 18',
    limpieza: '255, 0, 0'
};

const getSectionColors = (opacity) => [
    `rgba(${colors.energia}, ${opacity})`,
    `rgba(${colors.agua}, ${opacity})`,
    `rgba(${colors.oficina}, ${opacity})`,
    `rgba(${colors.limpieza}, ${opacity})`
];

function getMultiplier(mode) {
    if (mode === 'past') return 1.05;
    if (mode === 'future') return 0.90;
    if (mode === 'goal') return 0.70;
    return 1.0;
}

function getIPC(mode) {
    if (mode === 'past') return -3.1;
    if (mode === 'current') return 0;
    if (mode === 'future') return 2.5;
    if (mode === 'goal') return 7.7;
    return 0;
}

function applyIPC(value, mode) {
    return value * (1 + (getIPC(mode) / 100));
}

function getDataForMode(mode) {
    const m = getMultiplier(mode);
    return [
        (baseElec * m) / 100,
        (baseAgua * m),
        applyIPC(baseOficinaEur * m, mode),
        applyIPC(baseLimpiezaEur * m, mode)
    ];
}

function getSavings() {
    let s = { elec: 1, agua: 1, ofic: 1, limp: 1 };
    if (document.getElementById('check-solar').checked) s.elec -= 0.15;
    if (document.getElementById('check-iot').checked) { s.elec -= 0.10; s.agua -= 0.10; }
    if (document.getElementById('check-paper').checked) s.ofic -= 0.30;
    if (document.getElementById('check-dispenser').checked) s.limp -= 0.15;
    return s;
}

function updateInterfaceTexts() {
    document.getElementById('btn-past').innerText = `Año Pasado (${currentYear - 1})`;
    document.getElementById('btn-current').innerText = `Este Año (${currentYear})`;
    document.getElementById('btn-future').innerText = `Próximo Año (${currentYear + 1})`;
    document.getElementById('btn-goal').innerText = `Meta 3 Años (${currentYear + 3})`;
}

function initChart() {
    const ctx = document.getElementById('sustainabilityChart').getContext('2d');
    const data = {
        labels: ['Energía (kWh/100)', 'Agua (m³)', 'Oficina (€)', 'Limpieza (€)'],
        datasets: [
            { label: `Año ${currentYear - 1}`, data: getDataForMode('past'), backgroundColor: getSectionColors(0.3), borderColor: getSectionColors(1), borderWidth: 1 },
            { label: `Año ${currentYear}`, data: getDataForMode('current'), backgroundColor: getSectionColors(0.5), borderColor: getSectionColors(1), borderWidth: 1 },
            { label: `Año ${currentYear + 1}`, data: getDataForMode('future'), backgroundColor: getSectionColors(0.8), borderColor: getSectionColors(1), borderWidth: 1 },
            { label: `Meta ${currentYear + 3}`, data: getDataForMode('goal'), backgroundColor: getSectionColors(1), borderColor: getSectionColors(1), borderWidth: 1 }
        ]
    };

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 2700 } } }
    });
}

function initComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const actualData = getDataForMode(currentMode);
    const s = getSavings();
    const projectedData = [
        actualData[0] * s.elec,
        actualData[1] * s.agua,
        actualData[2] * s.ofic,
        actualData[3] * s.limp
    ];

    const data = {
        labels: ['Energía', 'Agua', 'Oficina', 'Limpieza'],
        datasets: [
            { label: 'Situación Real', data: actualData, backgroundColor: '#ddd' },
            { label: 'Con Mejoras Aplicadas', data: projectedData, backgroundColor: '#28a745' }
        ]
    };

    if (comparisonChart) comparisonChart.destroy();
    comparisonChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 2700 } }
        }
    });
}

function updateView(mode) {
    currentMode = mode;
    document.querySelectorAll('.selector-temporal button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    render();
    initComparisonChart();
}

function updateComparisonChart() {
    initComparisonChart();
}

function render() {
    const m = getMultiplier(currentMode);
    const ipcPercent = getIPC(currentMode);
    const grid = document.getElementById('main-grid');

    let dYear = currentYear;
    if (currentMode === 'past') dYear = currentYear - 1;
    if (currentMode === 'future') dYear = currentYear + 1;
    if (currentMode === 'goal') dYear = currentYear + 3;

    grid.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-bolt"></i> Energía Eléctrica (${dYear})</h3>
            <table>
                <thead><tr><th>Indicador</th><th>Gasto Anual</th><th>Lectivo (Sep-Jun)</th></tr></thead>
                <tr><td>Electricidad IT <span class="label-sub">Servidores + Aulas</span></td><td class="val-total">${(baseElec * m).toLocaleString()} kWh</td><td class="val-total">${(baseElec * m * 0.88).toLocaleString()} kWh</td></tr>
            </table>
        </div>

        <div class="card">
            <h3><i class="fas fa-tint"></i> Agua (${dYear})</h3>
            <table>
                <thead><tr><th>Indicador</th><th>Gasto Anual</th><th>Lectivo (Sep-Jun)</th></tr></thead>
                <tr><td>Agua <span class="label-sub">1.000 usuarios + Limpieza</span></td><td class="val-total">${(baseAgua * m).toFixed(1)} m³</td><td class="val-total">${(baseAgua * m * 0.9).toFixed(1)} m³</td></tr>
            </table>
        </div>

        <div class="card">
            <h3><i class="fas fa-copy"></i> Material de oficina (${dYear})</h3>
            <table>
                <thead><tr><th>Elemento</th><th>Cantidad (12m)</th><th>IPC %</th><th>Gasto (€)</th></tr></thead>
                <tr><td>Papel A4 Blanco</td><td>${Math.round(495 * m)} paq</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(2079 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Recambios Pizarra</td><td>${Math.round(120 * m)} ud</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(132 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Carpetas/Subcarpetas</td><td>${Math.round(250 * m)} ud</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(62.5 * m, currentMode).toFixed(2)} €</td></tr>
                <tr class="row-total-gasto"><td>TOTAL GASTO OFICINA</td><td>-</td><td>-</td><td class="val-total">${applyIPC(baseOficinaEur * m, currentMode).toFixed(2)} €</td></tr>
            </table>
        </div>

        <div class="card">
            <h3><i class="fas fa-shining"></i> Material de limpieza (${dYear})</h3>
            <table>
                <thead><tr><th>Elemento</th><th>Cantidad (12m)</th><th>IPC %</th><th>Gasto (€)</th></tr></thead>
                <tr><td>Detergente Multiusos</td><td>${(150 * m).toFixed(1)} L</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(270 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Desinfectante</td><td>${(96 * m).toFixed(1)} L</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(307.2 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Paper Higiènic</td><td>${Math.round(1140 * m)} ud</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(433.2 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Sabó de mans</td><td>${(120 * m).toFixed(1)} L</td><td>${ipcPercent}%</td><td class="val-total">${applyIPC(252 * m, currentMode).toFixed(2)} €</td></tr>
                <tr class=\"row-total-gasto\"><td>TOTAL GASTO LIMPIEZA</td><td>-</td><td>-</td><td class=\"val-total\">${applyIPC(baseLimpiezaEur * m, currentMode).toFixed(2)} €</td></tr>
            </table>
        </div>
    `;

    document.getElementById('cronograma-body').innerHTML = `
        <tr><td>Año 1 (${currentYear + 1})</td><td>Instalación de sensores IoT</td><td>kWh y m³</td><td><b>-10%</b></td></tr>
        <tr><td>Año 2 (${currentYear + 2})</td><td>Virtualización de servidores</td><td>Amperaje Rack</td><td><b>-22%</b></td></tr>
        <tr><td>Año 3 (${currentYear + 3})</td><td>Digitalización y Dispensadores</td><td>Papel y Jabón</td><td><b>-30% / -15%</b></td></tr>
    `;
}

window.onload = function() {
    updateInterfaceTexts();
    render();
    initChart();
    initComparisonChart();
};