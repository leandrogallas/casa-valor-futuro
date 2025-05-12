
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

// Importando DetalhesMes da mesma fonte que a usa
import { DetalhesMes } from "@/utils/investmentCalculator";

export interface DetalhesMesProcessado extends DetalhesMes {
  ganhoCapitalMensal: number;
  ganhoCapitalAcumulado: number;
  ganhoReal: number;
  jurosPagos: number;
  jurosMesPago: number;  // Juros pagos naquele mês específico
  lucroLiquido: number;
  valorizacaoPrevista: number;
  parcelaMensal?: number; // Adicionado para compatibilidade com o novo campo em DetalhesMes
}
