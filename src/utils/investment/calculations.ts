
// Core calculation functions for investment simulation
import { DadosSimulacao, ResultadoSimulacao } from './types';
import { calculateMonthlyRate } from './utils';
import { processMonthlyDetails } from './monthlyCalculations';
import { calculateFinalResults } from './resultsCalculations';

/**
 * Calculates real estate investment simulation based on provided data
 * Using CUB (Basic Unit Cost) as correction index
 */
export function calcularSimulacaoInvestimento(dados: DadosSimulacao): ResultadoSimulacao {
  const { valorMercado, valorCompra, valorizacao, cubInicial, variancaoCubAnual, entrada, parcelas, reforcos, meses } = dados;

  // Calculate monthly CUB correction rate from annual rate
  const variancaoCubMensal = calculateMonthlyRate(variancaoCubAnual);
  
  // Number of expected annual reinforcements (total years)
  const numAnos = Math.floor(meses / 12);
  
  // Calculate initial debt balance (purchase price minus down payment)
  const saldoDevedorInicial = valorCompra - entrada;
  
  // Calculate initial annual reinforcement value (without correction)
  const reforcoAnualInicial = numAnos > 0 ? reforcos / numAnos : 0;
  
  // CORRECTION: Distribute debt balance across all months
  // We divide initial debt balance by total number of months to get monthly amortization value
  const amortizacaoMensalInicial = saldoDevedorInicial / meses;
  
  // CORRECTION: Initial monthly payment value (without correction)
  // We directly use total payments value divided by number of months
  const parcelaMensalInicial = parcelas / meses;
  
  // Initial property value
  const valorInicialImovel = valorMercado;
  
  // Process monthly details
  const {
    detalhes,
    valorInvestido: valorInvestidoBase,
    parcelasPagas,
    reforcosPagos,
    saldoDevedor,
    totalJurosParcelas,
    totalJurosReforcos
  } = processMonthlyDetails(
    meses,
    valorInicialImovel,
    saldoDevedorInicial,
    valorizacao,
    cubInicial,
    variancaoCubMensal,
    parcelaMensalInicial,
    reforcoAnualInicial,
    numAnos
  );
  
  // Add entrada to valorInvestidoBase to get total invested
  const valorInvestido = valorInvestidoBase + entrada;
  
  // Update the first month's invested value to include entrada
  if (detalhes.length > 0) {
    detalhes[0] = {
      ...detalhes[0],
      investido: detalhes[0].investido + entrada
    };
    
    // Update all subsequent months to include entrada in invested amount
    for (let i = 1; i < detalhes.length; i++) {
      detalhes[i] = {
        ...detalhes[i],
        investido: detalhes[i].investido + entrada
      };
    }
  }
  
  // Calculate final results
  return calculateFinalResults(
    valorInicialImovel,
    valorCompra,
    valorizacao,
    meses,
    entrada,
    parcelasPagas,
    reforcosPagos,
    totalJurosParcelas,
    totalJurosReforcos,
    variancaoCubAnual,
    detalhes,
    reforcos,
    cubInicial,
    parcelas
  );
}
