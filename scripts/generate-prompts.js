#!/usr/bin/env node
// Buda - Mindfulness Prompt Generator
// Usage: npm run generate-prompts -- --count 200 --provider anthropic

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'prompts.json');

// ─── CLI Args ────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const getArg = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i !== -1 ? argv[i + 1] : def;
};
const hasFlag = (name) => argv.includes(`--${name}`);

const TARGET = parseInt(getArg('count', '200'), 10);
const PROVIDER = getArg('provider', 'anthropic').toLowerCase();
const BATCH_SIZE = parseInt(getArg('batch', '20'), 10);
const DRY_RUN = hasFlag('dry-run');

// ─── .env Loader ─────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

// ─── Prompt Validation ───────────────────────────────────────────────────────

/**
 * Expected format (4 lines):
 *   🧘 觉察时刻
 *   [guidance, ≤50 chars]
 *   💡 [tip, ≤20 chars]
 *   _[quote, ≤15 chars]_
 */
function validatePrompt(raw) {
  const lines = raw.trim().split('\n');
  if (lines.length !== 4) return { ok: false, reason: `expected 4 lines, got ${lines.length}` };

  const [l0, l1, l2, l3] = lines.map((l) => l.trim());

  if (!l0.startsWith('🧘')) return { ok: false, reason: 'line 1 must start with 🧘' };
  if (!l2.startsWith('💡')) return { ok: false, reason: 'line 3 must start with 💡' };
  if (!l3.startsWith('_') || !l3.endsWith('_')) return { ok: false, reason: 'line 4 must be wrapped in _underscores_' };
  if (l3.length < 3) return { ok: false, reason: 'quote too short' };

  const guidance = l1;
  const tip = l2.replace(/^💡\s*/, '');
  const quote = l3.slice(1, -1);

  if (!guidance) return { ok: false, reason: 'guidance is empty' };
  if (!tip) return { ok: false, reason: 'tip is empty' };
  if (!quote) return { ok: false, reason: 'quote is empty' };

  // Soft length warnings (don't fail – LLMs sometimes go slightly over)
  if (guidance.length > 60) return { ok: false, reason: `guidance too long (${guidance.length} > 60)` };
  if (tip.length > 30) return { ok: false, reason: `tip too long (${tip.length} > 30)` };
  if (quote.length > 20) return { ok: false, reason: `quote too long (${quote.length} > 20)` };

  return { ok: true };
}

function normalizePrompt(raw) {
  return raw
    .trim()
    .split('\n')
    .map((l) => l.trim())
    .join('\n');
}

// ─── JSON Storage ────────────────────────────────────────────────────────────

function loadData() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    // Support both old array format and new object format
    return Array.isArray(parsed) ? parsed : (parsed.prompts ?? []);
  } catch {
    return [];
  }
}

function saveData(prompts) {
  const out = {
    version: '1.0',
    generated_at: new Date().toISOString().split('T')[0],
    total: prompts.length,
    prompts,
  };
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(out, null, 2), 'utf8');
  fs.renameSync(tmp, DATA_FILE); // atomic write
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function bar(current, total, width = 32) {
  const pct = Math.min(current / total, 1);
  const filled = Math.round(pct * width);
  return '[' + '█'.repeat(filled) + '░'.repeat(width - filled) + ']';
}

function printProgress(current, total, extra = '') {
  const pct = Math.round((current / total) * 100);
  process.stdout.write(
    `\r  ${bar(current, total)} ${String(current).padStart(3)}/${total} (${pct}%) ${extra}   `
  );
}

// ─── LLM Providers ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a mindfulness prompt generator for a Zen wisdom app called Buda.

Generate prompts in this EXACT 4-line format:
🧘 觉察时刻
[1-2 sentence mindfulness guidance, max 50 characters]
💡 [Practical tip, max 20 characters]
_[Inspirational quote, max 15 characters]_

Rules:
- EXACTLY 4 lines per prompt, no more, no less
- Line 1 is always: 🧘 觉察时刻
- Line 3 starts with: 💡
- Line 4 starts and ends with underscore _
- Prefer Chinese, but English prompts are welcome (mix ~80% Chinese / ~20% English)
- Each prompt must be unique and meaningful
- Strictly follow character limits

Generate prompts across these 5 styles (mix evenly):
1. Classic Buddhist — 心经/金刚经 quotes and core concepts
2. Modern mindfulness — contemporary present-moment awareness
3. Zen koan — paradoxical questions that invite insight
4. Body awareness — physical sensations and posture
5. Emotional awareness — noticing feelings without judgment

Do NOT number the prompts. Separate each prompt with a single blank line.`;

const USER_MSG = (n) =>
  `Generate ${n} unique mindfulness prompts now. Only output the prompts separated by blank lines, nothing else.`;

async function callAnthropic(n) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: USER_MSG(n) }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.content[0].text;
}

async function callOpenAI(n) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_MSG(n) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

async function callZhipu(n) {
  const key = process.env.ZHIPU_API_KEY;
  if (!key) throw new Error('ZHIPU_API_KEY not set');
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: 'glm-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_MSG(n) },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Zhipu ${res.status}: ${await res.text()}`);
  const d = await res.json();
  return d.choices[0].message.content;
}

const PROVIDERS = {
  anthropic: callAnthropic,
  openai: callOpenAI,
  zhipu: callZhipu,
  glm: callZhipu,
};

// ─── Response Parser ──────────────────────────────────────────────────────────

function parseBlocks(text) {
  // Split on blank lines; each block should be one prompt
  return text
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  console.log('\n🧘  Buda Prompt Generator');
  console.log('─'.repeat(48));
  console.log(`  Provider : ${PROVIDER}`);
  console.log(`  Target   : ${TARGET}`);
  console.log(`  Batch    : ${BATCH_SIZE}`);
  if (DRY_RUN) console.log('  Mode     : DRY RUN (no API calls)');
  console.log('─'.repeat(48) + '\n');

  const callProvider = PROVIDERS[PROVIDER];
  if (!callProvider) {
    console.error(`❌ Unknown provider "${PROVIDER}". Supported: ${Object.keys(PROVIDERS).join(', ')}`);
    process.exit(1);
  }

  // Load existing prompts
  const existing = loadData();
  const seen = new Set(existing);
  const prompts = [...existing];

  console.log(`  Loaded ${prompts.length} existing prompts from disk`);

  if (prompts.length >= TARGET) {
    console.log(`  ✅ Already at target (${prompts.length}/${TARGET}). Re-saving in new format.`);
    saveData(prompts);
    return;
  }

  console.log(`  Need ${TARGET - prompts.length} more prompts\n`);

  let batchNum = 0;
  let totalGenerated = 0;
  let totalRejected = 0;
  let consecutiveErrors = 0;

  while (prompts.length < TARGET) {
    batchNum++;
    const need = TARGET - prompts.length;
    const batchAsk = Math.min(BATCH_SIZE, need + Math.ceil(need * 0.2)); // ask 20% extra to offset rejections

    process.stdout.write(`  Batch ${batchNum}: requesting ${batchAsk} prompts...`);

    let rawText;
    if (DRY_RUN) {
      // Generate fake prompts for testing
      rawText = Array.from({ length: batchAsk }, (_, i) => {
        const idx = prompts.length + i + 1;
        return `🧘 觉察时刻\n此刻你的心在哪里？(${idx})\n💡 回到当下\n_活在此刻_`;
      }).join('\n\n');
    } else {
      try {
        rawText = await callProvider(batchAsk);
        consecutiveErrors = 0;
      } catch (err) {
        consecutiveErrors++;
        process.stdout.write(` ❌ ${err.message}\n`);
        if (consecutiveErrors >= 3) {
          console.error('\n  ❌ 3 consecutive errors — aborting. Progress saved.');
          break;
        }
        const delay = Math.min(5000 * consecutiveErrors, 30000);
        process.stdout.write(`  Retrying in ${delay / 1000}s...\n`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }

    const blocks = parseBlocks(rawText);
    let accepted = 0;
    let rejected = 0;

    for (const block of blocks) {
      if (prompts.length >= TARGET) break;
      const norm = normalizePrompt(block);
      const { ok, reason } = validatePrompt(norm);
      if (!ok) {
        rejected++;
        continue;
      }
      if (seen.has(norm)) {
        rejected++;
        continue;
      }
      seen.add(norm);
      prompts.push(norm);
      totalGenerated++;
      accepted++;
    }

    totalRejected += rejected;
    process.stdout.write(` ✓ ${accepted} accepted, ${rejected} skipped\n`);
    printProgress(prompts.length, TARGET, `| rejected total: ${totalRejected}`);

    // Auto-save after each batch (resume support)
    saveData(prompts);
  }

  console.log('\n\n' + '─'.repeat(48));
  console.log(`  ✅ Done!`);
  console.log(`  Generated  : ${totalGenerated} new prompts`);
  console.log(`  Rejected   : ${totalRejected} (invalid format or duplicate)`);
  console.log(`  Total saved: ${prompts.length}`);
  console.log(`  Output     : data/prompts.json`);
  console.log('─'.repeat(48) + '\n');
}

main().catch((err) => {
  console.error('\n❌ Fatal:', err.message);
  process.exit(1);
});
