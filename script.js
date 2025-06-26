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