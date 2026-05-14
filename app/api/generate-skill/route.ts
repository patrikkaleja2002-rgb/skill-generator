import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ALL_CATEGORIES = [
  "React component architecture and advanced patterns (compound components, render props, portals)",
  "Next.js App Router, Server Components, and streaming",
  "TypeScript advanced types, generics, and type utilities",
  "Tailwind CSS advanced techniques, custom plugins, and animations",
  "CSS animations, keyframes, and motion design",
  "Accessibility (ARIA, keyboard navigation, screen readers)",
  "Web performance optimization (lazy loading, bundle splitting, Core Web Vitals)",
  "Database schema design and SQL query optimization",
  "REST API design best practices and OpenAPI documentation",
  "GraphQL schema design, resolvers, and client queries",
  "Authentication and authorization (JWT, OAuth, sessions)",
  "Docker containerization and docker-compose setups",
  "CI/CD pipeline design (GitHub Actions, GitLab CI)",
  "Git workflows, branching strategies, and commit conventions",
  "Testing strategies (unit, integration, E2E with Playwright/Cypress)",
  "Python data processing with pandas, numpy, and polars",
  "Web scraping with BeautifulSoup, Playwright, or Puppeteer",
  "Node.js backend patterns, middleware, and error handling",
  "Prisma ORM, migrations, and type-safe database queries",
  "State management with Zustand, Jotai, or Redux Toolkit",
  "Data visualization with D3.js or Recharts",
  "SVG illustration and icon design",
  "Design system tokens, color theory, and typography scales",
  "AI prompt engineering and LLM integration patterns",
  "WebSockets and real-time features",
  "Browser extension development",
  "CLI tool development with Node.js or Python",
  "Regex patterns for common parsing tasks",
  "Shell scripting for developer workflows",
  "Code review best practices and PR description writing",
  "Technical writing and documentation",
  "Monorepo management with Turborepo or Nx",
  "Serverless functions and edge computing",
  "Image optimization and media handling",
  "Form handling, validation, and error UX",
  "Internationalization (i18n) and localization",
  "SEO optimization for Next.js and React apps",
  "Security best practices (XSS, CSRF, SQL injection prevention)",
  "API rate limiting, caching strategies, and Redis",
  "Microservices communication patterns",
];

const SKILL_FORMAT = `---
name: skill-name-kebab-case
description: One-line description of what this skill does and when Claude should use it
---

# Skill Title

Brief description of what this skill does.

## When to Use

- Bullet point conditions

## Instructions

Detailed step-by-step instructions Claude follows when this skill is active.

## Examples

2-3 concrete example prompts the user might type to invoke this skill.

## Output Format

What Claude outputs.`;

function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function buildPrompt(): string {
  const picked = pickRandom(ALL_CATEGORIES, 6);
  const list = picked.map((c, i) => `${i + 1}. ${c}`).join("\n");

  return `You are an expert Claude Code power user. Generate 6 unique, highly practical Claude Code skills for these specific domains:

${list}

Each skill must be genuinely useful for a developer working in that domain. Make skills concrete and actionable — not generic. Include specific tools, libraries, and techniques relevant to that domain.

For each skill use this exact format:

${SKILL_FORMAT}

---NEXT SKILL---

Generate all 6 skills now. Separate each with exactly "---NEXT SKILL---". Output ONLY the skill files, no intro text, no explanations.`;
}

export async function POST(_req: NextRequest) {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey || apiKey === "your_google_api_key_here") {
    return Response.json(
      { error: "GOOGLE_AI_API_KEY není nastaven v .env.local" },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const encoder = new TextEncoder();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const result = await model.generateContentStream(buildPrompt());
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
