document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav toggle
  const menuToggle = document.getElementById('menu-toggle') || document.querySelector('.hamburger');
  const navMenu = document.querySelector('nav#navbar ul');

  if (menuToggle && navMenu) {
    const toggleMenu = () => {
      navMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    };
    menuToggle.addEventListener('click', toggleMenu);
    menuToggle.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') toggleMenu();
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('open'));
    });
  }

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId.length > 1 && document.querySelector(targetId)) {
        e.preventDefault();
        document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Reveal on scroll
  const revealOnScroll = () => {
    document.querySelectorAll('.reveal').forEach((el) => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      const revealPoint = 85;
      if (elementTop < windowHeight - revealPoint) {
        el.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);

  // Trust badge accessibility
  document.querySelectorAll('.trust-logo').forEach((logo) => {
    logo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        logo.classList.toggle('popover-open');
      }
    });
    logo.addEventListener('blur', () => logo.classList.remove('popover-open'));
  });

  // Solar Savings Calculator
  const savingsForm = document.getElementById("savingsForm");
  if (savingsForm) {
    savingsForm.addEventListener("submit", function (e) {
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
      const breakEvenYears = breakEvenEstimate / savings;

      const resultEl = document.getElementById("result");
      resultEl.innerHTML = '';
      let start = 0;
      let startTime = null;

      function countUp(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const duration = 1250;
        const progressRatio = Math.min(progress / duration, 1);
        const current = progressRatio * savings;

        resultEl.innerHTML = `<h3>Estimated Annual Savings: £${current.toFixed(0)}</h3>`;

        if (progress < duration) {
          requestAnimationFrame(countUp);
        } else {
          resultEl.innerHTML = `
            <h3>Estimated Annual Savings: £${savings.toFixed(2)}</h3>
            <p>With a ${battery ? 'battery' : 'standard'} system, you’ll use about ${(selfUse * 100).toFixed(0)}% of your solar energy.</p>
            <p>Typical installation: <strong>£${breakEvenEstimate.toLocaleString()}</strong>, break even in <strong>${breakEvenYears.toFixed(1)} years</strong>.</p>
            <p><strong>Want a bespoke quote? Message us now — we’ll do the rest.</strong></p>
          `;
        }
      }

      requestAnimationFrame(countUp);
    });
  }
});