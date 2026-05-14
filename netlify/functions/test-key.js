// Temporary Netlify Function for verifying OPENAI_API_KEY.
// Delete this file immediately after testing the deployed endpoint.
exports.handler = async function () {
  const key = process.env.OPENAI_API_KEY || "";
  const hasKey = key.length > 0;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify({
      hasOpenAIKey: hasKey,
      maskedPreview: hasKey ? maskKey(key) : null,
    }),
  };
};

function maskKey(value) {
  if (value.length <= 10) {
    return `${value.slice(0, 2)}...${value.slice(-2)}`;
  }

  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
