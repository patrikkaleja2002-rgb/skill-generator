import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey === "your_google_api_key_here") {
    return Response.json({ error: "GOOGLE_AI_API_KEY není nastaven" }, { status: 500 });
  }

  const { skill } = await req.json();
  if (!skill?.trim()) {
    return Response.json({ error: "Žádný skill k vylepšení" }, { status: 400 });
  }

  const prompt = `You are an expert Claude Code skill writer. Your job is to take an existing skill and significantly improve it.

Here is the existing skill to improve:

<existing_skill>
${skill}
</existing_skill>

Improve this skill by:
1. Making the description more precise and useful for auto-matching
2. Expanding and clarifying the instructions — make each step more actionable
3. Adding missing edge cases and considerations
4. Improving the output format specification
5. Adding a "Examples" section with 2-3 concrete example prompts the user might type
6. Ensuring the name is concise and memorable in kebab-case
7. Making the "When to Use" section more specific with real scenarios

Keep the same YAML frontmatter format:

---
name: skill-name-kebab-case
description: Precise one-line description
---

Output ONLY the improved skill file. No explanations, no "here is the improved version" — just the raw skill content.`;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(prompt);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\nCHYBA: ${msg}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
