import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const ALL_CATEGORIES = [
  // React & Frontend frameworks
  "React custom hooks for debouncing, throttling, and event handling",
  "React Server Components vs Client Components — decision patterns",
  "React Suspense boundaries with error fallbacks and streaming",
  "React useTransition and useDeferredValue for responsive UIs",
  "React context performance patterns and avoiding re-renders",
  "React compound components with Context API",
  "React render props and higher-order component patterns",
  "React portals for modals, tooltips, and overlays",
  "React virtualized lists with react-window or react-virtual",
  "React Query (TanStack) advanced patterns: mutations, optimistic updates",
  "SWR data fetching patterns and revalidation strategies",
  "Vue 3 Composition API and reactive state patterns",
  "Svelte stores and reactive declarations",
  "Solid.js fine-grained reactivity and signals",
  "Astro island architecture and partial hydration",
  "Qwik resumability and lazy execution",
  // Next.js
  "Next.js App Router: layout nesting and route groups",
  "Next.js middleware for auth, redirects, and A/B testing",
  "Next.js parallel and intercepting routes",
  "Next.js image optimization with next/image and blur placeholders",
  "Next.js on-demand revalidation and ISR patterns",
  "Next.js Edge Runtime vs Node.js runtime selection",
  "Next.js environment variables and secrets management",
  // TypeScript
  "TypeScript conditional types and infer keyword",
  "TypeScript template literal types and string manipulation",
  "TypeScript discriminated unions for state machines",
  "TypeScript declaration merging and module augmentation",
  "TypeScript satisfies operator and const assertions",
  "TypeScript branded types and nominal typing",
  "TypeScript recursive types for tree structures",
  "TypeScript function overloads and method overloading",
  // CSS & Styling
  "CSS container queries for truly component-responsive design",
  "CSS scroll-driven animations with @scroll-timeline",
  "CSS subgrid for complex nested layouts",
  "CSS custom properties (variables) with JavaScript interop",
  "CSS Houdini Paint API for custom effects",
  "CSS view transitions for smooth page navigation",
  "CSS logical properties for RTL/LTR support",
  "PostCSS plugin development and custom transforms",
  // Build tools
  "Vite plugin development and virtual modules",
  "Webpack Module Federation for micro-frontends",
  "Rollup library bundling with tree shaking",
  "esbuild API for custom build pipelines",
  "Bun runtime and bundler for ultra-fast builds",
  "SWC transforms and Rust-based compilation",
  "Turborepo remote caching and pipeline optimization",
  "Nx affected commands and computation caching",
  "pnpm workspaces and catalog protocol",
  // Node.js backend
  "Node.js streams: readable, writable, transform, and pipeline",
  "Node.js cluster mode and worker_threads for parallelism",
  "Node.js EventEmitter patterns and custom event systems",
  "Node.js crypto module for hashing, HMAC, and encryption",
  "Fastify schema validation with JSON Schema and Zod",
  "NestJS modules, providers, and dependency injection",
  "NestJS guards, interceptors, and custom decorators",
  "tRPC end-to-end type safety with React Query integration",
  "Hono framework for edge and serverless environments",
  "Elysia with Bun for ultra-fast API development",
  // Python backend
  "FastAPI background tasks, dependencies, and lifespan events",
  "FastAPI WebSocket connections and real-time endpoints",
  "Django signals, custom managers, and QuerySet optimization",
  "Django REST Framework serializers and viewsets",
  "Flask application factory pattern and blueprints",
  "Celery distributed task queues with Redis/RabbitMQ",
  "asyncio patterns: gather, tasks, semaphores",
  // Go
  "Go goroutines, channels, and select statements",
  "Go context propagation for cancellation and deadlines",
  "Go HTTP handler patterns and middleware chains",
  "Go interfaces and duck typing patterns",
  "Go error wrapping with errors.As and errors.Is",
  "Go generics with type constraints",
  // APIs
  "GraphQL subscriptions with WebSockets and SSE",
  "GraphQL federation and schema stitching",
  "GraphQL DataLoader pattern for N+1 prevention",
  "gRPC service definitions and bidirectional streaming",
  "REST API cursor-based pagination for large datasets",
  "REST API versioning strategies (URL, header, content negotiation)",
  "OpenAPI 3.1 spec generation and code-first vs spec-first",
  "Webhook design: signatures, retries, and idempotency",
  "Server-Sent Events (SSE) for one-way streaming",
  // Databases
  "PostgreSQL full-text search with tsvector and tsquery",
  "PostgreSQL JSONB operators, indexes, and querying",
  "PostgreSQL row-level security for multi-tenant apps",
  "PostgreSQL partitioning strategies for billion-row tables",
  "PostgreSQL window functions for analytics",
  "PostgreSQL advisory locks and concurrency control",
  "SQLite WAL mode and performance optimization",
  "MongoDB aggregation pipeline stages and operators",
  "Redis sorted sets for real-time leaderboards and ranking",
  "Redis streams for durable event logs and consumer groups",
  "Elasticsearch query DSL: bool, nested, and aggregations",
  "Drizzle ORM schema definition and type-safe queries",
  "Kysely type-safe query builder for complex joins",
  "Supabase Realtime subscriptions and row filters",
  "PlanetScale branching workflow for zero-downtime schema changes",
  "Connection pooling with PgBouncer for high-concurrency apps",
  "Database migration strategies: expand-contract pattern",
  // AI & LLMs
  "Anthropic Claude tool use and function calling patterns",
  "OpenAI structured outputs with JSON schema enforcement",
  "LangChain LCEL (LangChain Expression Language) chains",
  "LangGraph stateful multi-agent workflows",
  "LlamaIndex query engines and retrieval pipelines",
  "RAG re-ranking with cross-encoders for better accuracy",
  "Hybrid search: combining dense and sparse retrieval",
  "Guardrails for LLM output validation and safety",
  "Prompt caching strategies for cost optimization",
  "LLM streaming responses with React and SSE",
  "Agentic loops: plan-act-reflect patterns",
  "Tool use orchestration with parallel and sequential calls",
  "Embedding fine-tuning with contrastive learning",
  "Multimodal prompting: vision, audio, and document inputs",
  "LLM evals: writing test suites for AI application quality",
  // ML/Data
  "pandas DataFrame operations: groupby, pivot, and reshape",
  "polars lazy evaluation and streaming for large datasets",
  "NumPy broadcasting and vectorized operations",
  "scikit-learn pipelines and custom transformers",
  "XGBoost and LightGBM hyperparameter tuning",
  "MLflow experiment tracking and model registry",
  "DVC data versioning and pipeline reproducibility",
  "Weights & Biases sweep for hyperparameter search",
  "TensorFlow.js for browser-side model inference",
  "ONNX model export and runtime optimization",
  // DevOps & Cloud
  "GitHub Actions reusable workflows and composite actions",
  "GitHub Actions matrix strategy for cross-platform builds",
  "Docker multi-stage builds for minimal production images",
  "Docker Compose healthchecks and service dependencies",
  "Kubernetes HPA with custom metrics from Prometheus",
  "Kubernetes network policies for pod isolation",
  "Kubernetes init containers and sidecar patterns",
  "ArgoCD GitOps application sync and rollback",
  "Terraform modules, workspaces, and remote state",
  "Pulumi TypeScript for infrastructure-as-code",
  "AWS CDK L3 constructs and custom resource patterns",
  "AWS Lambda layers, extensions, and cold start optimization",
  "AWS S3 presigned URLs and event notifications",
  "AWS EventBridge rules and event bus patterns",
  "GCP Cloud Run with VPC connectors and Cloud SQL",
  "GCP Pub/Sub push and pull subscriptions",
  "Azure Functions Durable orchestration patterns",
  "Cloudflare Workers KV, Durable Objects, and D1",
  "Nginx location blocks, upstream pools, and caching",
  "Caddy automatic HTTPS and reverse proxy config",
  // Observability
  "OpenTelemetry tracing: spans, context propagation, sampling",
  "Prometheus custom metrics: counters, histograms, gauges",
  "Grafana dashboard provisioning with JSON models",
  "Loki structured logging and LogQL queries",
  "Sentry error grouping, releases, and performance monitoring",
  "DataDog APM service map and distributed tracing",
  "Alerting rules and PagerDuty escalation policies",
  // Security
  "Content Security Policy (CSP) with nonce and hash strategies",
  "CORS configuration for multi-origin API setups",
  "PKCE flow for OAuth2 public clients (SPAs, mobile)",
  "TOTP 2FA implementation with QR code generation",
  "JWT refresh token rotation and reuse detection",
  "Cookie security: SameSite, Secure, HttpOnly, __Host- prefix",
  "Input sanitization with DOMPurify and validator.js",
  "Argon2 vs bcrypt for password hashing trade-offs",
  "SSRF prevention in user-supplied URL handlers",
  "Dependency vulnerability scanning with npm audit and Trivy",
  "Secrets scanning with truffleHog and git-secrets",
  "Zero-trust network access and mTLS between services",
  // Mobile
  "React Native Reanimated 3 gesture-driven animations",
  "React Native navigation: deep links and universal links",
  "Expo EAS Build and OTA updates workflow",
  "Flutter Riverpod state management and async notifiers",
  "Flutter custom painter and canvas drawing",
  "Capacitor native plugin bridging to iOS/Android APIs",
  "Push notifications with FCM and APNs across platforms",
  // Testing
  "Vitest with happy-dom for fast unit testing",
  "Mock Service Worker (MSW) for realistic API mocking",
  "React Testing Library: async queries and user-event v14",
  "Cypress component testing vs E2E testing",
  "Playwright fixtures and page object model",
  "k6 load testing scripts with thresholds and checks",
  "Pact contract testing for consumer-driven contracts",
  "Testcontainers for integration tests with real databases",
  "Property-based testing with fast-check",
  "Mutation testing with Stryker for test quality",
  // Tools & DX
  "ESLint custom rule authoring with AST selectors",
  "Prettier plugins for custom language formatting",
  "TypeScript path aliases and project references",
  "Changesets for monorepo package versioning",
  "Conventional changelog and release automation",
  "Commitizen and commitlint enforcement",
  "Lefthook vs Husky for git hook management",
  "Storybook interaction testing and accessibility audits",
  "Chromatic visual regression testing",
  "Figma to code: token extraction and design sync",
  "OpenAPI client generation with oazapfts or orval",
  "GraphQL code generation with graphql-codegen",
  // Web APIs & Browser
  "Web Workers for off-thread computation",
  "SharedArrayBuffer and Atomics for parallel processing",
  "IndexedDB with Dexie.js for offline-first apps",
  "Cache API and service worker caching strategies",
  "File System Access API for desktop-like file handling",
  "WebCodecs API for video/audio processing",
  "Web Bluetooth and Web USB APIs",
  "WebRTC peer connections and data channels",
  "WebXR for AR/VR experiences in the browser",
  "Web Animations API (WAAPI) vs CSS animations",
  "Intersection Observer patterns for infinite scroll and analytics",
  "ResizeObserver for fluid component layouts",
  "PerformanceObserver and Core Web Vitals measurement",
  // Miscellaneous
  "Feature flags with LaunchDarkly or Unleash",
  "A/B testing infrastructure and metric collection",
  "Email deliverability: SPF, DKIM, DMARC setup",
  "PDF generation with Puppeteer or React-PDF",
  "QR code generation and decoding",
  "Barcode scanning in the browser",
  "Map integration with Mapbox GL or Google Maps API",
  "Geolocation API and geocoding services",
  "Payment integration with Stripe elements and webhooks",
  "Subscription billing with Stripe recurring charges",
  "Full-text search with Typesense or Meilisearch",
  "RSS/Atom feed generation and parsing",
  "Markdown parsing and rendering (remark, rehype)",
  "Code syntax highlighting with Shiki or Prism",
  "Rich text editors with Tiptap or Slate.js",
  "Drag-and-drop with @dnd-kit",
  "Virtual file system and code editor integration",
  "CLI argument parsing with yargs or Commander.js",
  "Node.js REPL and interactive CLI tools",
  "Terminal UI with Ink (React for CLI)",
  "Cross-platform desktop apps with Tauri or Electron",
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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
