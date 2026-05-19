import { AgenteWorker } from '../worker.js';
import { AgentScheduler, type FaseRotina } from './scheduler.js';
import { buscarTarefasAgente } from './planner.js';
import { gerarRelatorioCheckin, gerarRelatorioCheckout } from './reporter.js';

interface ConfiguracaoAgente {
  id: string;
  nome: string;
  modelo: string;
  prompt_sistema: string;
  departamento?: string;
  skin_avatar?: string;
  desk_x?: number;
  desk_y?: number;
  ativo?: number;
}

interface Rotina {
  hora_inicio: string;
  hora_fim: string;
  almoco_inicio: string;
  almoco_fim: string;
  dias_semana: string;
  ativa: number;
}

const POLL_INTERVAL_MS = 30_000;

export class HermesOrchestrator {
  private workers = new Map<string, AgenteWorker>();
  private schedulers = new Map<string, AgentScheduler>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private serverUrl: string) {}

  async iniciar(): Promise<void> {
    console.log('[hermes] iniciando orchestrator...');
    await this.sincronizarAgentes();

    // Polling: detecta novos agentes adicionados após o start
    this.pollTimer = setInterval(() => {
      this.sincronizarAgentes().catch((err) =>
        console.warn('[hermes] erro no poll:', String(err)),
      );
    }, POLL_INTERVAL_MS);

    console.log(`[hermes] polling a cada ${POLL_INTERVAL_MS / 1000}s para novos agentes`);
  }

  private async sincronizarAgentes(): Promise<void> {
    const agentes = await this.fetchAgentes();
    const novos = agentes.filter((a) => !this.workers.has(a.id));
    if (novos.length > 0) {
      console.log(`[hermes] ${novos.length} novo(s) agente(s) encontrado(s)`);
      await Promise.all(novos.map((a) => this.iniciarAgente(a)));
    }
  }

  private async iniciarAgente(agente: ConfiguracaoAgente): Promise<void> {
    const worker = new AgenteWorker({
      agenteId: agente.id,
      nome: agente.nome,
      modelo: agente.modelo,
      promptSistema: agente.prompt_sistema,
      serverUrl: this.serverUrl,
      skinId: agente.skin_avatar,
      deskX: agente.desk_x,
      deskY: agente.desk_y,
    });

    try {
      await worker.iniciar();
      this.workers.set(agente.id, worker);
      console.log(`[hermes] agente "${agente.nome}" (${agente.id}) conectado`);
    } catch (err) {
      console.warn(`[hermes] falha ao conectar agente "${agente.nome}": ${String(err)}`);
      return;
    }

    const rotina = await this.fetchRotina(agente.id);
    if (!rotina || rotina.ativa === 0) {
      console.log(`[hermes] agente "${agente.nome}" sem rotina ativa — modo reativo apenas`);
      return;
    }

    const scheduler = new AgentScheduler(
      agente.id,
      {
        horaInicio:   rotina.hora_inicio,
        horaFim:      rotina.hora_fim,
        almocoInicio: rotina.almoco_inicio,
        almocoFim:    rotina.almoco_fim,
        diasSemana:   rotina.dias_semana,
      },
      async (evento) => this.handleEvento(agente, worker, evento.fase),
    );

    scheduler.iniciar();
    this.schedulers.set(agente.id, scheduler);
  }

  private async handleEvento(
    agente: ConfiguracaoAgente,
    worker: AgenteWorker,
    fase: FaseRotina,
  ): Promise<void> {
    const cfg = {
      agenteId: agente.id,
      nome: agente.nome,
      modelo: agente.modelo,
      promptSistema: agente.prompt_sistema,
      serverUrl: this.serverUrl,
    };

    console.log(`[hermes] ${agente.nome} → fase: ${fase}`);

    switch (fase) {
      case 'checkin': {
        const msg = await gerarRelatorioCheckin(cfg);
        worker.enviarMensagem(msg, agente.departamento ?? 'recepcao');
        break;
      }

      case 'working': {
        const tarefas = await buscarTarefasAgente(this.serverUrl, agente.id);
        if (tarefas.length === 0) {
          worker.enviarMensagem('Sem tarefas abertas — aguardando atribuição.', agente.departamento ?? 'recepcao');
          return;
        }
        const tarefa = tarefas[0];
        try {
          const resultado = await worker.executarTarefa(tarefa.id, tarefa.titulo + '\n' + tarefa.descricao);
          if (resultado) {
            worker.enviarMensagem(`✅ Tarefa "${tarefa.titulo}" concluída.`, agente.departamento ?? 'recepcao');
          }
        } catch (err) {
          console.warn(`[hermes] erro ao executar tarefa ${tarefa.id}: ${String(err)}`);
        }
        break;
      }

      case 'lunch': {
        worker.enviarMensagem('Pausando para almoço. Volto em breve! 🍽️', 'kitchen');
        break;
      }

      case 'checkout': {
        const msg = await gerarRelatorioCheckout(cfg);
        worker.enviarMensagem(msg, agente.departamento ?? 'recepcao');
        break;
      }

      case 'offline':
        // silencioso
        break;
    }
  }

  encerrar(): void {
    console.log('[hermes] encerrando...');
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    for (const scheduler of this.schedulers.values()) scheduler.parar();
    for (const worker of this.workers.values()) worker.encerrar();
    this.schedulers.clear();
    this.workers.clear();
  }

  private async fetchAgentes(): Promise<ConfiguracaoAgente[]> {
    const resp = await fetch(`${this.serverUrl}/agentes?ativo=1`);
    if (!resp.ok) throw new Error(`Falha ao buscar agentes: HTTP ${resp.status}`);
    const lista = (await resp.json()) as ConfiguracaoAgente[];
    return lista.filter((a) => a.ativo !== 0);
  }

  private async fetchRotina(agenteId: string): Promise<Rotina | null> {
    const resp = await fetch(`${this.serverUrl}/agentes/${agenteId}/rotina`);
    if (!resp.ok) return null;
    return resp.json() as Promise<Rotina>;
  }
}
