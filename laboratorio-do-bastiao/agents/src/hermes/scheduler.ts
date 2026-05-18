import cron from 'node-cron';

export interface ConfiguracaoRotina {
  horaInicio: string;   // "09:00"
  horaFim: string;      // "18:00"
  almocoInicio: string; // "12:00"
  almocoFim: string;    // "13:00"
  diasSemana: string;   // "1,2,3,4,5"
}

export type FaseRotina = 'offline' | 'checkin' | 'working' | 'lunch' | 'checkout';

export interface EventoRotina {
  fase: FaseRotina;
  agenteId: string;
  timestamp: Date;
}

type HandlerRotina = (evento: EventoRotina) => Promise<void>;

export class AgentScheduler {
  private tarefaCron: ReturnType<typeof cron.schedule> | null = null;
  private faseAtual: FaseRotina = 'offline';

  constructor(
    private agenteId: string,
    private rotina: ConfiguracaoRotina,
    private onEvento: HandlerRotina,
  ) {}

  iniciar(): void {
    // Verifica a cada minuto
    this.tarefaCron = cron.schedule('* * * * *', () => {
      void this.avaliarFase();
    });
    // Avalia imediatamente ao iniciar
    void this.avaliarFase();
  }

  parar(): void {
    this.tarefaCron?.stop();
    this.tarefaCron = null;
  }

  faseCorrente(): FaseRotina {
    return this.faseAtual;
  }

  private async avaliarFase(): Promise<void> {
    const now = new Date();
    const diaSemana = now.getDay(); // 0=dom, 1=seg, ...
    const diasValidos = this.rotina.diasSemana.split(',').map(Number);

    if (!diasValidos.includes(diaSemana)) {
      await this.transicionarPara('offline');
      return;
    }

    const hm = horarioAtual();
    const novaFase = this.calcularFase(hm);
    await this.transicionarPara(novaFase);
  }

  // protected para permitir testes de unidade
  protected calcularFase(hm: string): FaseRotina {
    const { horaInicio, horaFim, almocoInicio, almocoFim } = this.rotina;

    if (hm < horaInicio || hm >= horaFim) return 'offline';
    if (hm >= almocoInicio && hm < almocoFim) return 'lunch';

    // Janela de 15 min para checkin/checkout
    if (hm >= horaInicio && hm < somarMinutos(horaInicio, 15)) return 'checkin';
    if (hm >= somarMinutos(horaFim, -15) && hm < horaFim) return 'checkout';

    return 'working';
  }

  private async transicionarPara(novaFase: FaseRotina): Promise<void> {
    if (novaFase === this.faseAtual) return;
    this.faseAtual = novaFase;
    await this.onEvento({ fase: novaFase, agenteId: this.agenteId, timestamp: new Date() });
  }
}

function horarioAtual(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function somarMinutos(hm: string, minutos: number): string {
  const [h, m] = hm.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const nh = Math.floor(total / 60) % 24;
  const nm = ((total % 60) + 60) % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}
