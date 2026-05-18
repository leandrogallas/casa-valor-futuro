// Runtime do agente — orquestra MCP server + A2A transport para um Agente.
// Stub: log de inicialização e referências exportadas.
import { iniciarMcpServer } from './mcp/server.js';
import { criarA2ATransport } from './a2a/transport.js';

function main(): void {
  console.log('[bastiao-agents] runtime do agente inicializado (stub)');
  // futuro: ler config do agente via env/arquivo, registrar tools, conectar A2A,
  //         entrar no Colyseus como cliente headless.
}

export { iniciarMcpServer, criarA2ATransport };

main();
