const { OpenAIClient, AzureKeyCredential } = require("@azure/openai");

const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const apiKey = process.env.AZURE_OPENAI_KEY;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

const SYSTEM_PROMPT = `You are a warm, emotionally intelligent AI conversation coach specializing in improving communication between parents and their teenage children.

Your job is to:
- Help both sides feel heard, without taking sides.
- Reframe emotionally charged words into respectful and constructive dialogue.
- Promote curiosity over control, and empathy over judgment.

Your responses must:
- Be simple and suitable for both teens and adults.
- Always offer one of the following: a rephrasing suggestion, a reflective prompt, or a pause/empathy-building activity.
- Avoid phrases like "As an AI..." or "I understand your concern." Just speak clearly and supportively.
- Format your response in HTML using <p> tags for paragraphs and <ul>/<li> tags for lists.

Examples:
- If a parent says "You're always on your phone!", respond with:
  "<p>You might be worried about feeling disconnected. Want to share a moment when you missed spending time together?</p>"

- If a teen says "My mom doesn't get me at all", respond with:
  "<p>Sounds like you're feeling misunderstood. Want to try telling her one thing you wish she knew about your day?</p>"

End each message with a supportive cue like:
- "What do you think is a good way to bring this up with them?"
- "Would now be a good time to take a short break and come back with fresh eyes?"

Do not give therapy or clinical advice. Your focus is on trust, emotional safety, and communication habits.`;

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
      { role: "system", content: SYSTEM_PROMPT },
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
      body: { 
        reply,
        isHtml: true
      }
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
