#!/usr/bin/env node
/**
 * Benchmark de latencia — Semana 6
 * Compara TTFT y latencia total en escenario local vs. túnel público.
 *
 * Uso:
 *   node scripts/benchmark-latency.js
 *   node scripts/benchmark-latency.js --url https://xxxx.trycloudflare.com/api-backend
 *   node scripts/benchmark-latency.js --runs 5 --pregunta "Que dice el reglamento sobre semaforos?"
 */

const DEFAULT_URL = 'http://localhost:3000/api-backend';
const DEFAULT_RUNS = 5;
const DEFAULT_QUESTION = 'Resume en una oracion que es un dictamen de transito.';

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    baseUrl: DEFAULT_URL,
    runs: DEFAULT_RUNS,
    pregunta: DEFAULT_QUESTION
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) config.baseUrl = args[++i];
    else if (args[i] === '--runs' && args[i + 1]) config.runs = parseInt(args[++i], 10);
    else if (args[i] === '--pregunta' && args[i + 1]) config.pregunta = args[++i];
  }

  return config;
}

async function measureOnce(baseUrl, pregunta) {
  const url = `${baseUrl.replace(/\/$/, '')}/api/peritos/asistente-legal`;
  const start = Date.now();
  let ttft = null;
  let latency = null;
  let error = null;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (!payload) continue;

        try {
          const data = JSON.parse(payload);
          if (data.token && ttft === null) {
            ttft = Date.now() - start;
          }
          if (data.status === 'done' && data.metrics) {
            ttft = data.metrics.ttft ?? ttft;
            latency = data.metrics.latency ?? (Date.now() - start);
          }
        } catch {
          // ignorar líneas no JSON
        }
      }
    }

    if (latency === null) {
      latency = Date.now() - start;
    }
    if (ttft === null) {
      ttft = latency;
    }
  } catch (err) {
    error = err.message;
  }

  return { ttft, latency, error };
}

function stats(values) {
  if (!values.length) return { min: 0, max: 0, avg: 0 };
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  return { min, max, avg };
}

async function runBenchmark(config) {
  console.log('\n=== Benchmark SIGET — Semana 6 ===');
  console.log(`URL: ${config.baseUrl}`);
  console.log(`Corridas: ${config.runs}`);
  console.log(`Pregunta: ${config.pregunta}\n`);

  const ttftValues = [];
  const latencyValues = [];

  for (let i = 1; i <= config.runs; i++) {
    process.stdout.write(`Corrida ${i}/${config.runs}... `);
    const result = await measureOnce(config.baseUrl, config.pregunta);

    if (result.error) {
      console.log(`ERROR: ${result.error}`);
      continue;
    }

    ttftValues.push(result.ttft);
    latencyValues.push(result.latency);
    console.log(`TTFT=${result.ttft}ms  Latencia=${result.latency}ms`);
  }

  const ttftStats = stats(ttftValues);
  const latencyStats = stats(latencyValues);

  console.log('\n--- Resumen ---');
  console.log(`TTFT (ms):     min=${ttftStats.min}  avg=${ttftStats.avg}  max=${ttftStats.max}`);
  console.log(`Latencia (ms): min=${latencyStats.min}  avg=${latencyStats.avg}  max=${latencyStats.max}`);
  console.log('\nCopia estos valores a la tabla del entregable.semana.06.md\n');

  return { ttftStats, latencyStats };
}

runBenchmark(parseArgs()).catch((err) => {
  console.error('Error fatal:', err);
  process.exit(1);
});
