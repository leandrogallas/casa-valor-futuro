
// Define core types for investment calculations

export interface DadosSimulacao {
  valorMercado: number;
  valorCompra: number;
  valorizacao: number;
  correcao: number;
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
  valorizacao: number; // Adding the valorizacao property to fix the build error
  detalhes: DetalhesMes[];
  reforcos: number; // Original reforcos value from input data (uncorrected)
}
