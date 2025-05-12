
// Define core types for investment calculations

export interface DadosSimulacao {
  valorMercado: number;
  valorCompra: number;
  valorizacao: number;
  cubInicial: number;      // Valor do CUB na data base
  variancaoCubAnual: number; // Variação anual média do CUB
  entrada: number;
  parcelas: number;
  reforcos: number;
  meses: number;
}

export interface DetalhesMes {
  mes: number;
  investido: number;
  valorImovel: number;
  saldoDevedor: number;
  parcelasPagas: number;
  reforcosPagos: number;
  parcelaMensal: number; // Valor da parcela mensal atualizada
  temReforco: boolean; // Indica se este mês tem reforço
  valorCubAtual?: number; // Valor do CUB no mês atual
  indiceCubMensal?: number; // Índice de correção CUB mensal
}

export interface ResultadoSimulacao {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
  taxaCorrecao: number;
  valorCompra: number;
  totalEntrada: number;
  totalParcelas: number;
  totalReforcos: number;
  totalJurosParcelas: number;
  totalJurosReforcos: number;
  valorizacao: number;
  detalhes: DetalhesMes[];
  reforcos: number; // Original reforcos value from input data (uncorrected)
  cubInicial?: number;
  cubFinal?: number;
  indiceCubFinal?: number;
  parcelas: number; // Total parcelas value from input data (uncorrected)
}
