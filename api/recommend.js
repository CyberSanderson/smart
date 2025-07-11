import OpenAI from "openai";

const openai = new OpenAI();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    // Build the prompt from quiz answers
    const prompt = `
You are an expert 3D printer buying advisor. Based on these user answers:

${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\n")}

Give a detailed, helpful 3D printer recommendation. Include:
- The recommended model (or a few options)
- Key specs or selling points
- Why it fits these needs
- Suggested accessories or upsells

Write it in friendly, clear language that converts readers to buyers. Mention affiliate links like "Check it out here: [affiliate link]" if appropriate.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",   // <-- updated here
      messages: [
        { role: "system", content: "You are a helpful, expert 3D printer shopping assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const result = completion.choices[0].message.content;

    return res.status(200).json({ recommendation: result });
  } catch (error) {
    console.error("Error in recommend API:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

