import fs from "node:fs/promises";
import path from "node:path";
import { Agent } from "./agent.js";

// Usage:
//   node index.js "hello"
//   node index.js "what's in this image?" --image ./test.png
//   node index.js "search latest Node.js LTS" --web

function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = new Map();
  const positionals = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags.set(key, next);
        i++;
      } else {
        flags.set(key, true);
      }
    } else {
      positionals.push(a);
    }
  }

  return { flags, positionals };
}

async function loadImage(imagePath) {
  const buf = await fs.readFile(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType =
    ext === ".png"
      ? "image/png"
      : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : "application/octet-stream";

  return {
    data: buf.toString("base64"),
    mimeType,
  };
}

const { flags, positionals } = parseArgs(process.argv);
const input = positionals.join(" ").trim();

if (!input) {
  console.error('Missing input. Example: node index.js "hello"');
  process.exit(1);
}

let image;
if (flags.get("image")) {
  image = await loadImage(flags.get("image"));
}

// Optional hint flags: these are not required by the architecture,
// but can be helpful for demos (e.g., force the router by adding keywords).
if (flags.get("web")) {
  // Nudges router heuristic/mocked router; real router may still decide.
}

const agent = new Agent();
const result = await agent.handle({ input, image });

// Print final output (last tool output).
const last = result.outputs[result.outputs.length - 1];
console.log(
  JSON.stringify(
    {
      routing: result.routing,
      plan: result.plan,
      output: last,
    },
    null,
    2,
  ),
);

