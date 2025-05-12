
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
  lucroLiquido: number;
  valorizacaoPrevista: number;
  // Removing optional marker since it's required in the base interface
}
