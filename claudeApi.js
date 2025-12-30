import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function generateContent(title, source) {
  const prompt = process.env.CLAUDE_PROMPT.replace(
    "article.title",
    title
  ).replace("article.source", source);
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929", // Specify the Claude model you want to use
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    console.log("Generated content:", response.content[0].text);
    return response.content[0].text;
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

export async function generateChat(res, data, question) {
  const userPrompt = process.env.CLAUDE_CHAT_PROMPT.replace(
    "USER_QUESTION",
    question
  );
  try {
    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929", // Specify the Claude model you want to use
      max_tokens: 1024,
      messages: [
        data,
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });
    for await (const chunk of stream) {
      // Check if the chunk contains text data
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        const textChunk = chunk.delta.text;
        // SSE format: data: [content]\n\n
        res.write(`data: ${JSON.stringify({ content: textChunk })}\n\n`);
      }
    }
    res.write("event: end\n");
    res.write("data: {}\n\n");
  } catch (error) {
    console.error("Streaming error:", error);
    res.write(`event: error\n`);
    res.write(`data: ${JSON.stringify({ message: error.message })}\n\n`);
  } finally {
    res.end(); // Close the connection
  }
}
