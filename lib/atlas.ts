// @ts-nocheck
// Auto-extracted imperative D3 + CRM logic from the original single-file app.
// Wrapped in initAtlas() so it runs once after the React markup mounts.
/* eslint-disable */
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { STATES_TOPO, COUNTIES_TOPO, DOT_DATA, FIPS_TO_ABBR, SEED_CONTACTS } from './data';

export function initAtlas() {

function fmtMoney(m) {
  if (m >= 1000) return '$' + (m / 1000).toFixed(2) + 'B';
  if (m >= 100) return '$' + m.toFixed(0) + 'M';
  return '$' + m.toFixed(1) + 'M';
}
function fmtMoneyShort(m) {
  if (m >= 1000) return '$' + (m / 1000).toFixed(1) + 'B';
  if (m >= 1) return '$' + m.toFixed(0) + 'M';
  return '$' + (m * 1000).toFixed(0) + 'K';
}
function fmtNumber(n) { return n.toLocaleString('en-US'); }
function fmtPct(n) { return (n >= 0 ? '+' : '') + n.toFixed(1) + '%'; }

const CATEGORY_COLORS = {
  construction_capital: '#f4b942',
  maintenance_services: '#5fbfb8',
  administration_safety: '#e07560',
  grants_to_local_govts: '#a888d8',
  debt_service_interest: '#8a93b3',
  other: '#5fb78a',
};
const CATEGORY_LABELS = {
  construction_capital: 'Capital Outlay (Construction)',
  maintenance_services: 'Maintenance & Highway Services',
  administration_safety: 'Administration, Police & Safety',
  grants_to_local_govts: 'Grants-in-Aid to Local Governments',
  debt_service_interest: 'Debt Service & Interest',
  other: 'Other',
};
const FUNDING_LABELS = {
  general_fund: 'General Fund',
  federal_funds: 'Federal Funds',
  other_state_funds: 'Other State Funds',
  bonds: 'Bonds',
};
const FUNDING_COLORS = {
  general_fund: 'var(--fund-general)',
  federal_funds: 'var(--fund-federal)',
  other_state_funds: 'var(--fund-other)',
  bonds: 'var(--fund-bonds)',
};

function computeNational() {
  let total = 0, totalFy23 = 0;
  let funding = { general_fund:0, federal_funds:0, other_state_funds:0, bonds:0 };
  let bridges = 0;
  for (const abbr in DOT_DATA) {
    const s = DOT_DATA[abbr];
    total += s.totalBudget;
    totalFy23 += s.history[0].total;
    funding.general_fund += s.fundingSources.general_fund;
    funding.federal_funds += s.fundingSources.federal_funds;
    funding.other_state_funds += s.fundingSources.other_state_funds;
    funding.bonds += s.fundingSources.bonds;
    bridges += s.stats.bridges;
  }
  return { total, totalFy23, funding, bridges };
}

let currentMode = 'total';
let selectedState = null;
let activeTab = 'overview';
let isZoomed = false;
let currentCounties = []; // counties for the currently-zoomed state

const svg = d3.select('#us-map');
const tooltip = d3.select('#map-tooltip');
const zoomBackBtn = document.getElementById('zoom-back');

// SVG groups for layers
let layersG, statesG, countiesG, countyLabelsG, stateLabelsG, nationBorderG;
let stateFeatures, allCountyFeatures, nationFeature;
let path;

function initSvg() {
  // Parse topojson once
  stateFeatures = topojson.feature(STATES_TOPO, STATES_TOPO.objects.states).features;
  allCountyFeatures = topojson.feature(COUNTIES_TOPO, COUNTIES_TOPO.objects.counties).features;
  nationFeature = topojson.feature(STATES_TOPO, STATES_TOPO.objects.nation);
  path = d3.geoPath();

  svg.selectAll('*').remove();
  layersG = svg.append('g').attr('class', 'layers');
  statesG = layersG.append('g').attr('class', 'states-layer');
  countiesG = layersG.append('g').attr('class', 'counties-layer');
  stateLabelsG = layersG.append('g').attr('class', 'state-labels');
  countyLabelsG = layersG.append('g').attr('class', 'county-labels');
  nationBorderG = layersG.append('g').attr('class', 'nation-border');
}

function getMetric(state, mode) {
  if (!state) return 0;
  if (mode === 'total') return state.totalBudget;
  if (mode === 'federal') return state.fundingSources.federal_funds;
  if (mode === 'perCapita') return state.totalBudget / state.population_millions;
  if (mode === 'pctState') return state.pctOfStateBudget.fy2025;
  if (mode === 'growth') return state.yoyGrowth.fy24_to_fy25;
  if (mode === 'bridgePoor') return state.stats.bridgesPoorPct;
  if (mode === 'coverage') return (typeof CRM !== 'undefined') ? CRM.countForState(state.abbr) : 0;
  return 0;
}

function getColorScale(mode) {
  const values = Object.values(DOT_DATA).map(s => getMetric(s, mode));
  const min = d3.min(values);
  const max = d3.max(values);
  if (mode === 'bridgePoor') {
    return d3.scaleSequentialPow(t =>
      d3.interpolateRgb('#1a2240', '#e07560')(Math.pow(t, 0.7))
    ).domain([min, max]);
  }
  if (mode === 'growth') {
    const absMax = Math.max(Math.abs(min), Math.abs(max));
    return d3.scaleDiverging(t => d3.interpolateRgb('#e07560', '#1a2240', '#5fb78a')(t))
      .domain([-absMax, 0, absMax]);
  }
  if (mode === 'coverage') {
    return d3.scaleSequentialPow(t =>
      d3.interpolateRgb('#1a2240', '#5fbfb8')(Math.pow(t, 0.7))
    ).domain([Math.min(min, 0), Math.max(max, 1)]);
  }
  return d3.scaleSequentialPow(t =>
    d3.interpolateRgb('#1a2240', '#f4b942')(Math.pow(t, 0.7))
  ).domain([min, max]);
}

function buildLegend(scale, mode) {
  const bar = document.getElementById('legend-bar');
  bar.innerHTML = '';
  const steps = 30;
  const [min, max] = mode === 'growth' ? [scale.domain()[0], scale.domain()[2]] : scale.domain();
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const v = min + (max - min) * t;
    const div = document.createElement('div');
    div.style.background = scale(v);
    bar.appendChild(div);
  }
  if (mode === 'perCapita') {
    document.getElementById('legend-min').textContent = '$' + min.toFixed(0);
    document.getElementById('legend-max').textContent = '$' + max.toFixed(0);
  } else if (mode === 'bridgePoor' || mode === 'pctState' || mode === 'growth') {
    document.getElementById('legend-min').textContent = min.toFixed(1) + '%';
    document.getElementById('legend-max').textContent = max.toFixed(1) + '%';
  } else if (mode === 'coverage') {
    document.getElementById('legend-min').textContent = Math.round(min) + ' contacts';
    document.getElementById('legend-max').textContent = Math.round(max) + ' contacts';
  } else {
    document.getElementById('legend-min').textContent = fmtMoneyShort(min);
    document.getElementById('legend-max').textContent = fmtMoneyShort(max);
  }
}

function renderStates() {
  const scale = getColorScale(currentMode);
  buildLegend(scale, currentMode);

  // States
  statesG.selectAll('path')
    .data(stateFeatures, d => d.id)
    .join('path')
    .attr('class', 'state')
    .attr('d', path)
    .attr('fill', d => {
      const abbr = FIPS_TO_ABBR[d.id];
      const s = DOT_DATA[abbr];
      if (!s) return '#1a2240';
      return scale(getMetric(s, currentMode));
    })
    .attr('data-abbr', d => FIPS_TO_ABBR[d.id] || '')
    .on('mouseover', function(event, d) {
      const abbr = FIPS_TO_ABBR[d.id];
      const s = DOT_DATA[abbr];
      if (!s) return;
      // When zoomed, only show tooltip for non-selected states (selected state has counties)
      if (isZoomed && abbr === selectedState) return;
      const total = s.totalBudget;
      const growth = s.yoyGrowth.fy24_to_fy25;
      const growthStr = fmtPct(growth);
      const growthColor = growth > 0 ? 'var(--green)' : (growth < 0 ? 'var(--red)' : 'var(--ink-muted)');
      const hint = isZoomed ? 'Click to switch to this state' : 'Click to zoom in';
      tooltip.html(`
        <div class="map-tooltip-name">${s.name}</div>
        <div class="map-tooltip-row"><span>FY2025 Budget</span><span>${fmtMoney(total)}</span></div>
        <div class="map-tooltip-row"><span>YoY Growth</span><span style="color:${growthColor}">${growthStr}</span></div>
        <div class="map-tooltip-row"><span>% of State Budget</span><span>${s.pctOfStateBudget.fy2025}%</span></div>
        <div class="map-tooltip-row"><span>Per Capita</span><span>$${(total/s.population_millions).toFixed(0)}</span></div>
        <div class="map-tooltip-row"><span>CRM Contacts</span><span>${(typeof CRM !== 'undefined') ? CRM.countForState(abbr) : 0}</span></div>
        <div class="map-tooltip-hint">${hint}</div>
      `).classed('show', true);
    })
    .on('mousemove', function(event) {
      const wrap = document.querySelector('.map-wrap').getBoundingClientRect();
      const x = event.clientX - wrap.left + 14;
      const y = event.clientY - wrap.top + 14;
      tooltip.style('left', x + 'px').style('top', y + 'px');
    })
    .on('mouseout', () => tooltip.classed('show', false))
    .on('click', function(event, d) {
      const abbr = FIPS_TO_ABBR[d.id];
      if (!DOT_DATA[abbr]) return;
      // If already zoomed, smooth transition to new state
      if (isZoomed && abbr !== selectedState) {
        // Clear existing counties, then zoom to new state
        countiesG.selectAll('.county').classed('show', false);
        countyLabelsG.selectAll('.county-label').classed('show', false);
        setTimeout(() => {
          countiesG.selectAll('.county').remove();
          countyLabelsG.selectAll('.county-label').remove();
          zoomToState(abbr, d);
        }, 200);
      } else {
        zoomToState(abbr, d);
      }
    });

  // State labels
  stateLabelsG.selectAll('text')
    .data(stateFeatures, d => d.id)
    .join('text')
    .attr('class', 'state-label')
    .attr('font-size', 8)
    .attr('transform', d => `translate(${path.centroid(d)})`)
    .text(d => FIPS_TO_ABBR[d.id] || '');

  // Nation border
  nationBorderG.selectAll('path')
    .data([nationFeature])
    .join('path')
    .attr('fill', 'none')
    .attr('stroke', 'rgba(255,255,255,0.12)')
    .attr('stroke-width', 1.2)
    .attr('d', path);
}

// ZOOM TO STATE
function zoomToState(abbr, feature) {
  if (!feature) {
    feature = stateFeatures.find(f => FIPS_TO_ABBR[f.id] === abbr);
    if (!feature) return;
  }
  selectedState = abbr;
  activeTab = 'overview';
  isZoomed = true;
  zoomBackBtn.classList.add('show');

  // Hide tooltip
  tooltip.classed('show', false);

  // Calculate zoom transform
  const [[x0, y0], [x1, y1]] = path.bounds(feature);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const w = x1 - x0, h = y1 - y0;
  const svgW = 975, svgH = 610;
  const padding = 1.15;
  const scale = Math.min(svgW / (w * padding), svgH / (h * padding));
  const tx = svgW / 2 - cx * scale;
  const ty = svgH / 2 - cy * scale;

  // Apply scaled stroke widths and font sizes immediately so they animate with the transform
  statesG.selectAll('.state').attr('stroke-width', 0.8 / scale);
  stateLabelsG.selectAll('.state-label').attr('font-size', 8 / scale);
  nationBorderG.selectAll('path').attr('stroke-width', 1.2 / scale);

  // Animate the transform
  layersG.transition()
    .duration(800)
    .attr('transform', `translate(${tx},${ty}) scale(${scale})`);

  // Dim other states
  statesG.selectAll('.state').classed('dimmed', d => FIPS_TO_ABBR[d.id] !== abbr);
  statesG.selectAll('.state').classed('selected', d => FIPS_TO_ABBR[d.id] === abbr);

  // Hide state labels for other states; keep only the zoomed state's
  stateLabelsG.selectAll('.state-label').classed('hide', d => FIPS_TO_ABBR[d.id] !== abbr);

  // Render counties for this state (state FIPS = abbr's FIPS, prefix of county FIPS)
  const stateFips = feature.id;  // e.g. "06" for CA
  const stateCounties = allCountyFeatures.filter(c => c.id.startsWith(stateFips));
  currentCounties = stateCounties;

  countiesG.selectAll('path')
    .data(stateCounties, d => d.id)
    .join('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr('stroke-width', 0.4 / scale)
    .attr('data-fips', d => d.id)
    .on('mouseover', function(event, d) {
      const countyName = d.properties.name;
      tooltip.html(`
        <div class="map-tooltip-name">${countyName}</div>
        <div class="map-tooltip-row"><span>State</span><span>${DOT_DATA[abbr].name}</span></div>
        <div class="map-tooltip-row"><span>FIPS Code</span><span>${d.id}</span></div>
        <div class="map-tooltip-hint">Census TIGER/Line boundary</div>
      `).classed('show', true);
      d3.select(this).classed('highlight', true);
      // Also highlight in the side list
      const row = document.querySelector(`.county-list-row[data-fips="${d.id}"]`);
      if (row) row.classList.add('active');
    })
    .on('mousemove', function(event) {
      const wrap = document.querySelector('.map-wrap').getBoundingClientRect();
      const x = event.clientX - wrap.left + 14;
      const y = event.clientY - wrap.top + 14;
      tooltip.style('left', x + 'px').style('top', y + 'px');
    })
    .on('mouseout', function(event, d) {
      tooltip.classed('show', false);
      d3.select(this).classed('highlight', false);
      const row = document.querySelector(`.county-list-row[data-fips="${d.id}"]`);
      if (row) row.classList.remove('active');
    });

  // Fade in counties after transform begins
  setTimeout(() => {
    countiesG.selectAll('.county').classed('show', true);
  }, 250);

  // County labels (only show if county is big enough)
  countyLabelsG.selectAll('text')
    .data(stateCounties, d => d.id)
    .join('text')
    .attr('class', 'county-label')
    .attr('transform', d => `translate(${path.centroid(d)})`)
    .attr('font-size', 7 / scale)  // Slightly larger base size, scaled down by zoom
    .text(d => {
      // Show label only if county is large enough on screen after zoom
      const bounds = path.bounds(d);
      const widthPx = (bounds[1][0] - bounds[0][0]) * scale;
      const heightPx = (bounds[1][1] - bounds[0][1]) * scale;
      // Min dimensions in screen pixels needed to fit readable text
      if (widthPx < 35 || heightPx < 18) return '';
      const name = d.properties.name;
      // Estimate characters that fit: ~5px per char at 7px font
      const maxChars = Math.floor(widthPx / 5);
      if (name.length > maxChars) {
        return maxChars > 5 ? name.substring(0, maxChars - 1) + '…' : '';
      }
      return name;
    });

  setTimeout(() => {
    countyLabelsG.selectAll('.county-label').classed('show', true);
  }, 600);

  renderDetail();
}

function zoomBack() {
  isZoomed = false;
  zoomBackBtn.classList.remove('show');
  tooltip.classed('show', false);

  // Reset stroke widths and font sizes immediately so they animate back
  statesG.selectAll('.state').attr('stroke-width', 0.8);
  stateLabelsG.selectAll('.state-label').attr('font-size', 8);
  nationBorderG.selectAll('path').attr('stroke-width', 1.2);

  // Reset transform
  layersG.transition()
    .duration(700)
    .attr('transform', 'translate(0,0) scale(1)');

  // Hide counties
  countiesG.selectAll('.county').classed('show', false);
  countyLabelsG.selectAll('.county-label').classed('show', false);
  setTimeout(() => {
    countiesG.selectAll('.county').remove();
    countyLabelsG.selectAll('.county-label').remove();
  }, 400);

  // Restore states
  statesG.selectAll('.state').classed('dimmed', false).classed('selected', false);
  stateLabelsG.selectAll('.state-label').classed('hide', false);

  selectedState = null;
  currentCounties = [];

  // Reset detail panel → CRM home
  if (typeof CRM !== 'undefined') CRM.renderHome();
}

zoomBackBtn.addEventListener('click', zoomBack);

document.querySelectorAll('.map-mode button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.map-mode button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    renderStates();  // Just re-apply colors; don't lose zoom state
  });
});

// ============================================================
// DETAIL PANEL
// ============================================================
function renderDetail() {
  const s = DOT_DATA[selectedState];
  if (!s) return;
  const html = `
    <div class="detail-header">
      <button class="detail-back" onclick="zoomBack()">← back to U.S. overview</button>
      <div class="detail-state-row">
        <div>
          <div class="detail-state-name">${s.name}</div>
          <div class="detail-agency-name">${s.agencyName}</div>
        </div>
        <div class="detail-state-abbr">${s.abbr}</div>
      </div>
      <div class="detail-state-meta">
        <span>Capital · ${s.capital}</span>
        <span>Pop. ${s.population_millions}M</span>
        <span>FY ${s.fiscalYear}</span>
      </div>
      <div class="detail-tabs">
        <button class="detail-tab ${activeTab === 'overview' ? 'active' : ''}" data-tab="overview">Overview</button>
        <button class="detail-tab ${activeTab === 'contacts' ? 'active' : ''}" data-tab="contacts">CRM<span class="detail-tab-count">${(typeof CRM !== 'undefined') ? CRM.countForState(s.abbr) : 0}</span></button>
        <button class="detail-tab ${activeTab === 'budget' ? 'active' : ''}" data-tab="budget">Budget</button>
        <button class="detail-tab ${activeTab === 'counties' ? 'active' : ''}" data-tab="counties">Counties<span class="detail-tab-count">${currentCounties.length}</span></button>
        <button class="detail-tab ${activeTab === 'districts' ? 'active' : ''}" data-tab="districts">Districts<span class="detail-tab-count">${s.districts}</span></button>
        <button class="detail-tab ${activeTab === 'leadership' ? 'active' : ''}" data-tab="leadership">Leadership</button>
        <button class="detail-tab ${activeTab === 'agencies' ? 'active' : ''}" data-tab="agencies">Agencies<span class="detail-tab-count">${s.agencies.length}</span></button>
      </div>
    </div>
    <div class="detail-body" id="detail-body">${renderTabContent(s)}</div>
  `;
  document.getElementById('detail-col').innerHTML = html;
  document.querySelectorAll('.detail-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.detail-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('detail-body').innerHTML = renderTabContent(s);
      wireCountyList();
      if (typeof CRM !== 'undefined') CRM.wire();
    });
  });
  wireCountyList();
  if (typeof CRM !== 'undefined') CRM.wire();
}

function renderTabContent(s) {
  if (activeTab === 'overview') return renderOverview(s);
  if (activeTab === 'contacts') return (typeof CRM !== 'undefined') ? CRM.renderStateContacts(s.abbr) : '';
  if (activeTab === 'budget') return renderBudgetDetail(s);
  if (activeTab === 'counties') return renderCounties(s);
  if (activeTab === 'districts') return renderDistricts(s);
  if (activeTab === 'leadership') return renderLeadership(s);
  if (activeTab === 'agencies') return renderAgencies(s);
  return '';
}

function renderOverview(s) {
  const total = s.totalBudget;
  const growth = s.yoyGrowth.fy24_to_fy25;
  const growthClass = growth > 0 ? 'budget-yoy-up' : (growth < 0 ? 'budget-yoy-down' : 'budget-yoy-flat');
  const growthStr = fmtPct(growth);

  const fs = s.fundingSources;
  const fsTotal = fs.general_fund + fs.federal_funds + fs.other_state_funds + fs.bonds;
  const fundingHtml = ['federal_funds', 'other_state_funds', 'general_fund', 'bonds'].map(k => {
    const v = fs[k];
    const pct = fsTotal > 0 ? (v / fsTotal * 100) : 0;
    return `
      <div class="funding-card" style="--bar-color:${FUNDING_COLORS[k]}">
        <div class="funding-card-label">${FUNDING_LABELS[k]}</div>
        <div class="funding-card-value">${fmtMoney(v)}</div>
        <div class="funding-card-pct">${pct.toFixed(1)}%</div>
      </div>
    `;
  }).join('');

  const maxHist = Math.max(...s.history.map(h => h.total));
  const historyHtml = s.history.map((h, i) => {
    const heightPct = (h.total / maxHist) * 100;
    const isCurrent = i === s.history.length - 1;
    const cls = h.type === 'estimated' ? 'estimated' : (isCurrent ? 'current' : '');
    return `<div class="history-bar-wrapper">
      <div class="history-bar ${cls}" style="height:${heightPct}%"></div>
    </div>`;
  }).join('');
  const historyLabelsHtml = s.history.map(h => {
    const tag = h.type === 'estimated' ? '<span class="estimated-tag">est.</span>' : '';
    return `<div>FY${h.fy} ${tag}<br>${fmtMoney(h.total)}</div>`;
  }).join('');

  return `
    <div class="budget-headline">
      <div class="budget-headline-label">FY2025 Total Transportation Expenditures</div>
      <div class="budget-headline-value">
        ${fmtMoney(total)}
        <span class="budget-yoy-pill ${growthClass}">${growthStr} YoY</span>
      </div>
      <div class="budget-headline-fy">$${(total/s.population_millions).toFixed(0)} PER CAPITA · ${s.pctOfStateBudget.fy2025}% OF STATE BUDGET</div>
      <div class="budget-source">
        <div class="budget-source-label">Source · Verified</div>
        <a href="${s.budgetUrl}" target="_blank" rel="noopener">${s.budgetSource}</a>
      </div>
    </div>

    <div class="section-title">Funding Sources</div>
    <div class="funding-grid">${fundingHtml}</div>

    <div class="section-title">3-Year Trend</div>
    <div class="history-row">${historyHtml}</div>
    <div class="history-labels">${historyLabelsHtml}</div>

    <div class="section-title">Headquarters</div>
    <div class="hq-block">
      <div class="hq-name">${s.agencyName}</div>
      <div class="hq-row"><span>ADDRESS</span><span>${s.headquarters.address}, ${s.headquarters.city}, ${s.headquarters.state} ${s.headquarters.zip}</span></div>
      <div class="hq-row"><span>MAIN</span><a href="tel:${s.headquarters.phone.replace(/[^0-9]/g, '')}">${s.headquarters.phone}</a></div>
      <div class="hq-row"><span>WEB</span><a href="${s.headquarters.website}" target="_blank" rel="noopener">${s.headquarters.website.replace('https://','').replace('http://','')}</a></div>
    </div>
  `;
}

function renderBudgetDetail(s) {
  const bd = s.budgetBreakdown;
  const total = s.totalBudget;
  const entries = Object.entries(bd).filter(([_,v]) => v > 0).sort((a,b) => b[1] - a[1]);
  const barHtml = entries.map(([k, v]) => {
    const pct = (v / total) * 100;
    return `<div style="width:${pct}%; background:${CATEGORY_COLORS[k]}" title="${CATEGORY_LABELS[k]}: ${fmtMoney(v)}"></div>`;
  }).join('');
  const listHtml = entries.map(([k, v]) => {
    const pct = (v / total) * 100;
    return `
      <div class="breakdown-row">
        <div class="breakdown-swatch" style="background:${CATEGORY_COLORS[k]}"></div>
        <div class="breakdown-name">${CATEGORY_LABELS[k]}</div>
        <div class="breakdown-pct">${pct.toFixed(1)}%</div>
        <div class="breakdown-amt">${fmtMoney(v)}</div>
      </div>
    `;
  }).join('');

  return `
    <div class="section-title">Expenditure Categories <span class="section-title-extra">FY2025 estimated</span></div>
    <div class="breakdown-bar">${barHtml}</div>
    <div class="breakdown-list">${listHtml}</div>
    <div style="font-size:10.5px;color:var(--ink-muted);margin-top:8px;line-height:1.5;">
      Category breakdown derived from FHWA SF-21 (FY23) proportions applied to NASBO FY25 total.
    </div>

    <div class="section-title">Year-over-Year Changes</div>
    <div class="stats-grid">
      <div class="stat-tile">
        <div class="stat-tile-label">FY23 → FY24</div>
        <div class="stat-tile-value" style="color:${s.yoyGrowth.fy23_to_fy24 >= 0 ? 'var(--green)' : 'var(--red)'}">
          ${fmtPct(s.yoyGrowth.fy23_to_fy24)}
        </div>
        <div class="stat-tile-sub">${fmtMoney(s.history[0].total)} → ${fmtMoney(s.history[1].total)}</div>
      </div>
      <div class="stat-tile">
        <div class="stat-tile-label">FY24 → FY25</div>
        <div class="stat-tile-value" style="color:${s.yoyGrowth.fy24_to_fy25 >= 0 ? 'var(--green)' : 'var(--red)'}">
          ${fmtPct(s.yoyGrowth.fy24_to_fy25)}
        </div>
        <div class="stat-tile-sub">${fmtMoney(s.history[1].total)} → ${fmtMoney(s.history[2].total)}</div>
      </div>
    </div>

    <div class="section-title">Infrastructure</div>
    <div class="big-number-row">
      <div class="big-number-cell">
        <div class="big-number-value">${(s.stats.publicRoadMiles/1000).toFixed(0)}K</div>
        <div class="big-number-label">Road Miles</div>
      </div>
      <div class="big-number-cell">
        <div class="big-number-value">${fmtNumber(s.stats.bridges)}</div>
        <div class="big-number-label">Bridges</div>
      </div>
      <div class="big-number-cell">
        <div class="big-number-value">${s.stats.bridgesPoorPct}%</div>
        <div class="big-number-label">Poor Cond.</div>
      </div>
    </div>
  `;
}

function renderCounties(s) {
  if (currentCounties.length === 0) {
    return `<div class="notice-block"><div class="notice-block-title">No county data loaded</div>Counties load when a state is zoomed.</div>`;
  }
  // Sort counties by name
  const sorted = [...currentCounties].sort((a, b) => a.properties.name.localeCompare(b.properties.name));
  const rowsHtml = sorted.map(c => `
    <div class="county-list-row" data-fips="${c.id}">
      <div>
        <div class="county-list-name">${c.properties.name}</div>
      </div>
      <div class="county-list-fips">${c.id}</div>
    </div>
  `).join('');

  return `
    <div class="section-title">
      Counties <span class="section-title-extra">${currentCounties.length} jurisdictions · hover map to highlight</span>
    </div>
    <input class="search-bar" id="county-search" placeholder="Search counties…" type="text">
    <div id="county-list">${rowsHtml}</div>
    <div class="notice-block" style="margin-top:14px;">
      <div class="notice-block-title">About this list</div>
      All counties (including parishes in Louisiana and boroughs in Alaska) are loaded from <a href="https://www.census.gov/geographies/mapping-files.html" target="_blank" rel="noopener">Census TIGER/Line</a> shapefiles via the <a href="https://github.com/topojson/us-atlas" target="_blank" rel="noopener">us-atlas</a> project. FIPS codes shown identify each county uniquely. Hover over a row to highlight that county on the map (and vice versa).
    </div>
  `;
}

function renderDistricts(s) {
  // Create a visual grid of district pills
  const pills = [];
  for (let i = 1; i <= s.districts; i++) {
    pills.push(`<div class="district-pill"><span class="district-pill-num">${i}</span>DISTRICT</div>`);
  }
  return `
    <div class="section-title">
      DOT Districts <span class="section-title-extra">${s.districts} engineering districts</span>
    </div>
    <div class="district-grid">${pills.join('')}</div>
    <div class="notice-block">
      <div class="notice-block-title">About district structure</div>
      ${s.name}'s DOT is organized into ${s.districts} engineering districts, each headed by a District Engineer responsible for designing, building, and maintaining transportation infrastructure within its geographic region. District boundaries typically follow county lines (each district encompasses multiple counties).
      <br><br>
      District counts reflect each agency's official organizational structure as of 2025. Specific district boundaries, contact information, and budget allocations are published by ${s.agencyName} on their <a href="${s.headquarters.website}" target="_blank" rel="noopener">official website</a>.
    </div>
  `;
}

function iconMail() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>`;
}
function iconPhone() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
}
function iconLink() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`;
}

function renderLeadership(s) {
  const phoneClean = s.headquarters.phone.replace(/[^0-9]/g, '');
  const cards = s.leadership.map(c => `
    <div class="contact-card">
      <div class="contact-card-name">${c.name}</div>
      <div class="contact-card-title">${c.title} · ${c.agency}</div>
      <div class="contact-card-divider"></div>
      <div class="contact-card-row">${iconPhone()}<a href="tel:${phoneClean}">${s.headquarters.phone}</a> <span style="color:var(--ink-muted);">(main line)</span></div>
      <div class="contact-card-row">${iconLink()}<a href="${s.headquarters.website}" target="_blank" rel="noopener">${s.headquarters.website.replace('https://','')}</a></div>
    </div>
  `).join('');
  return `
    <div class="section-title">Agency Chief <span class="section-title-extra">AASHTO verified</span></div>
    ${cards}
    <div class="hq-block">
      <div class="hq-name">${s.agencyName}</div>
      <div class="hq-row"><span>ADDRESS</span><span>${s.headquarters.address}, ${s.headquarters.city}, ${s.headquarters.state} ${s.headquarters.zip}</span></div>
      <div class="hq-row"><span>MAIN</span><a href="tel:${phoneClean}">${s.headquarters.phone}</a></div>
      <div class="hq-row"><span>WEB</span><a href="${s.headquarters.website}" target="_blank" rel="noopener">${s.headquarters.website}</a></div>
    </div>
  `;
}

function renderAgencies(s) {
  if (!s.agencies || s.agencies.length === 0) {
    return `<div class="notice-block"><div class="notice-block-title">No partner agencies cataloged</div>${s.name} delivers transportation primarily through ${s.agencyName}.</div>`;
  }
  const cards = s.agencies.map(a => {
    const link = a.url ? `<div class="agency-link">${iconLink()}<a href="${a.url}" target="_blank" rel="noopener">${a.url.replace('https://','').replace('http://','')}</a></div>` : '';
    const note = a.note ? `<div class="agency-note">${a.note}</div>` : '';
    return `
      <div class="agency-card">
        <div class="agency-card-name">${a.name}<span class="agency-tag">${a.type}</span></div>
        ${note}
        ${link}
      </div>
    `;
  }).join('');
  return `
    <div class="section-title">Partner Agencies <span class="section-title-extra">${s.agencies.length} verified</span></div>
    ${cards}
  `;
}

function wireCountyList() {
  // Wire up county search
  const search = document.getElementById('county-search');
  if (search) {
    search.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.county-list-row').forEach(row => {
        const name = row.querySelector('.county-list-name').textContent.toLowerCase();
        row.style.display = name.includes(q) ? 'grid' : 'none';
      });
    });
  }
  // Wire up county row hover -> map highlight
  document.querySelectorAll('.county-list-row').forEach(row => {
    row.addEventListener('mouseenter', () => {
      const fips = row.dataset.fips;
      countiesG.selectAll(`path[data-fips="${fips}"]`).classed('highlight', true);
    });
    row.addEventListener('mouseleave', () => {
      const fips = row.dataset.fips;
      countiesG.selectAll(`path[data-fips="${fips}"]`).classed('highlight', false);
    });
    row.addEventListener('click', () => {
      const fips = row.dataset.fips;
      const county = currentCounties.find(c => c.id === fips);
      if (county) {
        const name = county.properties.name;
        tooltip.html(`
          <div class="map-tooltip-name">${name}</div>
          <div class="map-tooltip-row"><span>FIPS Code</span><span>${fips}</span></div>
        `).classed('show', true);
        const [[x0, y0], [x1, y1]] = path.bounds(county);
        const wrap = document.querySelector('.map-wrap').getBoundingClientRect();
        // Position tooltip in upper-right of map
        tooltip.style('left', (wrap.width - 240) + 'px').style('top', '20px');
        setTimeout(() => tooltip.classed('show', false), 1500);
      }
    });
  });
}

window.zoomBack = zoomBack;

function renderNational() {
  const n = computeNational();
  document.getElementById('hdr-total').textContent = fmtMoney(n.total);
  const growth = ((n.total - n.totalFy23) / n.totalFy23 * 100);
  const hdrGrowth = document.getElementById('hdr-growth');
  if (hdrGrowth) hdrGrowth.textContent = fmtPct(growth);

  // Map summary
  const fundingTotal = n.funding.federal_funds + n.funding.other_state_funds + n.funding.general_fund + n.funding.bonds;
  document.getElementById('sum-label-1').textContent = 'Federal Funds';
  document.getElementById('sum-val-1').textContent = fmtMoney(n.funding.federal_funds);
  document.getElementById('sum-label-2').textContent = 'Other State Funds';
  document.getElementById('sum-val-2').textContent = fmtMoney(n.funding.other_state_funds);
  document.getElementById('sum-label-3').textContent = 'General Fund';
  document.getElementById('sum-val-3').textContent = fmtMoney(n.funding.general_fund);
  document.getElementById('sum-label-4').textContent = 'Bonds';
  document.getElementById('sum-val-4').textContent = fmtMoney(n.funding.bonds);
}

// INIT
initSvg();
renderStates();
renderNational();

  // ===== CRM module (originally the second <script>) =====
const CRM_STORAGE_KEY = 'dotAtlasCRM.v1';
const STAGES = ['New', 'Contacted', 'Engaged', 'Champion', 'Dormant'];
const STAGE_COLORS = { New:'#6b7494', Contacted:'#6da3d9', Engaged:'#f4b942', Champion:'#5fb78a', Dormant:'#e07560' };
const CATEGORIES = ['State DOT Leadership','State DOT Staff','District Engineer','County / Local Official','Elected Official','MPO / Transit Agency','Contractor','Consultant / Engineering Firm','Industry Association','Media / Analyst','Other'];

const CRM = (() => {
  let contacts = [];
  let filters = { stage: '', category: '', state: '', q: '' };
  let editingId = null;
  let storageOk = true;

  // ---------- persistence ----------
  function load() {
    let stored = null;
    try {
      stored = localStorage.getItem(CRM_STORAGE_KEY);
    } catch (e) { storageOk = false; }
    if (stored) {
      try { contacts = JSON.parse(stored); } catch (e) { contacts = []; }
    }
    const existingIds = new Set(contacts.map(c => c.id));
    for (const seed of SEED_CONTACTS) {
      if (!existingIds.has(seed.id)) contacts.push(JSON.parse(JSON.stringify(seed)));
    }
    save();
  }

  function save() {
    if (storageOk) {
      try { localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(contacts)); }
      catch (e) { storageOk = false; }
    }
    updateHeaderStats();
  }

  // ---------- helpers ----------
  function uid() { return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7); }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function esc(s) { return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function countForState(abbr) {
    return contacts.filter(c => c.state === abbr).length;
  }

  function followupsDue() {
    const t = todayStr();
    return contacts.filter(c => c.nextActionDate && c.nextActionDate <= t);
  }

  function filtered() {
    return contacts.filter(c => {
      if (filters.stage && c.stage !== filters.stage) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.state && c.state !== filters.state) return false;
      if (filters.q) {
        const q = filters.q.toLowerCase();
        const hay = [c.name, c.title, c.org, c.notes, (c.tags||[]).join(' ')].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const t = todayStr();
      const aDue = a.nextActionDate && a.nextActionDate <= t ? 0 : 1;
      const bDue = b.nextActionDate && b.nextActionDate <= t ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      const inf = { High: 0, Medium: 1, Low: 2 };
      if (inf[a.influence] !== inf[b.influence]) return inf[a.influence] - inf[b.influence];
      return a.name.localeCompare(b.name);
    });
  }

  function updateHeaderStats() {
    const el1 = document.getElementById('hdr-contacts');
    const el2 = document.getElementById('hdr-champions');
    const el3 = document.getElementById('hdr-followups');
    if (el1) el1.textContent = contacts.length;
    if (el2) el2.textContent = contacts.filter(c => c.stage === 'Champion').length;
    if (el3) el3.textContent = followupsDue().length;
  }

  // ---------- rendering ----------
  function contactRowHtml(c) {
    const t = todayStr();
    let followup = '';
    if (c.nextActionDate) {
      const overdue = c.nextActionDate <= t;
      followup = `<span class="${overdue ? 'followup-due' : 'followup-upcoming'}">${overdue ? '⚠ ' : ''}${esc(c.nextActionDate)}</span>`;
    }
    return `
      <div class="contact-row" data-contact-id="${esc(c.id)}">
        <div>
          <div class="contact-row-name"><span class="influence-dot influence-${esc(c.influence)}"></span>${esc(c.name)}</div>
          <div class="contact-row-sub">${esc(c.title)}${c.title && c.org ? ' · ' : ''}${esc(c.org)}</div>
        </div>
        <div class="contact-row-meta">
          <div style="display:flex;gap:5px;align-items:center;">
            <span class="state-badge">${esc(c.state)}</span>
            <span class="stage-pill stage-${esc(c.stage)}">${esc(c.stage)}</span>
          </div>
          ${followup}
        </div>
      </div>
    `;
  }

  function pipelineChipsHtml(list, activeStage) {
    return `<div class="pipeline-chips">` + STAGES.map(st => {
      const n = list.filter(c => c.stage === st).length;
      return `<div class="pipeline-chip ${activeStage === st ? 'active' : ''}" data-stage-filter="${st}" style="--stage-color:${STAGE_COLORS[st]}">
        <div class="pipeline-chip-count">${n}</div>
        <div class="pipeline-chip-label">${st}</div>
      </div>`;
    }).join('') + `</div>`;
  }

  function filtersHtml(showState) {
    const stateOpts = ['<option value="">All States</option>'].concat(
      Object.keys(DOT_DATA).sort().map(a => `<option value="${a}" ${filters.state === a ? 'selected' : ''}>${a}</option>`)
    ).join('');
    const catOpts = ['<option value="">All Categories</option>'].concat(
      CATEGORIES.map(c => `<option ${filters.category === c ? 'selected' : ''}>${c}</option>`)
    ).join('');
    return `
      <div class="crm-filters">
        ${showState ? `<select id="crm-filter-state">${stateOpts}</select>` : ''}
        <select id="crm-filter-category">${catOpts}</select>
      </div>
    `;
  }

  function toolbarHtml(stateAbbr) {
    return `
      <div class="crm-toolbar">
        <button class="crm-btn primary" id="crm-add-btn" data-state="${stateAbbr || ''}">+ Add Contact</button>
        <button class="crm-btn" id="crm-export-csv">Export CSV</button>
        <button class="crm-btn" id="crm-backup">Backup JSON</button>
        <button class="crm-btn" id="crm-restore">Restore</button>
        <button class="crm-btn" id="crm-dashboard">DashBoard</button>
        <input type="file" id="crm-restore-file" accept=".json" style="display:none;">
      </div>
    `;
  }

  function renderHome() {
    const due = followupsDue();
    const list = filtered();
    const html = `
      <div class="detail-header">
        <div class="detail-state-row">
          <div>
            <div class="detail-state-name">Territory CRM</div>
            <div class="detail-agency-name">Industry contacts &amp; audience across all 50 territories</div>
          </div>
        </div>
      </div>
      <div class="detail-body">
        ${toolbarHtml('')}
        <div class="section-title">Pipeline <span class="section-title-extra">${contacts.length} total contacts · click a stage to filter</span></div>
        ${pipelineChipsHtml(contacts, filters.stage)}
        ${due.length ? `
          <div class="section-title">Follow-ups Due <span class="section-title-extra" style="color:var(--red);">${due.length} overdue or due today</span></div>
          <div>${due.slice(0, 5).map(contactRowHtml).join('')}</div>
        ` : ''}
        <div class="section-title">All Contacts <span class="section-title-extra">${list.length} shown</span></div>
        <input class="search-bar" id="crm-search" placeholder="Search name, org, tags, notes…" value="${esc(filters.q)}">
        ${filtersHtml(true)}
        <div id="crm-contact-list">
          ${list.length ? list.map(contactRowHtml).join('') : '<div class="crm-empty">No contacts match. Adjust filters or add one.</div>'}
        </div>
        ${storageOk ? '' : `<div class="notice-block" style="margin-top:14px;"><div class="notice-block-title">Storage unavailable</div>Your browser blocked localStorage for this file. Contacts will not persist between sessions — use Backup JSON before closing, and Restore next time.</div>`}
        <div class="notice-block" style="margin-top:14px;">
          <div class="notice-block-title">How data is stored</div>
          Contacts live in your browser&#39;s local storage on this machine — nothing is uploaded anywhere. Use <b>Backup JSON</b> regularly to save a portable copy, and <b>Restore</b> to load it on another machine. <b>Export CSV</b> produces a spreadsheet-friendly file. Seed contacts (the 50 verified AASHTO DOT chiefs) are maintained in the backend&#39;s <code>contacts.csv</code>.
        </div>
      </div>
    `;
    document.getElementById('detail-col').innerHTML = html;
    wire();
  }

  function renderStateContacts(abbr) {
    const list = contacts.filter(c => c.state === abbr).sort((a, b) => {
      const inf = { High: 0, Medium: 1, Low: 2 };
      return (inf[a.influence] - inf[b.influence]) || a.name.localeCompare(b.name);
    });
    const s = DOT_DATA[abbr];
    return `
      ${toolbarHtml(abbr)}
      <div class="section-title">Pipeline in ${esc(s.name)} <span class="section-title-extra">${list.length} contacts</span></div>
      ${pipelineChipsHtml(list, '')}
      <div class="section-title">Contacts</div>
      <input class="search-bar" id="crm-search" placeholder="Search within ${esc(s.name)}…">
      <div id="crm-contact-list" data-scope="${abbr}">
        ${list.length ? list.map(contactRowHtml).join('') : '<div class="crm-empty">No contacts in this territory yet. Add the first one.</div>'}
      </div>
      <div class="notice-block" style="margin-top:14px;">
        <div class="notice-block-title">Territory context</div>
        ${esc(s.name)} — FY2025 budget ${ (s.totalBudget >= 1000) ? '$' + (s.totalBudget/1000).toFixed(2) + 'B' : '$' + s.totalBudget + 'M' }, ${s.districts} DOT districts, ${s.counties} counties. Verified agency chief: <b>${esc(s.leadership[0]?.name || '—')}</b> (${esc(s.leadership[0]?.title || '')}). Main line ${esc(s.headquarters.phone)}.
      </div>
    `;
  }

  // ---------- modal ----------
  function openModal(contactId, prefillState) {
    editingId = contactId || null;
    const overlay = document.getElementById('contact-modal-overlay');
    const title = document.getElementById('modal-title');
    const delBtn = document.getElementById('modal-delete');
    const intSection = document.getElementById('interaction-log-section');

    const stateSel = document.getElementById('cf-state');
    stateSel.innerHTML = Object.keys(DOT_DATA).sort().map(a =>
      `<option value="${a}">${a} — ${DOT_DATA[a].name}</option>`).join('');

    if (editingId) {
      const c = contacts.find(x => x.id === editingId);
      if (!c) return;
      title.textContent = 'Edit Contact';
      delBtn.style.display = 'inline-block';
      intSection.style.display = 'block';
      document.getElementById('cf-name').value = c.name || '';
      document.getElementById('cf-title').value = c.title || '';
      document.getElementById('cf-org').value = c.org || '';
      stateSel.value = c.state || 'AL';
      document.getElementById('cf-category').value = c.category || 'Other';
      document.getElementById('cf-influence').value = c.influence || 'Medium';
      document.getElementById('cf-stage').value = c.stage || 'New';
      document.getElementById('cf-email').value = c.email || '';
      document.getElementById('cf-phone').value = c.phone || '';
      document.getElementById('cf-tags').value = (c.tags || []).join('; ');
      document.getElementById('cf-notes').value = c.notes || '';
      document.getElementById('cf-next-action').value = c.nextAction || '';
      document.getElementById('cf-next-action-date').value = c.nextActionDate || '';
      renderInteractions(c);
    } else {
      title.textContent = 'New Contact';
      delBtn.style.display = 'none';
      intSection.style.display = 'none';
      ['cf-name','cf-title','cf-org','cf-email','cf-phone','cf-tags','cf-notes','cf-next-action','cf-next-action-date'].forEach(id => {
        document.getElementById(id).value = '';
      });
      document.getElementById('cf-category').value = 'Other';
      document.getElementById('cf-influence').value = 'Medium';
      document.getElementById('cf-stage').value = 'New';
      if (prefillState && DOT_DATA[prefillState]) stateSel.value = prefillState;
    }
    overlay.classList.add('show');
    document.getElementById('cf-name').focus();
  }

  function renderInteractions(c) {
    const list = document.getElementById('interaction-list');
    const items = (c.interactions || []).slice().reverse();
    list.innerHTML = items.length ? items.map(i => `
      <div class="interaction-item">
        <span class="interaction-date">${esc(i.date)}</span>
        <span class="interaction-type">${esc(i.type)}</span>
        <span class="interaction-note">${esc(i.note)}</span>
      </div>
    `).join('') : '<div class="crm-empty" style="padding:10px 0;">No interactions logged yet.</div>';
  }

  function closeModal() {
    document.getElementById('contact-modal-overlay').classList.remove('show');
    editingId = null;
  }

  function saveFromModal() {
    const name = document.getElementById('cf-name').value.trim();
    if (!name) { document.getElementById('cf-name').focus(); return; }
    const data = {
      name,
      title: document.getElementById('cf-title').value.trim(),
      org: document.getElementById('cf-org').value.trim(),
      state: document.getElementById('cf-state').value,
      category: document.getElementById('cf-category').value,
      influence: document.getElementById('cf-influence').value,
      stage: document.getElementById('cf-stage').value,
      email: document.getElementById('cf-email').value.trim(),
      phone: document.getElementById('cf-phone').value.trim(),
      tags: document.getElementById('cf-tags').value.split(';').map(t => t.trim()).filter(Boolean),
      notes: document.getElementById('cf-notes').value.trim(),
      nextAction: document.getElementById('cf-next-action').value.trim(),
      nextActionDate: document.getElementById('cf-next-action-date').value,
    };
    if (editingId) {
      const c = contacts.find(x => x.id === editingId);
      Object.assign(c, data, { updatedAt: todayStr() });
    } else {
      contacts.push(Object.assign({ id: uid(), interactions: [], createdAt: todayStr() }, data));
    }
    save();
    closeModal();
    refreshCurrentView();
  }

  function deleteFromModal() {
    if (!editingId) return;
    const c = contacts.find(x => x.id === editingId);
    if (!confirm(`Delete contact "${c?.name}"? This cannot be undone.`)) return;
    contacts = contacts.filter(x => x.id !== editingId);
    save();
    closeModal();
    refreshCurrentView();
  }

  function logInteraction() {
    if (!editingId) return;
    const note = document.getElementById('int-note').value.trim();
    if (!note) return;
    const c = contacts.find(x => x.id === editingId);
    if (!c.interactions) c.interactions = [];
    c.interactions.push({
      date: todayStr(),
      type: document.getElementById('int-type').value,
      note,
    });
    document.getElementById('int-note').value = '';
    save();
    renderInteractions(c);
  }

  // ---------- export / import ----------
  function download(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function exportCsv() {
    const cols = ['id','state','name','title','org','category','influence','stage','email','phone','tags','notes','nextAction','nextActionDate','lastInteraction'];
    const escCsv = v => {
      v = String(v ?? '');
      return (v.includes(',') || v.includes('"') || v.includes('\n')) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    const rows = [cols.join(',')];
    for (const c of contacts) {
      const last = (c.interactions && c.interactions.length) ? c.interactions[c.interactions.length-1].date : '';
      rows.push(cols.map(k => {
        if (k === 'tags') return escCsv((c.tags||[]).join('; '));
        if (k === 'lastInteraction') return escCsv(last);
        return escCsv(c[k]);
      }).join(','));
    }
    download('dot_crm_contacts_' + todayStr() + '.csv', rows.join('\n'), 'text/csv');
  }

  function backupJson() {
    download('dot_crm_backup_' + todayStr() + '.json', JSON.stringify(contacts, null, 2), 'application/json');
  }

  function restoreJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('Expected an array of contacts');
        const byId = new Map(contacts.map(c => [c.id, c]));
        let added = 0, updated = 0;
        for (const c of imported) {
          if (!c.id || !c.name) continue;
          if (byId.has(c.id)) { Object.assign(byId.get(c.id), c); updated++; }
          else { contacts.push(c); added++; }
        }
        save();
        refreshCurrentView();
        alert(`Restore complete: ${added} added, ${updated} updated.`);
      } catch (e) {
        alert('Could not restore: ' + e.message);
      }
    };
    reader.readAsText(file);
  }

  // ---------- view refresh & wiring ----------
  function refreshCurrentView() {
    if (selectedState) {
      renderDetail();
    } else {
      renderHome();
    }
    if (currentMode === 'coverage') renderStates();
  }

  function wire() {
    document.querySelectorAll('.contact-row').forEach(row => {
      row.addEventListener('click', () => openModal(row.dataset.contactId));
    });
    const addBtn = document.getElementById('crm-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => openModal(null, addBtn.dataset.state || selectedState || ''));
    const exportBtn = document.getElementById('crm-export-csv');
    if (exportBtn) exportBtn.addEventListener('click', exportCsv);
    const backupBtn = document.getElementById('crm-backup');
    if (backupBtn) backupBtn.addEventListener('click', backupJson);
    const restoreBtn = document.getElementById('crm-restore');
     const restoreDash = document.getElementById('crm-dashboard');
    const restoreFile = document.getElementById('crm-restore-file');
    if(restoreDash){
      //
      restoreDash.addEventListener("click", () => {
    window.location.href = "http://localhost:3000/dashboard"; // Your Next.js app
});
    }
    if (restoreBtn && restoreFile) {
      restoreBtn.addEventListener('click', () => restoreFile.click());
      restoreFile.addEventListener('change', e => {
        if (e.target.files[0]) restoreJson(e.target.files[0]);
        e.target.value = '';
      });
    }
    const search = document.getElementById('crm-search');
    if (search) {
      search.addEventListener('input', e => {
        const scope = document.getElementById('crm-contact-list')?.dataset.scope;
        if (scope) {
          const q = e.target.value.toLowerCase();
          document.querySelectorAll('#crm-contact-list .contact-row').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(q) ? 'grid' : 'none';
          });
        } else {
          filters.q = e.target.value;
          const list = filtered();
          document.getElementById('crm-contact-list').innerHTML =
            list.length ? list.map(contactRowHtml).join('') : '<div class="crm-empty">No contacts match.</div>';
          document.querySelectorAll('#crm-contact-list .contact-row').forEach(row => {
            row.addEventListener('click', () => openModal(row.dataset.contactId));
          });
        }
      });
    }
    const fState = document.getElementById('crm-filter-state');
    if (fState) fState.addEventListener('change', e => { filters.state = e.target.value; renderHome(); });
    const fCat = document.getElementById('crm-filter-category');
    if (fCat) fCat.addEventListener('change', e => { filters.category = e.target.value; renderHome(); });
    document.querySelectorAll('.pipeline-chip[data-stage-filter]').forEach(chip => {
      chip.addEventListener('click', () => {
        if (selectedState) return;
        const st = chip.dataset.stageFilter;
        filters.stage = (filters.stage === st) ? '' : st;
        renderHome();
      });
    });
  }

  function wireModal() {
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-cancel').addEventListener('click', closeModal);
    document.getElementById('modal-save').addEventListener('click', saveFromModal);
    document.getElementById('modal-delete').addEventListener('click', deleteFromModal);
    document.getElementById('int-add-btn').addEventListener('click', logInteraction);
    document.getElementById('int-note').addEventListener('keydown', e => { if (e.key === 'Enter') logInteraction(); });
    document.getElementById('contact-modal-overlay').addEventListener('click', e => {
      if (e.target.id === 'contact-modal-overlay') closeModal();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  load();
  wireModal();

  return { countForState, renderHome, renderStateContacts, wire };
})();

// Boot the CRM home view
CRM.renderHome();
}
