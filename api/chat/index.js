const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

module.exports = async function (context, req) {
  // Log environment variables (without exposing sensitive data)
  context.log("Environment check:");
  context.log("ENDPOINT present:", !!endpoint);
  context.log("API KEY present:", !!apiKey);
  context.log("DEPLOYMENT present:", !!deployment);

  // Check if all required environment variables are present
  if (!endpoint || !apiKey || !deployment) {
    const missingVars = [];
    if (!endpoint) missingVars.push("AZURE_OPENAI_ENDPOINT");
    if (!apiKey) missingVars.push("AZURE_OPENAI_KEY");
    if (!deployment) missingVars.push("AZURE_OPENAI_DEPLOYMENT_NAME");
    
    context.log("Missing environment variables:", missingVars.join(", "));
    context.res = {
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: { 
        error: "Server configuration error",
        details: `Missing environment variables: ${missingVars.join(", ")}`
      }
    };
    return;
  }

  try {
    const userMsg = req.body?.message || "Hello";
    context.log("Received message:", userMsg);

    const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    const completion = await client.getChatCompletions(deployment, [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userMsg }
    ]);
    
    const reply = completion.choices[0].message.content;
    context.log("Generated reply:", reply);

    context.res = {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: { reply }
    };
  } catch (e) {
    context.log("Error details:", {
      message: e.message,
      stack: e.stack,
      name: e.name
    });

    context.res = {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: { 
        error: "Server error",
        details: e.message
      }
    };
  }
};
