import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ALL_CATEGORIES = [
  // Frontend & Web
  "React component architecture and advanced patterns (compound components, render props, portals)",
  "Next.js App Router, Server Components, and streaming",
  "TypeScript advanced types, generics, and type utilities",
  "Tailwind CSS advanced techniques, custom plugins, and animations",
  "CSS animations, keyframes, and motion design",
  "Web performance optimization (lazy loading, bundle splitting, Core Web Vitals)",
  "Accessibility (ARIA, keyboard navigation, screen readers)",
  "State management with Zustand, Jotai, or Redux Toolkit",
  "Form handling, validation schemas, and error UX",
  "WebSockets and real-time features with Socket.io",
  // Backend & APIs
  "REST API design best practices and OpenAPI documentation",
  "GraphQL schema design, resolvers, and client queries",
  "Node.js backend patterns, middleware, and error handling",
  "Authentication and authorization (JWT, OAuth2, sessions, RBAC)",
  "API rate limiting, caching strategies with Redis",
  "Microservices communication patterns (gRPC, message queues)",
  "Serverless functions and edge computing (Cloudflare Workers, AWS Lambda)",
  "WebSocket server implementation and event-driven architecture",
  // Databases
  "SQL query optimization, indexing, and execution plans",
  "Prisma ORM, migrations, and type-safe database queries",
  "NoSQL patterns with MongoDB, DynamoDB, or Firestore",
  "Database schema design, normalization, and relationships",
  "Vector databases and semantic search (Pinecone, pgvector)",
  // AI & Machine Learning
  "AI prompt engineering, chain-of-thought, and LLM integration patterns",
  "LLM structured output (JSON, Pydantic, function calling)",
  "RAG (Retrieval-Augmented Generation) pipeline design",
  "Fine-tuning and embedding strategies for ML models",
  "AI agent architectures, tool use, and multi-agent systems",
  "Python data processing with pandas, numpy, and polars",
  "Data visualization with matplotlib, seaborn, or Plotly",
  "ML model evaluation, metrics, and experiment tracking (MLflow)",
  // DevOps & Infrastructure
  "Docker containerization and docker-compose setups",
  "Kubernetes deployment, services, and Helm charts",
  "CI/CD pipeline design (GitHub Actions, GitLab CI, CircleCI)",
  "Infrastructure as Code with Terraform or Pulumi",
  "Monitoring and observability (Prometheus, Grafana, OpenTelemetry)",
  "Cloud architecture patterns (AWS, GCP, Azure)",
  // Mobile & Cross-platform
  "React Native and Expo mobile app development",
  "Flutter widget architecture and state management",
  "PWA (Progressive Web App) features and service workers",
  "Mobile performance optimization and battery efficiency",
  // Security
  "Security best practices (XSS, CSRF, SQL injection, OWASP Top 10)",
  "Penetration testing basics and vulnerability scanning",
  "Secrets management, encryption, and key rotation",
  "OAuth2/OIDC implementation and SSO patterns",
  // Tools & Workflows
  "Git workflows, branching strategies, and commit conventions",
  "Testing strategies (unit, integration, E2E with Playwright/Cypress)",
  "Monorepo management with Turborepo or Nx",
  "CLI tool development with Node.js or Python (Commander, Click)",
  "Shell scripting and developer workflow automation",
  "Web scraping with BeautifulSoup, Playwright, or Puppeteer",
  "Browser extension development (Manifest V3)",
  "Code review best practices and PR description writing",
  "Technical writing, ADRs, and documentation systems",
  "Regex patterns and text parsing techniques",
  "Internationalization (i18n) and localization strategies",
  "Design system tokens, color theory, and typography scales",
  "SVG optimization, animation, and generative graphics",
  "Image optimization and media handling pipelines",
  "SEO technical optimization for modern frameworks",
  "Data visualization with D3.js, Recharts, or Observable",
  "Package publishing, versioning (semver), and changelogs",
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
