// Quiz Form Handler
document.addEventListener('DOMContentLoaded', () => {
  const quizForm = document.getElementById('quizForm');
  const resultBox = document.getElementById('result');

  if (quizForm) {
    quizForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const form = e.target;
      const data = {
        use_case: form.use_case.value,
        experience: form.experience.value,
        budget: form.budget.value,
        size: form.size.value,
        features: Array.from(form.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value),
        priority: form.priority.value,
        maintenance: form.maintenance.value
      };

      // Debug display
      if (resultBox) {
        resultBox.textContent = "Collecting your answers...\n" + JSON.stringify(data, null, 2);
      }

      // Example POST request (replace with your real endpoint)
      /*
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const recommendation = await response.json();
      if (resultBox) {
        resultBox.textContent = recommendation.text;
      }
      */
    });
  }
});
