document.addEventListener('DOMContentLoaded', () => {
  const quizForm = document.getElementById('quizForm');
  const resultEl = document.getElementById('result');

  if (!quizForm || !resultEl) {
    console.log("🔎 Loaded OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "✅ present" : "❌ missing");
;
    return;
  }

  const ENDPOINT = 'https://smart-7q3i-cxrlozard-cybersandersons-projects.vercel.app/api/recommend';

  quizForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const use_case = form.use_case.value;
    const experience = form.experience.value;
    const budget = form.budget.value;
    const size = form.size.value;
    const features = Array.from(form.querySelectorAll('input[name="features"]:checked')).map(cb => cb.value);
    const priority = form.priority.value;
    const maintenance = form.maintenance.value;

    const answers = [
      `Use case: ${use_case}`,
      `Experience: ${experience}`,
      `Budget: ${budget}`,
      `Build size: ${size}`,
      `Features: ${features.join(", ") || "None"}`,
      `Priority: ${priority}`,
      `Maintenance preference: ${maintenance}`
    ];

    resultEl.textContent = "🔍 Generating your personalized recommendation... Please wait.";

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorText = "Unknown error";

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorText = errorData.error || JSON.stringify(errorData);
        } else {
          errorText = await response.text();
        }

        throw new Error(`❌ Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (data.recommendation) {
        resultEl.textContent = data.recommendation;
      } else if (data.error) {
        resultEl.textContent = `⚠️ Error: ${data.error}`;
      } else {
        resultEl.textContent = "⚠️ Sorry, no recommendation received.";
      }

    } catch (error) {
      console.error("❌ Client-side error:", error);
      resultEl.textContent = "❌ Error generating recommendation. Please try again later.";
    }
  });
});





