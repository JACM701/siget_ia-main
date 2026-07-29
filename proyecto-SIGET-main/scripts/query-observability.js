#!/usr/bin/env node
/**
 * Consultar métricas de observabilidad (evidencia Semana 6)
 *
 * Uso:
 *   node scripts/query-observability.js
 *   node scripts/query-observability.js --url http://localhost:4000
 *   node scripts/query-observability.js --url https://xxxx.trycloudflare.com/api-backend
 */

const DEFAULT_URL = 'http://localhost:4000';

function parseArgs() {
  const args = process.argv.slice(2);
  let baseUrl = DEFAULT_URL;
  let limit = 20;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) baseUrl = args[++i];
    else if (args[i] === '--limit' && args[i + 1]) limit = parseInt(args[++i], 10);
  }

  return { baseUrl, limit };
}

async function main() {
  const { baseUrl, limit } = parseArgs();
  const url = `${baseUrl.replace(/\/$/, '')}/api/peritos/observability/metrics?limit=${limit}`;

  console.log(`Consultando: ${url}\n`);

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Error HTTP ${response.status}:`, await response.text());
    process.exit(1);
  }

  const data = await response.json();
  if (!data.metrics?.length) {
    console.log('No hay métricas registradas. Haz una consulta al asistente primero.');
    return;
  }

  console.log('ID  | TTFT(ms) | Latencia(ms) | IP Cliente        | Prompt (preview)');
  console.log('----|----------|--------------|-------------------|------------------');

  for (const row of data.metrics) {
    const ip = (row.client_ip || 'local').padEnd(17);
    const prompt = (row.prompt_preview || '').slice(0, 40);
    console.log(
      `${String(row.id).padEnd(3)} | ${String(row.ttft).padStart(8)} | ${String(row.latency).padStart(12)} | ${ip} | ${prompt}`
    );
  }

  console.log(`\nTotal: ${data.count} registros`);
  console.log('Toma captura de esta salida para la bitácora del PDF.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
