import OpenAI from "openai";
const openai = new OpenAI();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    console.log("Received answers:", answers);

    // Build prompt for OpenAI
    const prompt = `
You are a 3D printer buying assistant. Recommend the best 3D printer based on these user answers:

${answers.join('\n')}

Please respond with a short, clear buying recommendation. Include:
- Specific model suggestions if appropriate
- Price range
- Key reasons for the choice
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful expert in 3D printer recommendations." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const recommendation = completion.choices[0].message.content.trim();

    console.log("Generated recommendation:", recommendation);

    return res.status(200).json({ recommendation });

  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: 'Server error generating recommendation' });
  }
}



