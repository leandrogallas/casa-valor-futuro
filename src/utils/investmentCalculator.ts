
// Re-export from new modularized files
export { 
  formatarMoeda, 
  formatarPercentual 
} from './investment/formatters';

export { 
  calcularSimulacaoInvestimento 
} from './investment/calculations';

export type { 
  DadosSimulacao,
  ResultadoSimulacao,
  DetalhesMes
} from './investment/types';
