import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic(); 

export async function generateContent(title) {
    const prompt = process.env.CLAUDE_PROMPT.replace("article.title", title)
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929', // Specify the Claude model you want to use
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    console.log('Generated content:', response.content[0].text);
    return (response.content[0].text);
  } catch (error) {
    console.error('Error generating content:', error);
  }
}
