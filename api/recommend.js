import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Missing OPENAI_API_KEY in environment!");
    return res.status(500).json({ error: "Server misconfigured. Missing API key." });
  }

  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid request body. "answers" must be an array.' });
  }

  // Build the user-facing prompt
  const prompt = `
Based on the user's answers below, recommend the best 2–3 specific 3D printer models, with realistic price ranges in USD.
Include brand and model name.
Justify your recommendation for each.

User answers:
${answers.join('\n')}

Respond in this format:

**Recommended Models**
1. [Brand & Model] - $Price Range
   - Why it's good for the user's needs

2. [Brand & Model] - $Price Range
   - Why it's good for the user's needs

3. [Optional] [Brand & Model] - $Price Range
   - Why it's good for the user's needs
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are a professional 3D printer buying advisor.
Your job is to recommend specific 3D printer models, price ranges (USD), and clear reasoning based on user needs.
Always include at least 2–3 concrete model names with realistic price estimates (USD) available in 2024.
Be confident and helpful.
`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const recommendation = completion.choices[0].message.content?.trim();

    if (!recommendation) {
      return res.status(500).json({ error: 'No recommendation received from OpenAI.' });
    }

    return res.status(200).json({ recommendation });

  } catch (error) {
    console.error("❌ OpenAI API call failed:", error);
    return res.status(500).json({ error: 'Server error generating recommendation.' });
  }
}
