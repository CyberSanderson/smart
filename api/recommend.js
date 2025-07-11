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

  console.log("✅ Received body:", req.body);

  const {
    use_case,
    experience,
    budget,
    size,
    features,
    priority,
    maintenance
  } = req.body;

  if (!use_case || !experience || !budget || !size || !priority || maintenance === undefined) {
    return res.status(400).json({ error: 'Invalid request body. Missing fields.' });
  }

  const answers = [
    `Use case: ${use_case}`,
    `Experience: ${experience}`,
    `Budget: ${budget}`,
    `Build size: ${size}`,
    `Features: ${Array.isArray(features) ? features.join(", ") : "None"}`,
    `Priority: ${priority}`,
    `Maintenance preference: ${maintenance}`
  ];

  const prompt = `
You are a 3D printer buying assistant. Recommend the perfect 3D printer based on the following user answers:

${answers.join('\n')}

Format your answer as helpful buying advice with specific models, price ranges, and reasoning.
`;

  try {
    console.log("✅ Prompt to OpenAI:", prompt);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful expert in 3D printer recommendations." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    console.log("✅ OpenAI response:", completion);

    const recommendation = completion.choices[0].message.content;

    return res.status(200).json({ recommendation });

  } catch (error) {
    console.error("❌ OpenAI API call failed:", error);
    if (error.response) {
      console.error("OpenAI error response:", error.response.status, error.response.data);
    } else if (error.message) {
      console.error("Error message:", error.message);
    }
    return res.status(500).json({ error: 'Server error generating recommendation' });
  }
}

