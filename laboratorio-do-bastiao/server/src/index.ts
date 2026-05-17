// Bootstrap do servidor Colyseus.
// Stub: log de inicialização; lógica real entra quando colyseus/express forem instalados.
import { carregarConfiguracao } from './config.js';

function main(): void {
  const cfg = carregarConfiguracao();
  console.log(`[bastiao-server] inicializando na porta ${cfg.porta}`);
  // futuro:
  //   const app = express();
  //   const server = createServer(app);
  //   const gameServer = new Server({ transport: new WebSocketTransport({ server }) });
  //   gameServer.define('office_room', OfficeRoom);
  //   gameServer.listen(cfg.porta);
}

main();
