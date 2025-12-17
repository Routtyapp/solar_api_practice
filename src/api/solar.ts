import OpenAI from "openai";

const apiKey = "up_Ze80XSyqgek8utPV9WacsyAE8rQNg";

const openai = new OpenAI({
  apiKey,
  baseURL: "https://api.upstage.ai/v1",
  dangerouslyAllowBrowser: true,
});

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function* streamChat(
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const chatCompletion = await openai.chat.completions.create({
    model: "solar-pro2",
    messages: messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    reasoning_effort: "high",
    stream: true,
  });

  for await (const chunk of chatCompletion) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
