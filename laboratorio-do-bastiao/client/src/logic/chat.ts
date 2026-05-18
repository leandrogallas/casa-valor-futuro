export const CHAT_MAX_CHARS = 500;

export function sanitizarMensagem(texto: string): string | null {
  const trimmed = texto.trim();
  if (trimmed.length === 0) return null;
  return trimmed.length > CHAT_MAX_CHARS ? trimmed.slice(0, CHAT_MAX_CHARS) : trimmed;
}

export interface MensagemChat {
  autorId: string;
  autorNome: string;
  texto: string;
  salaId: string;
  timestamp: number;
}

export function filtrarPorSala(mensagens: MensagemChat[], salaId: string): MensagemChat[] {
  return mensagens.filter((m) => m.salaId === salaId);
}

export function formatarTimestamp(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
