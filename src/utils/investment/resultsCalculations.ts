
import { ResultadoSimulacao, DetalhesMes } from './types';
import { formatNumber } from './utils';

/**
 * Calculates the final investment results based on processed data
 */
export function calculateFinalResults(
  valorInicialImovel: number,
  valorCompra: number,
  valorizacao: number,
  meses: number,
  entrada: number,
  parcelasPagas: number,
  reforcosPagos: number,
  totalJurosParcelas: number,
  totalJurosReforcos: number,
  variancaoCubAnual: number,
  detalhes: DetalhesMes[],
  reforcos: number,
  cubInicial: number,
  parcelas: number
): ResultadoSimulacao {
  // Calculate final results - maintaining consistent decimal precision
  const valorImovelFinal = formatNumber(valorInicialImovel * Math.pow(1 + valorizacao, meses / 12));
  const totalInvestidoFinal = formatNumber(detalhes[detalhes.length - 1].investido);
  
  // MAIN CORRECTION: Standardize capital gain calculation as difference between final property value and purchase price
  // Instead of using totalInvestidoFinal, we use valorCompra to calculate capital gain
  const ganhoCapital = formatNumber(valorImovelFinal - valorCompra);
  const totalJurosTotal = formatNumber(totalJurosParcelas + totalJurosReforcos);
  
  // Real gain = capital gain - interest paid
  const ganhoReal = formatNumber(ganhoCapital - totalJurosTotal);
  
  // 5% commission on final value
  const comissao = formatNumber(valorImovelFinal * 0.05);
  
  // Net profit = real gain - commission
  const lucro = formatNumber(ganhoReal - comissao);
  
  const retornoPercentual = formatNumber(totalInvestidoFinal > 0 ? (lucro / totalInvestidoFinal) : 0, 4);
  
  // Final CUB value
  const cubFinal = detalhes[detalhes.length - 1].valorCubAtual || 0;

  return {
    totalInvestido: totalInvestidoFinal,
    valorImovel: valorImovelFinal,
    lucro: lucro,
    retornoPercentual: retornoPercentual,
    taxaCorrecao: variancaoCubAnual,
    valorizacao: valorizacao,
    valorCompra: valorCompra,
    totalEntrada: entrada,
    totalParcelas: formatNumber(parcelasPagas),
    totalReforcos: formatNumber(reforcosPagos),
    totalJurosParcelas: formatNumber(totalJurosParcelas),
    totalJurosReforcos: formatNumber(totalJurosReforcos),
    detalhes,
    reforcos: reforcos,
    cubInicial: cubInicial,
    cubFinal: formatNumber(cubFinal),
    indiceCubFinal: formatNumber(cubFinal / cubInicial, 4),
    parcelas: parcelas // Keep original payments value
  };
}
