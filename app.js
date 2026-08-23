// State Application Object
const state = {
    allData: {},
    year: '2024',
    limit: 1000,
    sector: 'ALL',
    city: 'ALL',
    search: '',
    sortCol: 'rank',
    sortAsc: true,
    page: 1,
    pageSize: 100
};

// Global References
let map = null;
let markersLayer = null;
let chartSectorInstance = null;
let chartCitiesInstance = null;
let chartTop10Instance = null;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initEventListeners();
    initMap();
    loadData();
});

// Setup Event Listeners
function initEventListeners() {
    // Preset Buttons (Top 1.000, Top 100, Top 500, 10.000)
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.limit = parseInt(e.target.dataset.limit, 10);
            state.page = 1;
            render();
        });
    });

    // Year Filter
    document.getElementById('selectYear').addEventListener('change', (e) => {
        state.year = e.target.value;
        state.page = 1;
        populateCitySelect();
        render();
    });

    // Sector Filter
    document.getElementById('selectSector').addEventListener('change', (e) => {
        state.sector = e.target.value;
        state.page = 1;
        render();
    });

    // Location Filter
    document.getElementById('selectCity').addEventListener('change', (e) => {
        state.city = e.target.value;
        state.page = 1;
        render();
    });

    // Search Query Filter
    document.getElementById('searchQuery').addEventListener('input', (e) => {
        state.search = e.target.value.trim().toLowerCase();
        state.page = 1;
        render();
    });

    // Table Pagination
    document.getElementById('pageSize').addEventListener('change', (e) => {
        state.pageSize = parseInt(e.target.value, 10);
        state.page = 1;
        renderTableOnly();
    });

    document.getElementById('btnPrevPage').addEventListener('click', () => {
        if (state.page > 1) {
            state.page--;
            renderTableOnly();
        }
    });

    document.getElementById('btnNextPage').addEventListener('click', () => {
        const filtered = getFilteredData();
        const maxPage = Math.ceil(filtered.length / state.pageSize);
        if (state.page < maxPage) {
            state.page++;
            renderTableOnly();
        }
    });

    // Modal Events
    const modal = document.getElementById('modalExplanation');
    document.getElementById('btnExplanation').addEventListener('click', () => {
        modal.classList.remove('hidden');
    });
    document.getElementById('btnCloseModal').addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // Export Button
    document.getElementById('btnExport').addEventListener('click', exportCSV);

    // Table Sort Headers
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const col = th.dataset.sort;
            if (state.sortCol === col) {
                state.sortAsc = !state.sortAsc;
            } else {
                state.sortCol = col;
                state.sortAsc = col === 'rank' || col === 'name' || col === 'city' || col === 'sector';
            }
            renderTableOnly();
        });
    });
}

// Initialize OpenStreetMap Leaflet Map
function initMap() {
    // Coordenadas centradas en Colombia
    map = L.map('map', {
        center: [4.5709, -74.2973],
        zoom: 6,
        zoomControl: true
    });

    // Capa de Mapa CartoDB Positron / Dark para diseño profesional
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);
}

// Load JSON Dataset
async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('No se pudo cargar el archivo data.json');
        state.allData = await response.json();
        populateCitySelect();
        render();
    } catch (err) {
        console.error('Error al cargar datos:', err);
        alert('Error al cargar el conjunto de datos de las empresas. Por favor recarga la página.');
    }
}

// Populate City Dropdown Based on Current Year Data
function populateCitySelect() {
    const yearData = state.allData[state.year] || [];
    const citiesSet = new Set();
    yearData.forEach(item => {
        if (item.city) citiesSet.add(item.city);
    });

    const selectCity = document.getElementById('selectCity');
    const sortedCities = Array.from(citiesSet).sort();
    selectCity.innerHTML = '<option value="ALL">Todas las ciudades</option>' + 
        sortedCities.map(c => `<option value="${c}">${c}</option>`).join('');
    selectCity.value = state.city !== 'ALL' && citiesSet.has(state.city) ? state.city : 'ALL';
}

// Get Filtered Data Array
function getFilteredData() {
    let yearData = state.allData[state.year] || [];

    // Slice for top limit (e.g. Top 1000)
    let dataset = yearData.slice(0, state.limit);

    // Apply Filters
    return dataset.filter(item => {
        // Sector Filter
        if (state.sector !== 'ALL' && item.sector !== state.sector) return false;
        
        // City Filter
        if (state.city !== 'ALL' && item.city !== state.city) return false;

        // Text Search (Name or NIT)
        if (state.search) {
            const nameMatch = item.name.toLowerCase().includes(state.search);
            const nitMatch = item.nit.toLowerCase().includes(state.search);
            if (!nameMatch && !nitMatch) return false;
        }

        return true;
    });
}

// Main Render Function
function render() {
    const filtered = getFilteredData();
    updateKPIs(filtered);
    updateMap(filtered);
    updateCharts(filtered);
    renderTableOnly(filtered);
}

// Update KPI Metrics Cards
function updateKPIs(data) {
    const totalIngresos = data.reduce((acc, curr) => acc + curr.ingresos, 0);
    const totalCount = data.length;
    
    document.getElementById('kpiTotalIngresos').textContent = `$${totalIngresos.toFixed(2)} B`;
    document.getElementById('kpiTotalEmpresas').textContent = totalCount.toLocaleString();

    const rangeLabel = state.limit === 10000 ? 'Todas las 10.000' : `Top ${state.limit}`;
    document.getElementById('kpiSubtitleRange').textContent = `Filtradas del ${rangeLabel} (${state.year})`;

    if (data.length > 0) {
        document.getElementById('kpiTopCompany').textContent = data[0].name;
        document.getElementById('kpiTopCompanyRev').textContent = `$${data[0].ingresos.toFixed(2)} B COP (#${data[0].rank})`;
    } else {
        document.getElementById('kpiTopCompany').textContent = '-';
        document.getElementById('kpiTopCompanyRev').textContent = '$0.00 B COP';
    }

    // Calculate Top City Concentration
    const cityCounts = {};
    data.forEach(item => {
        cityCounts[item.city] = (cityCounts[item.city] || 0) + 1;
    });
    
    let topCity = 'N/A';
    let maxCount = 0;
    for (const [c, cnt] of Object.entries(cityCounts)) {
        if (cnt > maxCount) {
            maxCount = cnt;
            topCity = c;
        }
    }
    
    document.getElementById('kpiTopCity').textContent = topCity;
    document.getElementById('kpiTopCityCount').textContent = `${maxCount.toLocaleString()} empresas (${((maxCount / (totalCount || 1)) * 100).toFixed(1)}%)`;
}

// Update OpenStreetMap Markers & Clusters
function updateMap(data) {
    markersLayer.clearLayers();

    // Group companies by city & lat/lng
    const cityMap = {};
    data.forEach(item => {
        const key = item.city;
        if (!cityMap[key]) {
            cityMap[key] = {
                city: item.city,
                dept: item.dept,
                lat: item.lat,
                lng: item.lng,
                count: 0,
                totalIngresos: 0,
                topCompanies: []
            };
        }
        cityMap[key].count += 1;
        cityMap[key].totalIngresos += item.ingresos;
        if (cityMap[key].topCompanies.length < 4) {
            cityMap[key].topCompanies.push(item);
        }
    });

    const citiesList = Object.values(cityMap);
    if (citiesList.length === 0) return;

    citiesList.forEach(c => {
        // Radius scale based on log or sqrt of revenue
        const radius = Math.min(Math.max(Math.sqrt(c.totalIngresos) * 3.5 + c.count * 0.15, 7), 35);
        
        const circle = L.circleMarker([c.lat, c.lng], {
            radius: radius,
            fillColor: '#f59e0b',
            color: '#d97706',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.65
        });

        // HTML Content for Popup
        const popupContent = `
            <div class="p-2 space-y-2 max-w-xs text-xs">
                <div class="border-b border-slate-700 pb-1.5 flex items-center justify-between">
                    <div>
                        <h4 class="font-bold text-sm text-amber-400">${c.city}</h4>
                        <span class="text-[10px] text-slate-400 uppercase tracking-wider">${c.dept}</span>
                    </div>
                    <span class="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[11px]">${c.count} empresas</span>
                </div>
                
                <div class="text-slate-300">
                    <p class="text-[11px] text-slate-400">Facturación Total:</p>
                    <p class="font-bold text-white text-sm">$${c.totalIngresos.toFixed(2)} Billones COP</p>
                </div>

                <div class="space-y-1 pt-1">
                    <p class="text-[10px] font-semibold text-slate-400 uppercase">Principales Empresas:</p>
                    ${c.topCompanies.map(comp => `
                        <div class="flex items-center justify-between text-[11px] bg-slate-900/60 p-1.5 rounded border border-slate-800">
                            <span class="truncate max-w-[140px] text-slate-200" title="${comp.name}">#${comp.rank} ${comp.name}</span>
                            <span class="font-bold text-amber-400 ml-1">$${comp.ingresos.toFixed(2)} B</span>
                        </div>
                    `).join('')}
                </div>

                <button onclick="filterByCity('${c.city}')" class="w-full mt-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-center py-1.5 rounded transition">
                    Filtrar tabla por ${c.city}
                </button>
            </div>
        `;

        circle.bindPopup(popupContent);
        markersLayer.addLayer(circle);
    });
}

// Filter Action from Map Popup
window.filterByCity = function(cityName) {
    state.city = cityName;
    document.getElementById('selectCity').value = cityName;
    state.page = 1;
    render();
};

// Update Chart.js Visualizations
function updateCharts(data) {
    // 1. Chart Sector Distribution (Donut)
    const sectorTotals = {};
    data.forEach(item => {
        sectorTotals[item.sector] = (sectorTotals[item.sector] || 0) + item.ingresos;
    });

    const sectorLabels = Object.keys(sectorTotals);
    const sectorValues = Object.values(sectorTotals);

    const ctxSector = document.getElementById('chartSector').getContext('2d');
    if (chartSectorInstance) chartSectorInstance.destroy();

    chartSectorInstance = new Chart(ctxSector, {
        type: 'doughnut',
        data: {
            labels: sectorLabels,
            datasets: [{
                data: sectorValues,
                backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'],
                borderWidth: 2,
                borderColor: '#1e293b'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#cbd5e1', font: { size: 10 } }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: $${ctx.raw.toFixed(2)} B COP`
                    }
                }
            }
        }
    });

    // 2. Chart Top Cities (Horizontal Bar)
    const cityTotals = {};
    data.forEach(item => {
        cityTotals[item.city] = (cityTotals[item.city] || 0) + item.ingresos;
    });

    const sortedCities = Object.entries(cityTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const ctxCities = document.getElementById('chartCities').getContext('2d');
    if (chartCitiesInstance) chartCitiesInstance.destroy();

    chartCitiesInstance = new Chart(ctxCities, {
        type: 'bar',
        data: {
            labels: sortedCities.map(c => c[0]),
            datasets: [{
                label: 'Facturación (Billones COP)',
                data: sortedCities.map(c => c[1]),
                backgroundColor: '#38bdf8',
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `$${ctx.raw.toFixed(2)} Billones COP`
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { size: 9 } }, grid: { color: '#334155' } },
                y: { ticks: { color: '#f8fafc', font: { size: 10 } }, grid: { display: false } }
            }
        }
    });

    // 3. Chart Top 10 Companies Bar Chart
    const top10 = data.slice(0, 10);
    const ctxTop10 = document.getElementById('chartTop10').getContext('2d');
    if (chartTop10Instance) chartTop10Instance.destroy();

    chartTop10Instance = new Chart(ctxTop10, {
        type: 'bar',
        data: {
            labels: top10.map(item => item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name),
            datasets: [
                {
                    label: 'Ingresos Operacionales ($B COP)',
                    data: top10.map(item => item.ingresos),
                    backgroundColor: '#f59e0b',
                    borderRadius: 6
                },
                {
                    label: 'Ganancias ($B COP)',
                    data: top10.map(item => item.ganancias),
                    backgroundColor: '#10b981',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#cbd5e1', font: { size: 11 } } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)} Billones COP`
                    }
                }
            },
            scales: {
                x: { ticks: { color: '#cbd5e1', font: { size: 10 } }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { color: '#334155' } }
            }
        }
    });
}

// Render Interactive Data Table
function renderTableOnly(data) {
    const filteredData = data || getFilteredData();

    // Sort Filtered Data
    filteredData.sort((a, b) => {
        let valA = a[state.sortCol];
        let valB = b[state.sortCol];

        if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
        }

        if (valA < valB) return state.sortAsc ? -1 : 1;
        if (valA > valB) return state.sortAsc ? 1 : -1;
        return 0;
    });

    // Pagination calculations
    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;

    const startIdx = (state.page - 1) * state.pageSize;
    const pageItems = filteredData.slice(startIdx, startIdx + state.pageSize);

    // Update Pagination Text
    document.getElementById('pageInfo').textContent = `Mostrando ${totalItems === 0 ? 0 : startIdx + 1} - ${Math.min(startIdx + state.pageSize, totalItems)} de ${totalItems.toLocaleString()} empresas`;
    document.getElementById('currentPageText').textContent = `${state.page} / ${totalPages}`;
    document.getElementById('btnPrevPage').disabled = state.page === 1;
    document.getElementById('btnNextPage').disabled = state.page === totalPages;

    // Render Table Rows
    const tbody = document.getElementById('tableBody');
    if (pageItems.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-8 text-slate-500">
                    No se encontraron empresas con los filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = pageItems.map(item => {
        let rankBadgeClass = 'bg-slate-800 text-slate-400 border border-slate-700';
        if (item.rank === 1) rankBadgeClass = 'rank-badge-gold';
        else if (item.rank === 2) rankBadgeClass = 'rank-badge-silver';
        else if (item.rank === 3) rankBadgeClass = 'rank-badge-bronze';

        const gainClass = item.ganancias < 0 ? 'text-rose-400' : 'text-emerald-400';

        return `
            <tr class="hover:bg-slate-800/60 transition-colors">
                <td class="py-3 px-3.5 text-center">
                    <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${rankBadgeClass}">
                        #${item.rank}
                    </span>
                </td>
                <td class="py-3 px-3.5 font-semibold text-white">
                    ${item.name}
                </td>
                <td class="py-3 px-3.5 text-slate-400">
                    <span class="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700">
                        ${item.sector}
                    </span>
                </td>
                <td class="py-3 px-3.5 text-slate-300">
                    ${item.city} <span class="text-[10px] text-slate-500">(${item.dept})</span>
                </td>
                <td class="py-3 px-3.5 text-right font-bold text-amber-400">
                    $${item.ingresos.toFixed(2)} B
                </td>
                <td class="py-3 px-3.5 text-right font-bold ${gainClass}">
                    $${item.ganancias.toFixed(2)} B
                </td>
                <td class="py-3 px-3.5 text-right font-medium text-slate-300">
                    $${item.activos.toFixed(2)} B
                </td>
                <td class="py-3 px-3.5 text-center text-slate-500 font-mono text-[11px]">
                    ${item.nit}
                </td>
            </tr>
        `;
    }).join('');
}

// Export Filtered View to CSV File
function exportCSV() {
    const filtered = getFilteredData();
    if (filtered.length === 0) {
        alert('No hay datos para exportar.');
        return;
    }

    const headers = ['Ranking', 'NIT', 'Empresa', 'Supervisor', 'Region', 'Departamento', 'Ciudad', 'Macrosector', 'Ingresos (Billones COP)', 'Ganancias (Billones COP)', 'Activos (Billones COP)', 'Año'];
    const rows = filtered.map(i => [
        i.rank,
        `"${i.nit}"`,
        `"${i.name.replace(/"/g, '""')}"`,
        `"${i.supervisor}"`,
        `"${i.region}"`,
        `"${i.dept}"`,
        `"${i.city}"`,
        `"${i.sector}"`,
        i.ingresos,
        i.ganancias,
        i.activos,
        i.year
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
        [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `empresas_colombia_${state.year}_top${state.limit}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
