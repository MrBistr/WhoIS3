// apiwork.js
const URL = "https://api.monsterapi.ai/v1/generate/txt2img";
// NOTE: In production, protect your token on a backend!
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjE3YmI0YmEzNDM1ZWExZTEyNGYxMDM3MTU4YzBkMmQ4IiwiY3JlYXRlZF9hdCI6IjIwMjUtMDQtMjBUMTg6NTA6MzYuNTg4NTY3In0.znBA4pJk0Ym6DuHGsne26x9upQwAX67HA009MAYkFCo";

export const generateAiImages = async (prompt, numberOfImages, imageStyle) => {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({
      safe_filter: true,
      prompt: prompt,
      style: imageStyle,
      samples: numberOfImages,
    }),
  };

  try {
    const response = await fetch(URL, options);
    const responseData = await response.json();
    if (!responseData.process_id) throw new Error("No process id returned");
    return await pollForResult(responseData.process_id);
  } catch (error) {
    console.error("Error generating AI images:", error);
    throw error;
  }
};

const pollForResult = async (process_id) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${TOKEN}`,
    },
  };
  let statusResponse;
  for (let i = 0; i < 20; ++i) { // max ~100 sec
    await new Promise(res => setTimeout(res, i === 0 ? 0 : 5000));
    const response = await fetch(
      `https://api.monsterapi.ai/v1/status/${process_id}`,
      options
    );
    statusResponse = await response.json();
    if (statusResponse.status === "COMPLETED") {
      return statusResponse.result.output;
    }
    if (statusResponse.status === "FAILED") {
      throw new Error("Generation failed");
    }
  }
  throw new Error("Generation timed out");
};