
import { DetalhesMes } from '@/utils/investment/types';

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

export interface DadosEmpreendimento {
  nomeEmpreendimento: string;
  dataInicio: Date | null;
  dataEntrega: Date | null;
  emailCliente: string;
  mensagem: string;
}

export interface DetalhesMesProcessado extends DetalhesMes {
  ganhoCapitalMensal: number;
  ganhoCapitalAcumulado: number;
  ganhoReal: number;
  jurosPagos: number;
  jurosMesPago: number;  // Juros pagos naquele mês específico
  jurosReforcosPagos: number; // Juros pagos relacionados aos reforços
  jurosReforcoMesPago: number; // Juros dos reforços pagos naquele mês específico
  lucroLiquido: number;
  lucroLiquidoComComissao: number; // Lucro líquido após dedução de 5% de comissão
  valorizacaoPrevista: number;
  temReforco: boolean; // Indica se neste mês houve pagamento de reforço
}

// Configurações para personalização do PDF
export interface PDFOptions {
  incluirGraficoGlobal: boolean;
  incluirGraficoMensal: boolean;
  incluirGraficoComparativo: boolean;
  incluirTabela: boolean;
  temaFundo?: 'light' | 'dark';
}
