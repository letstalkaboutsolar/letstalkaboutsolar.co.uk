// Smooth scrolling for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.onclick = function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href'))
      .scrollIntoView({ behavior: 'smooth' });
  };
});

// FAQ toggle
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.parentNode.classList.toggle('active');
  });
});
<script>
const ctx = document.getElementById('solarSavingsChart').getContext('2d');
const solarSavingsChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Year 1','Year 2','Year 3','Year 4','Year 5','Year 6','Year 7','Year 8','Year 9','Year 10'],
    datasets: [
      {
        label: 'Cost Without Solar (£)',
        data: [1500.00, 1605.60, 1720.71, 1846.47, 1984.02, 2134.74, 2299.12, 2477.61, 2670.84, 2880.41],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        type: 'line',
        fill: false
      },
      {
        label: 'Cost With Solar (£)',
        data: [450.0, 481.68, 516.21, 553.94, 595.21, 640.42, 689.74, 743.28, 801.25, 864.12],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        type: 'line',
        fill: false
      },
      {
        label: 'Annual Savings (£)',
        data: [1050.0, 1123.92, 1204.5, 1292.52, 1388.81, 1494.32, 1610.0, 1734.33, 1869.59, 2016.29],
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'top' }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: '£' }
      }
    }
  }
});
</script>
