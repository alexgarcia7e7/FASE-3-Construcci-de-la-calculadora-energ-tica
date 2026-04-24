let myChart;
let comparisonChart;
let currentMode = 'current';
const currentYear = new Date().getFullYear();

// ORIGINAL DATA (NO TOCADOS)
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

// CATEGORY FILTER
function filterCategory(category, btn) {
    const cards = document.querySelectorAll('.checkbox-card');
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cards.forEach(card => {
        card.style.display = (category === 'all' || card.getAttribute('data-cat') === category) ? 'flex' : 'none';
    });
}

function getMultiplier(mode) {
    const map = { 'past': 1.05, 'current': 1.0, 'future': 0.90, 'goal': 0.70 };
    return map[mode] || 1.0;
}

function getIPC(mode) {
    const map = { 'past': -3.1, 'current': 0, 'future': 2.5, 'goal': 7.7 };
    return map[mode] || 0;
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

// SAVINGS LOGIC ACCORDING TO 16 CHECKBOXES
function getSavings() {
    let s = { elec: 1, agua: 1, ofic: 1, limp: 1 };
    if (document.getElementById('check-solar').checked) s.elec -= 0.15;
    if (document.getElementById('check-server').checked) s.elec -= 0.22;
    if (document.getElementById('check-led').checked) s.elec -= 0.10;
    if (document.getElementById('check-clima').checked) s.elec -= 0.12;
    if (document.getElementById('check-iot').checked) s.agua -= 0.10;
    if (document.getElementById('check-perlatis').checked) s.agua -= 0.15;
    if (document.getElementById('check-rain').checked) s.agua -= 0.08;
    if (document.getElementById('check-dry').checked) s.agua -= 0.05;
    if (document.getElementById('check-paper').checked) s.ofic -= 0.30;
    if (document.getElementById('check-toner').checked) s.ofic -= 0.15;
    if (document.getElementById('check-refurb').checked) s.ofic -= 0.10;
    if (document.getElementById('check-cloud').checked) s.ofic -= 0.05;
    if (document.getElementById('check-dispenser').checked) s.limp -= 0.15;
    if (document.getElementById('check-bio').checked) s.limp -= 0.10;
    if (document.getElementById('check-ozone').checked) s.limp -= 0.12;
    if (document.getElementById('check-micro').checked) s.limp -= 0.08;
    return s;
}

function render() {
    const m = getMultiplier(currentMode);
    const ipc = getIPC(currentMode);
    const grid = document.getElementById('main-grid');
    let dYear = currentMode === 'past' ? currentYear - 1 : currentMode === 'future' ? currentYear + 1 : currentMode === 'goal' ? currentYear + 3 : currentYear;

    grid.innerHTML = `
        <div class="card">
            <h3><i class="fas fa-bolt"></i> Electric Energy (${dYear})</h3>
            <table>
                <thead><tr><th>Indicator</th><th>Annual Cost</th><th>Term (Sep-Jun)</th></tr></thead>
                <tr><td>IT Electricity <span class="label-sub">Servers + Classrooms</span></td><td class="val-total">${(baseElec * m).toLocaleString()} kWh</td><td class="val-total">${(baseElec * m * 0.88).toLocaleString()} kWh</td></tr>
            </table>
        </div>
        <div class="card">
            <h3><i class="fas fa-tint"></i> Water (${dYear})</h3>
            <table>
                <thead><tr><th>Indicator</th><th>Annual Cost</th><th>Term (Sep-Jun)</th></tr></thead>
                <tr><td>Water <span class="label-sub">1,000 users + Cleaning</span></td><td class="val-total">${(baseAgua * m).toFixed(1)} m³</td><td class="val-total">${(baseAgua * m * 0.9).toFixed(1)} m³</td></tr>
            </table>
        </div>
        <div class="card">
            <h3><i class="fas fa-copy"></i> Office Supplies (${dYear})</h3>
            <table>
                <thead><tr><th>Item</th><th>Quantity (12m)</th><th>IPC %</th><th>Cost (€)</th></tr></thead>
                <tr><td>A4 White Paper</td><td>${Math.round(495 * m)} pks</td><td>${ipc}%</td><td class="val-total">${applyIPC(2079 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Board Refills</td><td>${Math.round(120 * m)} units</td><td>${ipc}%</td><td class="val-total">${applyIPC(132 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Folders/Subfolders</td><td>${Math.round(250 * m)} units</td><td>${ipc}%</td><td class="val-total">${applyIPC(62.5 * m, currentMode).toFixed(2)} €</td></tr>
                <tr class="row-total-gasto"><td>TOTAL OFFICE COST</td><td>-</td><td>-</td><td class="val-total">${applyIPC(baseOficinaEur * m, currentMode).toFixed(2)} €</td></tr>
            </table>
        </div>
        <div class="card">
            <h3><i class="fas fa-shining"></i> Cleaning Supplies (${dYear})</h3>
            <table>
                <thead><tr><th>Item</th><th>Quantity (12m)</th><th>IPC %</th><th>Cost (€)</th></tr></thead>
                <tr><td>Multipurpose Cleaner</td><td>${(150 * m).toFixed(1)} L</td><td>${ipc}%</td><td class="val-total">${applyIPC(270 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Disinfectant</td><td>${(96 * m).toFixed(1)} L</td><td>${ipc}%</td><td class="val-total">${applyIPC(307.2 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Toilet Paper</td><td>${Math.round(1140 * m)} units</td><td>${ipc}%</td><td class="val-total">${applyIPC(433.2 * m, currentMode).toFixed(2)} €</td></tr>
                <tr><td>Hand Soap</td><td>${(120 * m).toFixed(1)} L</td><td>${ipc}%</td><td class="val-total">${applyIPC(252 * m, currentMode).toFixed(2)} €</td></tr>
                <tr class="row-total-gasto"><td>TOTAL CLEANING COST</td><td>-</td><td>-</td><td class="val-total">${applyIPC(baseLimpiezaEur * m, currentMode).toFixed(2)} €</td></tr>
            </table>
        </div>
    `;

    document.getElementById('cronograma-body').innerHTML = `
        <tr><td>Year 1 (2027)</td><td><b>Energy:</b> Solar and LED</td><td>kWh</td><td><b>-25%</b></td></tr>
        <tr><td>Year 2 (2028)</td><td><b>Water:</b> Sensors and Aerators</td><td>m³</td><td><b>-25%</b></td></tr>
        <tr><td>Year 3 (2029)</td><td><b>Materials:</b> Zero Paper and Dispensers</td><td>€ / Waste</td><td><b>-45%</b></td></tr>
    `;
}

function initComparisonChart() {
    const ctx = document.getElementById('comparisonChart').getContext('2d');
    const actualBase = getDataForMode(currentMode);
    const s = getSavings();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const generateRealisticData = (baseVal, savingFactor) => {
        return months.map((m, index) => {
            let seasonality = 1.0;
            if ([0, 4, 11].includes(index)) seasonality = 1.15; // Exams & Winter
            if ([3, 6, 7].includes(index)) seasonality = 0.45; // Holidays
            let progress = (index / 11);
            let targetSaving = 1 - ((1 - savingFactor) * progress);
            let noise = 1 + (Math.random() * 0.08 - 0.04);
            return baseVal * targetSaving * seasonality * noise;
        });
    };

    if (comparisonChart) comparisonChart.destroy();
    comparisonChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                { label: 'Energy', data: generateRealisticData(actualBase[0], s.elec), borderColor: 'rgba(0, 74, 153, 1)', tension: 0.4, fill: false },
                { label: 'Water', data: generateRealisticData(actualBase[1], s.agua), borderColor: 'rgba(40, 167, 69, 1)', tension: 0.4, fill: false },
                { label: 'Office', data: generateRealisticData(actualBase[2], s.ofic), borderColor: 'rgba(243, 156, 18, 1)', tension: 0.4, fill: false },
                { label: 'Cleaning', data: generateRealisticData(actualBase[3], s.limp), borderColor: 'rgba(255, 0, 0, 1)', tension: 0.4, fill: false }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 2700 } } }
    });
}

function initChart() {
    const ctx = document.getElementById('sustainabilityChart').getContext('2d');
    const labels = [`${currentYear - 1}`, `${currentYear}`, `${currentYear + 1}`, `${currentYear + 3}`];
    const data = {
        labels: ['Energy (kWh/100)', 'Water (m³)', 'Office (€)', 'Cleaning (€)'],
        datasets: labels.map((label, i) => ({
            label,
            data: getDataForMode(['past', 'current', 'future', 'goal'][i]),
            backgroundColor: getSectionColors(0.3 + (i * 0.2)),
            borderColor: getSectionColors(1),
            borderWidth: 1
        }))
    };
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, { type: 'bar', data, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 2700 } } } });
}

function updateView(mode) {
    currentMode = mode;
    document.querySelectorAll('.selector-temporal button').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    render();
    initComparisonChart();
}

function updateComparisonChart() { initComparisonChart(); }

function updateInterfaceTexts() {
    document.getElementById('btn-past').innerText = `Last Year (${currentYear - 1})`;
    document.getElementById('btn-current').innerText = `Current Year (${currentYear})`;
    document.getElementById('btn-future').innerText = `Next Year (${currentYear + 1})`;
    document.getElementById('btn-goal').innerText = `3-Year Goal (${currentYear + 3})`;
}

window.onload = () => {
    updateInterfaceTexts(); render(); initChart(); initComparisonChart();
};