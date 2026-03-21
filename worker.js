// worker.js — runs entirely off the main thread
import { pipeline, env }
  from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.8';

env.allowLocalModels = false;
env.useBrowserCache  = true;

const MODELS = {
  small: 'Xenova/distilbart-cnn-6-6',   // q8 ~50 MB
  full:  'Xenova/distilbart-cnn-6-6',   // same for now; swap to larger when available
};

let pipe         = null;
let loadedModel  = null; // track which model is loaded

self.addEventListener('message', async ({ data }) => {
  switch (data.type) {
    case 'load':
      await loadModel(data.model || 'full');
      break;
    case 'summarise':
      await runSummarise(data.id, data.text, data.fallback);
      break;
  }
});

async function loadModel(choice) {
  const modelId = MODELS[choice] || MODELS.full;
  // Skip if already loaded with the same model
  if (loadedModel === modelId && pipe) {
    self.postMessage({ type: 'ready' });
    return;
  }
  pipe = null; loadedModel = null;
  try {
    pipe = await pipeline('summarization', modelId, {
      dtype: 'q8',
      progress_callback: p => {
        if (p.status === 'progress')
          self.postMessage({ type: 'progress', pct: Math.round(p.progress ?? 0) });
      },
    });
    loadedModel = modelId;
    self.postMessage({ type: 'ready' });
  } catch (err) {
    self.postMessage({ type: 'error', message: String(err) });
  }
}

async function runSummarise(id, text, fallback) {
  if (!pipe) { self.postMessage({ type: 'summary', id, text: fallback }); return; }
  try {
    const out    = await pipe(text.slice(0, 800), {
      max_new_tokens: 180, min_new_tokens: 40,
      num_beams: 4, early_stopping: true, no_repeat_ngram_size: 3,
    });
    const raw    = (out[0]?.summary_text || '').trim();
    self.postMessage({ type: 'summary', id, text: trimToSentence(raw) || fallback });
  } catch (err) {
    self.postMessage({ type: 'summary', id, text: fallback });
  }
}

function trimToSentence(text) {
  if (!text) return text;
  const match = text.match(/^(.*[.!?])\s*/s);
  if (match && match[1].length > 20) return match[1];
  return text;
}
