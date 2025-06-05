const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

module.exports = async function (context, req) {
  try {
    const userMsg = req.body?.message || "Hello";
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

    const completion = await client.getChatCompletions(deployment, [
      { role: "user", content: userMsg },
    ]);

    const reply = completion.choices[0].message.content;

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: { reply },
    };
  } catch (error) {
    context.log("Error calling Azure OpenAI:", error.message);
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { reply: "Error: " + error.message },
    };
  }
};