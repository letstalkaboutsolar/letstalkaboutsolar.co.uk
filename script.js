// Mobile nav menu toggle
const menuToggle = document.getElementById('menu-toggle');
const navMenu = document.querySelector('nav#navbar ul');
if (menuToggle && navMenu) {
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
  });
  // Close menu on link click (mobile)
  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href');
    if (targetId.length > 1 && document.querySelector(targetId)) {
      e.preventDefault();
      document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Reveal on scroll (for .reveal elements)
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 85;
    if (elementTop < windowHeight - revealPoint) {
      el.classList.add('active');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// Trust badge popovers (keyboard accessibility)
document.querySelectorAll('.trust-logo').forEach((logo) => {
  logo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      logo.classList.toggle('popover-open');
    }
  });
  logo.addEventListener('blur', () => logo.classList.remove('popover-open'));
});

// Savings calculator with animated count up
document.getElementById("savingsForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const rate = parseFloat(document.getElementById("rate").value);
  const usage = parseFloat(document.getElementById("usage").value);
  const battery = document.getElementById("battery").checked;

  const systemSize = 4;
  const outputPerKW = 850;
  const yearlyGen = systemSize * outputPerKW;

  const selfUse = battery ? 0.95 : 0.70;
  const usedSolar = Math.min(usage, yearlyGen * selfUse);
  const savings = (usedSolar * rate) / 100;

  const breakEvenEstimate = battery ? 9500 : 6000;
  const breakEvenYears = (breakEvenEstimate / savings);

  // Animated count-up effect for the savings value
  const resultEl = document.getElementById("result");
  resultEl.innerHTML = '';
  let current = 0;
  let final = savings;
  let duration = 1250;
  let stepTime = Math.abs(Math.floor(duration / final));
  if (isNaN(stepTime) || !isFinite(stepTime) || stepTime < 12) stepTime = 12;

  function animateCount() {
    current += final / (duration / stepTime);
    if (current >= final) {
      current = final;
      resultEl.innerHTML = `
        <h3>Estimated Annual Savings: £${final.toFixed(2)}</h3>
        <p>With a ${battery ? 'battery' : 'standard'} system, you’ll use about ${(selfUse * 100).toFixed(0)}% of your solar energy.</p>
        <p>Typical installation: <strong>£${breakEvenEstimate.toLocaleString()}</strong>, break even in <strong>${breakEvenYears.toFixed(1)} years</strong>.</p>
        <p><strong>Want a bespoke quote? Message us now — we’ll do the rest.</strong></p>
      `;
      return;
    }
    resultEl.innerHTML = `<h3>Estimated Annual Savings: £${current.toFixed(0)}</h3>`;
    setTimeout(animateCount, stepTime);
  }
  animateCount();
});
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('nav ul');
if(hamburger && navLinks){
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active'));
  });
  hamburger.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      hamburger.click();
    }
  });
}