const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

module.exports = async function (context, req) {
  const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
  const userMsg = req.body.message;

  const completion = await client.getChatCompletions(deployment, [
    { role: "user", content: userMsg },
  ]);

  const reply = completion.choices[0].message.content;
  context.res = { body: { reply } };
};
