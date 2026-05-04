const fetch = require("node-fetch");

async function analyzeImage(imageDataUrl) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY missing in .env");
      return null;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Identify the main shopping product in this image. Reply with only 2-5 search keywords. Example: laptop, keyboard, shoes, leather bag, mobile phone."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageDataUrl
                }
              }
            ]
          }
        ],
        max_tokens: 30
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI Vision Error:", JSON.stringify(data, null, 2));
      return null;
    }

    const result = data.choices?.[0]?.message?.content?.trim();

    console.log("AI IMAGE RESULT:", result);

    return result;
  } catch (err) {
    console.error("AI Image error:", err.message);
    return null;
  }
}

module.exports = {
  analyzeImage
};