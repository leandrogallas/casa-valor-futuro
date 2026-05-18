import { describe, it, expect } from 'vitest';
import { AgentScheduler, type ConfiguracaoRotina } from '../hermes/scheduler.js';
import type { FaseRotina, EventoRotina } from '../hermes/scheduler.js';

const ROTINA_PADRAO: ConfiguracaoRotina = {
  horaInicio: '09:00',
  horaFim: '18:00',
  almocoInicio: '12:00',
  almocoFim: '13:00',
  diasSemana: '1,2,3,4,5',
};

// Injeta o horário atual na instância para testes determinísticos
function criarSchedulerTeste(hm: string, rotina = ROTINA_PADRAO) {
  const eventos: FaseRotina[] = [];

  const scheduler = new AgentScheduler(
    'agente-test',
    rotina,
    async (ev: EventoRotina) => { eventos.push(ev.fase); },
  );

  // Expor método interno para teste
  const calcular = (scheduler as unknown as { calcularFase: (hm: string) => FaseRotina }).calcularFase.bind(scheduler);
  return { scheduler, eventos, calcular };
}

describe('AgentScheduler.calcularFase', () => {
  it('retorna offline antes do horário de início', () => {
    const { calcular } = criarSchedulerTeste('08:00');
    expect(calcular('08:00')).toBe('offline');
    expect(calcular('08:59')).toBe('offline');
  });

  it('retorna checkin nos primeiros 15 minutos do dia', () => {
    const { calcular } = criarSchedulerTeste('09:00');
    expect(calcular('09:00')).toBe('checkin');
    expect(calcular('09:10')).toBe('checkin');
  });

  it('retorna working durante período de trabalho', () => {
    const { calcular } = criarSchedulerTeste('10:00');
    expect(calcular('10:00')).toBe('working');
    expect(calcular('11:45')).toBe('working');
  });

  it('retorna lunch no intervalo de almoço', () => {
    const { calcular } = criarSchedulerTeste('12:00');
    expect(calcular('12:00')).toBe('lunch');
    expect(calcular('12:45')).toBe('lunch');
    expect(calcular('12:59')).toBe('lunch');
  });

  it('retorna working após o almoço', () => {
    const { calcular } = criarSchedulerTeste('13:30');
    expect(calcular('13:30')).toBe('working');
    expect(calcular('17:00')).toBe('working');
  });

  it('retorna checkout nos últimos 15 minutos do dia', () => {
    const { calcular } = criarSchedulerTeste('17:45');
    expect(calcular('17:45')).toBe('checkout');
    expect(calcular('17:55')).toBe('checkout');
  });

  it('retorna offline após horário de fim', () => {
    const { calcular } = criarSchedulerTeste('18:00');
    expect(calcular('18:00')).toBe('offline');
    expect(calcular('22:00')).toBe('offline');
  });
});
