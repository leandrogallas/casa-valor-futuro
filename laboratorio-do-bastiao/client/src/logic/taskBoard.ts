export interface TarefaItem {
  id: string;
  titulo: string;
  descricao: string;
  status: string;
  prioridade: string;
}

export const STATUS_LABELS: Record<string, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const STATUS_CORES: Record<string, string> = {
  aberta: '#4dabf7',
  em_andamento: '#fcc419',
  concluida: '#51cf66',
  cancelada: '#ff6b6b',
};

export function labelStatus(status: string): string {
  return STATUS_LABELS[status] ?? status;
}

export function corStatus(status: string): string {
  return STATUS_CORES[status] ?? '#888888';
}

export function validarTarefaForm(titulo: string, responsavelId: string): string | null {
  if (!titulo.trim()) return 'Título é obrigatório.';
  if (!responsavelId.trim()) return 'Responsável é obrigatório.';
  if (titulo.length > 200) return 'Título muito longo (máx 200 chars).';
  return null;
}
