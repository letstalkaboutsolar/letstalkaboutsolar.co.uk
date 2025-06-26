// Google Maps Autocomplete & Orientation
let autocomplete, lastPlaceLocation = null, panoMap = null;
function initMap() {
  const input = document.getElementById("addressInput");
  if (!input) return; // avoid JS error if element not present
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

// Street View toggle
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