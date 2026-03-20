// worker.js — runs entirely off the main thread
// All transformers.js / ONNX inference happens here so the UI never hangs.

import { pipeline, env }
  from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.8';

env.allowLocalModels = false;
env.useBrowserCache  = true;

const MODEL = 'Xenova/distilbart-cnn-6-6';
let pipe = null;

// ── Message handler ───────────────────────────────────────────────
self.addEventListener('message', async ({ data }) => {
  switch (data.type) {

    case 'load':
      await loadModel();
      break;

    case 'summarise':
      await runSummarise(data.id, data.text, data.fallback);
      break;
  }
});

// ── Load model ────────────────────────────────────────────────────
async function loadModel() {
  try {
    pipe = await pipeline('summarization', MODEL, {
      dtype: 'q8',
      progress_callback: p => {
        if (p.status === 'progress') {
          self.postMessage({ type: 'progress', pct: Math.round(p.progress ?? 0) });
        }
      },
    });
    self.postMessage({ type: 'ready' });
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) });
  }
}

// ── Summarise one article ─────────────────────────────────────────
async function runSummarise(id, text, fallback) {
  if (!pipe) {
    self.postMessage({ type: 'summary', id, text: fallback });
    return;
  }
  try {
    const out    = await pipe(text.slice(0, 800), {
      max_new_tokens:       120,
      min_new_tokens:       30,
      num_beams:            4,
      early_stopping:       true,
      no_repeat_ngram_size: 3,
    });
    const result = (out[0]?.summary_text || '').trim();
    self.postMessage({ type: 'summary', id, text: result.length > 20 ? result : fallback });
  } catch (err) {
    console.warn('[worker] summarise error:', err);
    self.postMessage({ type: 'summary', id, text: fallback });
  }
}
