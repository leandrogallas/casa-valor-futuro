import { AgenteWorker } from './worker.js';
import { HermesOrchestrator } from './hermes/orchestrator.js';
import { iniciarMcpServer } from './mcp/server.js';
import { criarA2ATransport } from './a2a/transport.js';

export { iniciarMcpServer, criarA2ATransport };

interface ConfiguracaoAgente {
  id: string;
  nome: string;
  modelo: string;
  prompt_sistema: string;
}

async function main(): Promise<void> {
  const serverUrl = process.env.SERVER_URL ?? 'http://localhost:2567';

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[bastiao-agents] ANTHROPIC_API_KEY não definido');
    process.exit(1);
  }

  // Modo Hermes: orquestra todos os agentes ativos com rotina diária
  if (process.env.HERMES_MODE === 'true') {
    const orchestrator = new HermesOrchestrator(serverUrl);
    await orchestrator.iniciar();

    const encerrar = () => { orchestrator.encerrar(); process.exit(0); };
    process.on('SIGTERM', encerrar);
    process.on('SIGINT', encerrar);

    // Mantém o processo vivo enquanto o poll timer existir
    await new Promise<void>(() => { /* resolvido apenas por SIGTERM/SIGINT */ });
    return;
  }

  // Modo agente único (AGENT_ID obrigatório)
  const agenteId = process.env.AGENT_ID;
  if (!agenteId) {
    console.error('[bastiao-agents] defina AGENT_ID ou use HERMES_MODE=true');
    process.exit(1);
  }

  const resp = await fetch(`${serverUrl}/agentes/${agenteId}`);
  if (!resp.ok) {
    console.error(`[bastiao-agents] agente ${agenteId} não encontrado (HTTP ${resp.status})`);
    process.exit(1);
  }
  const agente = (await resp.json()) as ConfiguracaoAgente;

  const worker = new AgenteWorker({
    agenteId: agente.id,
    nome: agente.nome,
    modelo: agente.modelo,
    promptSistema: agente.prompt_sistema,
    serverUrl,
  });

  await worker.iniciar();
  console.log(`[bastiao-agents] agente "${agente.nome}" conectado ao escritório`);

  process.on('SIGTERM', () => { worker.encerrar(); process.exit(0); });
  process.on('SIGINT', () => { worker.encerrar(); process.exit(0); });
}

main().catch((err) => {
  console.error('[bastiao-agents] erro fatal:', err);
  process.exit(1);
});
