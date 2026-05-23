const DATA_URL = "synthetic_swfl_commercial_roofing_projects.csv";

const palette = {
  navy: "#17324d",
  blue: "#2563eb",
  teal: "#0f766e",
  green: "#15803d",
  gold: "#b45309",
  red: "#b91c1c",
  gray: "#64748b",
  light: "#dbe3ee",
};

const projectColors = {
  "Full Replacement": "#2563eb",
  "New Installation": "#0f766e",
  Repair: "#b45309",
  "Coating / Restoration": "#15803d",
  "Storm Damage Replacement": "#b91c1c",
};

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactDollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function realizedRevenue(row) {
  return toNumber(row.contract_value) + toNumber(row.change_order_amount);
}

function parseRows(rows) {
  return rows
    .filter((row) => row.project_id)
    .map((row) => ({
      ...row,
      year: toNumber(row.year),
      contract_value: toNumber(row.contract_value),
      change_order_amount: toNumber(row.change_order_amount),
      gross_profit: toNumber(row.gross_profit),
      profit_margin_pct: toNumber(row.profit_margin_pct),
      roof_size_sqft: toNumber(row.roof_size_sqft),
      delay_days: toNumber(row.delay_days),
      actual_duration_days: toNumber(row.actual_duration_days),
      hurricane_related_flag: row.hurricane_related_flag === "True",
    }));
}

function sum(rows, accessor) {
  return rows.reduce((total, row) => total + accessor(row), 0);
}

function mean(rows, accessor) {
  return rows.length ? sum(rows, accessor) / rows.length : 0;
}

function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function groupBy(rows, key) {
  return rows.reduce((groups, row) => {
    const value = row[key] || "Unknown";
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(row);
    return groups;
  }, new Map());
}

function groupedSummary(rows, key) {
  return Array.from(groupBy(rows, key), ([label, items]) => ({
    label,
    projects: items.length,
    revenue: sum(items, realizedRevenue),
    profit: sum(items, (row) => row.gross_profit),
    margin: mean(items, (row) => row.profit_margin_pct),
    delay: mean(items, (row) => row.delay_days),
  }));
}

function renderKpis(rows) {
  const revenue = sum(rows, realizedRevenue);
  const profit = sum(rows, (row) => row.gross_profit);
  const avgMargin = mean(rows, (row) => row.profit_margin_pct);
  const medianContract = median(rows.map((row) => row.contract_value));
  const avgDuration = mean(rows, (row) => row.actual_duration_days);

  const kpis = [
    ["Projects", rows.length.toLocaleString(), "Completed jobs"],
    ["Realized Revenue", compactDollars.format(revenue), "Contract plus change orders"],
    ["Gross Profit", compactDollars.format(profit), "Before overhead allocation"],
    ["Average Margin", percent.format(avgMargin), "Portfolio average"],
    ["Median Job", compactDollars.format(medianContract), `${avgDuration.toFixed(1)} avg. duration days`],
  ];

  document.getElementById("kpiGrid").innerHTML = kpis
    .map(
      ([label, value, subtitle]) => `
        <div class="kpi-card">
          <div class="kpi-label">${label}</div>
          <div class="kpi-value">${value}</div>
          <div class="kpi-subtitle">${subtitle}</div>
        </div>
      `,
    )
    .join("");
}

function baseOptions(extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700 },
    plugins: {
      legend: { labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        backgroundColor: "#0f172a",
        titleFont: { weight: "700" },
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#475569" },
      },
      y: {
        grid: { color: "#e2e8f0" },
        ticks: { color: "#475569" },
      },
    },
    ...extra,
  };
}

function chart(id, config) {
  const ctx = document.getElementById(id);
  return new Chart(ctx, config);
}

function renderAnnualChart(rows) {
  const summary = groupedSummary(rows, "year").sort((a, b) => a.label - b.label);
  chart("annualChart", {
    type: "line",
    data: {
      labels: summary.map((item) => item.label),
      datasets: [
        {
          label: "Realized revenue",
          data: summary.map((item) => item.revenue),
          borderColor: palette.blue,
          backgroundColor: "rgba(37, 99, 235, 0.12)",
          tension: 0.28,
          fill: true,
          pointRadius: 4,
        },
        {
          label: "Gross profit",
          data: summary.map((item) => item.profit),
          borderColor: palette.green,
          backgroundColor: "rgba(21, 128, 61, 0.10)",
          tension: 0.28,
          fill: true,
          pointRadius: 4,
        },
      ],
    },
    options: baseOptions({
      scales: {
        x: { grid: { display: false }, ticks: { color: "#475569" } },
        y: {
          grid: { color: "#e2e8f0" },
          ticks: { callback: (value) => compactDollars.format(value), color: "#475569" },
        },
      },
    }),
  });
}

function renderScatterChart(rows) {
  const byType = groupedSummary(rows, "project_type").map((item) => item.label);
  chart("scatterChart", {
    type: "scatter",
    data: {
      datasets: byType.map((type) => ({
        label: type,
        data: rows
          .filter((row) => row.project_type === type)
          .map((row) => ({
            x: realizedRevenue(row),
            y: row.profit_margin_pct,
            r: Math.max(4, Math.min(16, Math.sqrt(row.roof_size_sqft) / 38)),
          })),
        backgroundColor: projectColors[type] || palette.gray,
        borderColor: "rgba(255,255,255,0.8)",
        pointRadius: (context) => context.raw.r,
        pointHoverRadius: (context) => context.raw.r + 2,
      })),
    },
    options: baseOptions({
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.dataset.label}: ${compactDollars.format(context.raw.x)}, ${percent.format(context.raw.y)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { callback: (value) => compactDollars.format(value), color: "#475569" },
          title: { display: true, text: "Realized revenue" },
        },
        y: {
          grid: { color: "#e2e8f0" },
          ticks: { callback: (value) => percent.format(value), color: "#475569" },
          title: { display: true, text: "Gross margin" },
        },
      },
    }),
  });
}

function renderDelayChart(rows) {
  chart("delayChart", {
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Projects",
          data: rows.map((row) => ({ x: row.delay_days, y: row.profit_margin_pct })),
          backgroundColor: "rgba(37, 99, 235, 0.55)",
          pointRadius: 4,
        },
      ],
    },
    options: baseOptions({
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${context.raw.x} delay days, ${percent.format(context.raw.y)} margin`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#475569" },
          title: { display: true, text: "Delay days versus estimate" },
        },
        y: {
          grid: { color: "#e2e8f0" },
          ticks: { callback: (value) => percent.format(value), color: "#475569" },
          title: { display: true, text: "Gross margin" },
        },
      },
    }),
  });
}

function renderHurricaneChart(rows) {
  const summary = [
    {
      label: "Non-hurricane",
      items: rows.filter((row) => !row.hurricane_related_flag),
    },
    {
      label: "Hurricane-related",
      items: rows.filter((row) => row.hurricane_related_flag),
    },
  ].map((group) => ({
    label: group.label,
    margin: mean(group.items, (row) => row.profit_margin_pct),
    delay: mean(group.items, (row) => row.delay_days),
  }));

  chart("hurricaneChart", {
    type: "bar",
    data: {
      labels: summary.map((item) => item.label),
      datasets: [
        {
          label: "Average margin",
          data: summary.map((item) => item.margin),
          backgroundColor: [palette.gray, palette.gold],
          yAxisID: "y",
        },
        {
          label: "Average delay days",
          data: summary.map((item) => item.delay),
          backgroundColor: ["rgba(100,116,139,0.35)", "rgba(180,83,9,0.35)"],
          yAxisID: "y1",
        },
      ],
    },
    options: baseOptions({
      scales: {
        x: { grid: { display: false }, ticks: { color: "#475569" } },
        y: {
          position: "left",
          grid: { color: "#e2e8f0" },
          ticks: { callback: (value) => percent.format(value), color: "#475569" },
        },
        y1: {
          position: "right",
          grid: { display: false },
          ticks: { color: "#475569" },
        },
      },
    }),
  });
}

function renderHorizontalBar(id, rows, key, limit = 10) {
  const summary = groupedSummary(rows, key)
    .sort((a, b) => a.margin - b.margin)
    .slice(-limit);

  chart(id, {
    type: "bar",
    data: {
      labels: summary.map((item) => item.label),
      datasets: [
        {
          label: "Average margin",
          data: summary.map((item) => item.margin),
          backgroundColor: summary.map((item) => (item.margin >= mean(rows, (row) => row.profit_margin_pct) ? palette.green : palette.gray)),
          borderRadius: 5,
        },
      ],
    },
    options: baseOptions({
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => `${percent.format(context.raw)} average margin`,
          },
        },
      },
      scales: {
        x: {
          grid: { color: "#e2e8f0" },
          ticks: { callback: (value) => percent.format(value), color: "#475569" },
        },
        y: { grid: { display: false }, ticks: { color: "#475569" } },
      },
    }),
  });
}

function renderReviewTable(rows) {
  const tableRows = [...rows]
    .sort((a, b) => a.profit_margin_pct - b.profit_margin_pct)
    .slice(0, 8);

  document.getElementById("reviewTable").innerHTML = tableRows
    .map(
      (row) => `
        <tr>
          <td>${row.project_id}</td>
          <td>${row.town}</td>
          <td>${row.project_type}</td>
          <td>${row.roof_type}</td>
          <td class="numeric">${dollars.format(realizedRevenue(row))}</td>
          <td class="numeric margin-bad">${percent.format(row.profit_margin_pct)}</td>
          <td class="numeric">${row.delay_days} days</td>
        </tr>
      `,
    )
    .join("");
}

function renderDashboard(rows) {
  renderKpis(rows);
  renderAnnualChart(rows);
  renderScatterChart(rows);
  renderDelayChart(rows);
  renderHurricaneChart(rows);
  renderHorizontalBar("projectTypeChart", rows, "project_type", 10);
  renderHorizontalBar("leadSourceChart", rows, "lead_source", 10);
  renderHorizontalBar("townChart", rows, "town", 10);
  renderReviewTable(rows);
}

function showLoadError(error) {
  document.getElementById("kpiGrid").innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Data load error</div>
      <div class="kpi-subtitle">
        The dashboard could not load ${DATA_URL}. Open this page through GitHub Pages
        or a local web server, not directly from the file system.
      </div>
    </div>
  `;
  console.error(error);
}

window.addEventListener("DOMContentLoaded", () => {
  Papa.parse(DATA_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (result) => renderDashboard(parseRows(result.data)),
    error: showLoadError,
  });
});
