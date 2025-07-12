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

  // ✅ Improved, stricter prompt
  const prompt = `
You are to act as a professional 3D printer buying advisor. 
Below is a summary of what the user needs. 
Your job is to choose real, available 3D printer models in 2024 that best match the user's needs. 
You MUST provide at least two specific brand and model names, with realistic price ranges in USD, and justify why each is a good fit.

Important instructions:
- Do NOT repeat the user's answers.
- ONLY output your recommendations in this format:

**Recommended Models**
1. [Brand & Model] - $Price Range
   - Justification

2. [Brand & Model] - $Price Range
   - Justification

3. [Optional] [Brand & Model] - $Price Range
   - Justification

User needs summary:
${answers.join('\n')}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",         // ✅ Upgrade to gpt-4o
      temperature: 0.3,         // ✅ Slightly lower temperature for precision
      messages: [
        {
          role: "system",
          content: `
You are a professional 3D printer buying advisor. 
You MUST recommend specific real-world 3D printer models with realistic USD price ranges. 
Never just repeat the user's answers. 
Always transform their needs into specific, actionable recommendations with brand and model names available in 2024.
Respond only in the requested format.
`
        },
        {
          role: "user",
          content: prompt
        }
      ]
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

