// --- FAQ Accordion Logic ---
document.querySelectorAll(".faq-question").forEach(btn => {
  btn.addEventListener("click", function() {
    const a = btn.nextElementSibling;
    // Close all other answers
    document.querySelectorAll(".faq-answer").forEach(o => {
      if (o !== a) o.style.display = "none";
    });
    document.querySelectorAll(".faq-question").forEach(q => {
      if (q !== btn) {
        q.classList.remove("active");
        q.setAttribute("aria-expanded", "false");
      }
    });
    if (a.style.display === "block") {
      a.style.display = "none";
      btn.classList.remove("active");
      btn.setAttribute("aria-expanded", "false");
    } else {
      a.style.display = "block";
      btn.classList.add("active");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// --- Google Maps Autocomplete & Orientation Checker ---
let autocomplete, lastPlaceLocation = null, panoMap = null;
function initMap() {
  const input = document.getElementById("addressInput");
  if (!input) return;
  autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (!place.geometry || !place.geometry.location) {
      alert("No details available for input: '" + place.name + "'");
      lastPlaceLocation = null;
      return;
    }
    lastPlaceLocation = place.geometry.location;
    // Orientation logic (very basic)
    const viewport = place.geometry.viewport;
    let orientation = "Unknown";
    let explanation = "";
    window.orientationFactor = 0.9;

    if (viewport) {
      const ne = viewport.getNorthEast();
      const sw = viewport.getSouthWest();
      const angle = Math.atan2(ne.lat() - sw.lat(), ne.lng() - sw.lng()) * (180 / Math.PI);

      if (angle > -45 && angle <= 45) {
        orientation = "East";
        window.orientationFactor = 0.85;
        explanation = "Your front roof likely faces East and the rear West. A solar system can still work well with morning sunlight.";
      } else if (angle > 45 && angle <= 135) {
        orientation = "North";
        window.orientationFactor = 0.75;
        explanation = "Your front roof likely faces North and the rear South. South-facing roofs are ideal for solar.";
      } else if (angle > -135 && angle <= -45) {
        orientation = "South";
        window.orientationFactor = 1.0;
        explanation = "Your front roof likely faces South and the rear North. This is excellent for solar efficiency.";
      } else {
        orientation = "West";
        window.orientationFactor = 0.8;
        explanation = "Your front roof likely faces West and the rear East. Good for catching late afternoon sunlight.";
      }
    }

    document.getElementById("orientationResult").innerHTML =
      `<strong>Estimated Roof Orientation:</strong> ${orientation}<br><em>${explanation}</em><br><span style='font-size:0.82rem;color:gray;'>These calculations are very generic—please book a consultation to get accurate and validated figures.</span>`;
  });
}
window.initMap = initMap;

// --- Street View Toggle Logic ---
window.toggleStreetView = function() {
  const container = document.getElementById("streetview-container");
  const btn = document.getElementById("toggleMapBtn");
  if (container.style.display === 'none' || container.style.display === '') {
    if (!lastPlaceLocation) {
      alert("Please enter your address and select it from the dropdown first.");
      return;
    }
    container.style.display = "block";
    btn.innerText = "Hide Street View";
    if (!panoMap) {
      panoMap = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), {
          position: lastPlaceLocation,
          pov: { heading: 160, pitch: 0 },
          zoom: 1
        }
      );
    } else {
      panoMap.setPosition(lastPlaceLocation);
    }
  } else {
    container.style.display = "none";
    btn.innerText = "Show Street View";
  }
}

// --- Solar Savings Calculator Logic ---
const calcForm = document.getElementById("calcForm");
if (calcForm) {
  calcForm.addEventListener("submit", function(e) {
    e.preventDefault();
    const rate = parseFloat(document.getElementById("rate").value);
    const usage = parseFloat(document.getElementById("usage").value);
    const battery = document.getElementById("battery").checked;
    const rise = 1.0704;
    let efficiency = battery ? 0.95 : 0.7;
    let orientationFactor = window.orientationFactor || 0.9;
    let save = 0.5 * orientationFactor * efficiency * usage * rate / 100;
    let total = 0, without = 0;
    let html = `<h3>10-Year Savings Estimate:</h3><ul>`;
    for (let i = 1; i <= 10; i++) {
      total += save;
      without += usage * Math.pow(rise, i) * rate / 100;
      html += `<li>Year ${i}: £${save.toFixed(2)}</li>`;
      save *= rise;
    }
    html += `</ul><p><strong>Total Solar Savings:</strong> £${total.toFixed(2)}</p>`;
    html += `<p><strong>Without Solar:</strong> £${without.toFixed(2)}</p>`;
    html += `<p style="margin-top:1rem;font-size:1rem;"><strong>Based on a 4kW system registered G98 and the assumption the homeowner is at home half the day.</strong></p>`;
    html += `<p style="font-size:0.85rem;color:gray;">These calculations are very generic—please book a consultation to get accurate and validated figures.</p>`;
    document.getElementById("calcResult").innerHTML = html;
  });
}

// --- Historic Price Chart (Chart.js) ---
window.toggleHistoric = function() {
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
        borderColor: '#72bcd4',
        backgroundColor: 'rgba(114,188,212,0.15)',
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

// --- News API Fetch for Energy News ---
fetch('https://newsapi.org/v2/everything?q=solar+energy+UK&language=en&sortBy=publishedAt&pageSize=5&apiKey=6c8d21b5a67a48bf8e1b5d7e20b6a6c5')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('news-list');
    if (!list) return;
    if (!data.articles || !data.articles.length) {
      list.innerHTML = "<li>No news found right now.</li>";
      return;
    }
    list.innerHTML = "";
    data.articles.forEach(article => {
      const item = document.createElement('li');
      item.innerHTML = `<a href="${article.url}" target="_blank">${article.title}</a> <span>(${new Date(article.publishedAt).toLocaleDateString()})</span>`;
      list.appendChild(item);
    });
  })
  .catch(() => {
    const list = document.getElementById('news-list');
    if (list) list.innerHTML = "<li>Unable to fetch news at this time.</li>";
  });

// --- Sticky Nav Hide on Scroll ---
let lastScroll = 0;
const nav = document.getElementById("navbar");
if (nav) {
  window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    nav.classList.toggle("hidden", currentScroll > lastScroll);
    lastScroll = currentScroll;
  });
}