
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

// Importing DetalhesMes directly rather than referencing it from another import
import { DetalhesMes } from "@/utils/investmentCalculator";

export interface DetalhesMesProcessado extends DetalhesMes {
  ganhoCapitalMensal: number;
  ganhoCapitalAcumulado: number;
  ganhoReal: number;
  jurosPagos: number;
  jurosMesPago: number;  // Juros pagos naquele mês específico
  jurosReforcosPagos: number; // Juros pagos relacionados aos reforços
  jurosReforcoMesPago: number; // Juros dos reforços pagos naquele mês específico
  lucroLiquido: number;
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
