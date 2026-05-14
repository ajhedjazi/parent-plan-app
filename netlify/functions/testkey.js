exports.handler = async function () {
  const key = process.env.OPENAI_API_KEY;

  if (!key) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, message: "Secret key not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      message: "Secret key exists on the server",
      keyPreview: key.slice(0, 6) + "..." + key.slice(-4),
    }),
  };
};