let lastScroll = 0;
const nav = document.getElementById("navbar");
let orientationFactor = 1;

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  nav.classList.toggle("hidden", currentScroll > lastScroll);
  lastScroll = currentScroll;
});

// Nav smooth scroll and focus for orientation & savings
document.getElementById('nav-orientation-btn').addEventListener('click', function(e) {
  e.preventDefault();
  const el = document.getElementById('orientation');
  el.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(() => { document.getElementById('addressInput').focus(); }, 500);
});
document.getElementById('nav-savings-btn').addEventListener('click', function(e) {
  e.preventDefault();
  const el = document.getElementById('calculator');
  el.scrollIntoView({behavior:'smooth', block:'center'});
  setTimeout(() => { document.getElementById('rate').focus(); }, 500);
});

// Orientation section logic (Street View only)
let autocomplete, lastPlaceLocation = null, panoMap = null;

function mapsApiLoaded() {
  if (typeof initMap === "function") initMap();
  if (typeof initQuoteAddressAutocomplete === "function") initQuoteAddressAutocomplete();
}

function initMap() {
  const input = document.getElementById("addressInput");
  autocomplete = new google.maps.places.Autocomplete(input, {
    componentRestrictions: { country: 'uk' },
    fields: ["geometry", "formatted_address", "address_components"],
    types: ["address"]
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert("No details available for input: '" + place.name + "'");
      lastPlaceLocation = null;
      return;
    }
    lastPlaceLocation = place.geometry.location;
    // Orientation logic
    const viewport = place.geometry.viewport;
    let orientation = "Unknown";
    let explanation = "";
    orientationFactor = 0.9;

    if (viewport) {
      const ne = viewport.getNorthEast();
      const sw = viewport.getSouthWest();
      const angle = Math.atan2(ne.lat() - sw.lat(), ne.lng() - sw.lng()) * (180 / Math.PI);

      if (angle > -45 && angle <= 45) {
        orientation = "East";
        orientationFactor = 0.85;
        explanation = "Your front roof likely faces East and the rear West. A solar system can still work well with morning sunlight.";
      } else if (angle > 45 && angle <= 135) {
        orientation = "North";
        orientationFactor = 0.75;
        explanation = "Your front roof likely faces North and the rear South. South-facing roofs are ideal for solar.";
      } else if (angle > -135 && angle <= -45) {
        orientation = "South";
        orientationFactor = 1.0;
        explanation = "Your front roof likely faces South and the rear North. This is excellent for solar efficiency.";
      } else {
        orientation = "West";
        orientationFactor = 0.8;
        explanation = "Your front roof likely faces West and the rear East. Good for catching late afternoon sunlight.";
      }
    }

    document.getElementById("orientationResult").innerHTML =
      `<strong>Estimated Roof Orientation:</strong> ${orientation}<br><em>${explanation}</em>`;
  });
}

function initQuoteAddressAutocomplete() {
  var input = document.getElementById('quote-address');
  if (!input) return;
  var options = {
    componentRestrictions: { country: 'uk' },
    fields: ["formatted_address", "geometry"],
    types: ["address"]
  };
  var autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.setBounds(new google.maps.LatLngBounds(
    new google.maps.LatLng(49.9, -7.6),
    new google.maps.LatLng(58.7, 1.8)
  ));
}

function toggleStreetView() {
  const container = document.getElementById("streetview-container");
  const btn = document.getElementById("toggleMapBtn");
  if (container.style.display === 'none' || container.style.display === '') {
    if (!lastPlaceLocation) {
      alert("Please enter your address and select it from the dropdown first.");
      return;
    }
    container.style.display = "block";
    if (!panoMap) {
      panoMap = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
          position: lastPlaceLocation,
          pov: { heading: 165, pitch: 0 },
          zoom: 1
        }
      );
    } else {
      panoMap.setPosition(lastPlaceLocation);
    }
    btn.innerText = "Hide Street View";
  } else {
    container.style.display = "none";
    btn.innerText = "Show Street View";
  }
}

// --- SOLAR CALCULATOR (UPDATED) ---
let latestSavingsPerYear = 0;
let latestAnnualSpend = 0;
let latestSystemCost = 9500;

// Only keep cost input in finance offset section
function syncSystemCostFields(value) {
  document.getElementById('finance-system-cost').value = value;
}

document.addEventListener('DOMContentLoaded', function() {
  syncSystemCostFields('9500');
});

document.getElementById("calcForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const rate = parseFloat(document.getElementById("rate").value);
  const standing = parseFloat(document.getElementById("standing").value);
  const usage = parseFloat(document.getElementById("usage").value);
  const batterySize = parseInt(document.getElementById("battery-size").value, 10); // 0, 5, 10
  const homeAllDay = document.getElementById("homeDay").checked;

  // Solar generation constants
  const systemSizeKW = 3.68;
  const panelSystemKW = 9 * 0.46;
  const kwhPerKWp = 1050;
  const estimatedAnnualGen = Math.min(systemSizeKW, panelSystemKW) * kwhPerKWp * orientationFactor;

  // Self-consumption ratios
  let baseSelfConsumption = homeAllDay ? 0.65 : 0.4;
  let batterySelfConsumption = 0;
  if (batterySize === 5) {
    batterySelfConsumption = homeAllDay ? 0.8 : 0.6;
  } else if (batterySize === 10) {
    batterySelfConsumption = homeAllDay ? 0.9 : 0.7;
  }
  const selfConsumptionRatio = batterySize === 0 ? baseSelfConsumption : batterySelfConsumption;

  // Calculate actual self-used and exported
  let selfUsedKWh = Math.min(usage, estimatedAnnualGen * selfConsumptionRatio);
  let exportKWh = Math.max(0, estimatedAnnualGen - selfUsedKWh);
  if (usage < estimatedAnnualGen * selfConsumptionRatio) {
    exportKWh = estimatedAnnualGen - usage;
    selfUsedKWh = usage;
  }

  // Bill and savings calculations
  const annualStanding = standing * 365 / 100;
  const billUsage = rate * usage / 100;
  const annualSpend = billUsage + annualStanding;
  latestAnnualSpend = annualSpend;

  // Yearly savings and export calculations
  let annualSavingsArr = [];
  let price = rate;
  let exportRate = 16.5;
  let cumulative = 0;
  let exportIncomeCumulative = 0;
  for (let year = 1; year <= 10; year++) {
    let yearSavings = (selfUsedKWh * price) / 100;
    let yearExportIncome = (exportKWh * exportRate) / 100;
    cumulative += yearSavings;
    exportIncomeCumulative += yearExportIncome;
    annualSavingsArr.push({
      year,
      price: price.toFixed(2),
      savings: yearSavings.toFixed(2),
      exportIncome: yearExportIncome.toFixed(2),
      cumulative: cumulative.toFixed(2),
      exportCumulative: exportIncomeCumulative.toFixed(2)
    });
    price *= 1.0704;
  }
  let tableRows = annualSavingsArr.map(row =>
    `<tr>
      <td>Year ${row.year}</td>
      <td>£${row.savings}</td>
      <td>£${row.exportIncome}</td>
      <td>${row.price}p/kWh</td>
      <td>£${row.cumulative}</td>
      <td>£${row.exportCumulative}</td>
    </tr>`
  ).join('');
  const presenceText = homeAllDay
    ? "You're home during the day"
    : "You're out during the day";
  const batteryDesc = batterySize > 0 ? ` with ${batterySize}kWh battery` : "";
  const calcResult = document.getElementById("calcResult");
  latestSavingsPerYear = parseFloat(annualSavingsArr[0].savings);

  calcResult.innerHTML = `
    <div style="margin-bottom:1.1em;">
      <h3>Estimated Annual Savings (Year 1): £${annualSavingsArr[0].savings}</h3>
      <p>Your system is estimated to generate <strong>${estimatedAnnualGen.toFixed(0)} kWh</strong> per year.</p>
      <p>Annual self-used solar: <strong>${selfUsedKWh.toFixed(0)} kWh</strong> (${(100*selfUsedKWh/usage).toFixed(0)}% of your usage${batteryDesc}, ${presenceText})</p>
      <p>Annual solar export: <strong>${exportKWh.toFixed(0)} kWh</strong>
        <br>Value of exported energy at 16.5p/kWh: <strong>£${((exportKWh*exportRate)/100).toFixed(2)}</strong>
      </p>
      <p><b>Your annual energy spend (inc. standing charge): £${annualSpend.toFixed(2)}</b></p>
    </div>
    <h4>Projected Savings and Export Over 10 Years (with 7.04% price increase per year):</h4>
    <table style="margin:auto;border-collapse:collapse;">
      <tr>
        <th>Year</th>
        <th>Bill Savings</th>
        <th>Export Income</th>
        <th>Price per kWh</th>
        <th>Cumulative Savings</th>
        <th>Cumulative Export</th>
      </tr>
      ${tableRows}
    </table>
    <p style="font-size:0.95em;color:#888;">This calculation is based on a system with 9 solar panels – if your roof can fit more, your potential savings will be even higher. These are estimated figures based on typical UK conditions. For a free comprehensive breakdown, fill in the free quote form.</p>
  `;

  showFinanceOffset();
});

function showFinanceOffset() {
  const section = document.getElementById("finance-offset-section");
  section.style.display = "block";
  updateFinanceOffset();
}

function updateFinanceOffset() {
  const systemCostInput = document.getElementById("finance-system-cost");
  const depositInput = document.getElementById("deposit-amount");
  const installCost = parseFloat(systemCostInput?.value) || latestSystemCost || 9500;
  const deposit = parseFloat(depositInput?.value) || 0;
  if (deposit > installCost) {
    depositInput.value = installCost;
  }
  const loanAmount = installCost - deposit;
  const years = 10;
  const n = years * 12;
  const rate = 0.099;
  const monthlyRate = rate / 12;
  let monthly = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -n));
  const totalFinance = (monthly * n) + deposit;

  const savingsPerYear = latestSavingsPerYear || 800;
  const savingsPerMonth = savingsPerYear / 12;
  const totalSavings10y = savingsPerYear * years;
  const annualSpend = latestAnnualSpend || 1200;
  const totalElec10y = annualSpend * years;

  const netMonthly = monthly - savingsPerMonth;
  const net10y = (monthly * n) - totalSavings10y + deposit;
  const diff = totalElec10y - net10y;

  // Info tag explanation for net outgoing
  const infoIcon = `<span style="display:inline-block;vertical-align:middle;margin-left:0.4em;cursor:pointer;" tabindex="0" title="Your net outgoing is the remaining monthly amount after subtracting your expected solar bill savings from your finance payment. If negative, your savings exceed your payment!">
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="vertical-align:middle;"><circle cx="10" cy="10" r="9" stroke="#2196f3" stroke-width="2"/><text x="7" y="15" fill="#2196f3" font-size="13" font-family="Arial" font-weight="bold">i</text></svg>
  </span>`;
  // Info tag for 'Difference'
  const diffInfo = `<span style="display:inline-block;vertical-align:middle;margin-left:0.4em;cursor:pointer;" tabindex="0" title="This is the difference between your total 10-year electricity spend (no solar) and your total 10-year outgoings with solar (including finance and deposit, minus savings). If this is positive, you save money overall.">${infoIcon}</span>`;

  // Clear, stepwise breakdown table
  const summary = `
    <table style="margin:auto;border-collapse:separate;border-spacing:0 10px;font-size:1.07em;">
      <tr>
        <td style="font-weight:600;">System cost:</td>
        <td>£${installCost.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Deposit:</td>
        <td>£${deposit.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Loan amount:</td>
        <td>£${loanAmount.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Monthly finance payment:</td>
        <td>£${monthly.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Estimated monthly bill savings:</td>
        <td>£${savingsPerMonth.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Net outgoing per month:</td>
        <td>
          <span style="font-weight:bold;${netMonthly > 0 ? 'color:#b7a23a;' : 'color:#2196f3;'}">
            £${netMonthly.toFixed(2)}
          </span>
          ${infoIcon}
        </td>
      </tr>
      <tr><td colspan="2"><hr style="border:none;border-top:1px solid #b2daff55;"></td></tr>
      <tr>
        <td style="font-weight:600;">Total cost with solar & finance over 10 years:</td>
        <td>£${net10y.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Total electricity bill (no solar, 10 years):</td>
        <td>£${totalElec10y.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="font-weight:600;">Difference over 10 years:</td>
        <td>
          <span style="font-weight:bold;${diff > 0 ? 'color:#2196f3;' : 'color:#b7a23a;'}">
            ${diff > 0 ? "You save £" + diff.toFixed(2) : "Solar+finance costs £" + Math.abs(diff).toFixed(2) + " more"}
          </span>
          ${diffInfo}
        </td>
      </tr>
    </table>
    <div style="margin-top:1em;font-size:.98em;color:#555;text-align:left;max-width:520px;margin-left:auto;margin-right:auto;background:#f8faff;padding:0.8em 1.1em;border-radius:12px;">
      <b>How does this reduce your outgoings?</b>
      <br>Your monthly finance payment is partly offset by the savings on your electricity bill thanks to solar. In many cases, your combined finance payment <i>and</i> smaller electricity bill together will be less than what you'd pay for energy alone without solar. Over 10 years, these savings can add up to thousands of pounds in lower overall outgoings.
    </div>
  `;
  document.getElementById("finance-offset-summary").innerHTML = summary;
}

document.getElementById("depositForm").addEventListener("submit", function(e){
  e.preventDefault();
  updateFinanceOffset();
});

document.getElementById('finance-system-cost').addEventListener('input', function(e) {
  syncSystemCostFields(e.target.value);
});

function toggleHistoric() {
  let g = document.getElementById('historic-graph');
  g.style.display = (g.style.display === 'none' || g.style.display === '') ? 'block' : 'none';
  if (g.style.display === 'block' && !window._historicChartLoaded) {
    drawPriceChart();
    window._historicChartLoaded = true;
  }
}
function drawPriceChart() {
  const ctx = document.getElementById('pricesChart').getContext('2d');
  const years = [
    2000,2001,2002,2003,2004,2005,2006,2007,2008,2009,
    2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,
    2020,2021,2022,2023,2024,2025
  ];
  const prices = [
    7.0,7.3,7.2,7.1,7.4,8.2,10.0,10.6,13.3,13.9,
    13.7,14.5,15.5,15.6,15.6,15.2,14.4,14.4,15.0,17.2,
    17.2,19.0,28.0,30.0,28.5,27.5
  ];
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: years,
      datasets: [{
        label: 'UK Domestic Electricity Price (p/kWh)',
        data: prices,
        borderColor: '#397a94',
        backgroundColor: 'rgba(57,122,148,0.13)',
        tension: 0.25,
        pointBackgroundColor: '#ffd700',
        pointRadius: 5,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'pence per kWh' }
        },
        x: {
          title: { display: true, text: 'Year' }
        }
      }
    }
  });
}

// Trust card open/close logic
document.querySelectorAll('.accredit-card-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.accredit-card').forEach(card => {
      if (card.contains(btn)) {
        card.classList.toggle('active');
        btn.setAttribute('aria-expanded', card.classList.contains('active'));
      } else {
        card.classList.remove('active');
        card.querySelector('.accredit-card-btn').setAttribute('aria-expanded', 'false');
      }
    });
  });
  btn.addEventListener('keydown', function(e) {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      btn.click();
    }
  });
});
