const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

module.exports = async function (context, req) {
  try {
    const userMsg = req.body.message || "";

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    const result = await client.getChatCompletions(deployment, [
      { role: "user", content: userMsg },
    ]);

    const reply = result.choices[0].message.content;

    context.res = {
      headers: { "Content-Type": "application/json" },
      body: { reply: reply },
    };
  } catch (err) {
    context.log("ERROR:", err.message);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { reply: "Server error: " + err.message },
    };
  }
};
