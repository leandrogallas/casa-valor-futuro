
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
