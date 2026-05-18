// Exposição de tools via MCP para o agente.
// Stub: contrato mínimo até a integração com @modelcontextprotocol/sdk.

export interface MCPTool {
  nome: string;
  descricao: string;
  inputSchema: Record<string, unknown>;
  executar: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface MCPServerHandle {
  registrarTool(tool: MCPTool): void;
  encerrar(): Promise<void>;
}

export function iniciarMcpServer(): MCPServerHandle {
  const tools = new Map<string, MCPTool>();
  return {
    registrarTool(tool) {
      tools.set(tool.nome, tool);
    },
    async encerrar() {
      tools.clear();
    },
  };
}
