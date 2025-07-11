import OpenAI from "openai";
const openai = new OpenAI();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const prompt = `
You are a 3D printer buying assistant. Recommend the perfect 3D printer based on the following user answers:

${answers.join('\n')}

Format your answer as helpful buying advice.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful 3D printer expert assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const recommendation = completion.choices[0].message.content;
    res.status(200).json({ recommendation });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
}


