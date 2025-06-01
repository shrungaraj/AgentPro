// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: 'YOUR_OPENAI_API_KEY',  // Replace with your actual key
});
const openai = new OpenAIApi(configuration);

const scenarios = {
  locked_account: "The customer is locked out of their Coinbase account and their password reset link expired. They're asking for help getting back in."
};

app.post('/evaluate', async (req, res) => {
  const { agent_response, scenario } = req.body;

  const systemPrompt = `
You're a customer service trainer AI. Given an agent's response and a customer scenario, grade the response out of 10 on:
- Accuracy: Did the agent correctly understand and address the issue?
- Fluency: Was the language smooth and understandable?
- Grammar: Was grammar correct and appropriate?
- Empathy: Did the agent show care, concern or understanding?

Return JSON with scores for each category and a short improvement feedback.
`;

  const userPrompt = `
Scenario: ${scenarios[scenario]}
Agent Response: "${agent_response}"
Please grade this and return the results as JSON.
`;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3
    });

    const responseText = completion.data.choices[0].message.content;
    const jsonStart = responseText.indexOf('{');
    const resultJson = JSON.parse(responseText.slice(jsonStart));

    res.json(resultJson);
  } catch (error) {
    console.error("OpenAI Error:", error.message);
    res.status(500).json({ error: "Evaluation failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
