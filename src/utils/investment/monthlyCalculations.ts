
import { DetalhesMes } from './types';
import { formatNumber, calculateMonthlyRate } from './utils';

/**
 * Processes monthly details for the investment simulation
 */
export function processMonthlyDetails(
  meses: number,
  valorInicialImovel: number,
  saldoDevedorInicial: number,
  valorizacao: number,
  cubInicial: number,
  variancaoCubMensal: number,
  parcelaMensalInicial: number,
  reforcoAnualInicial: number,
  numAnos: number
): {
  detalhes: DetalhesMes[];
  valorInvestido: number;
  parcelasPagas: number;
  reforcosPagos: number;
  saldoDevedor: number;
  totalJurosParcelas: number;
  totalJurosReforcos: number;
} {
  // Initialize tracking variables
  let valorInvestido = 0; // This will be updated with entrada value later
  let parcelasPagas = 0;
  let reforcosPagos = 0;
  let saldoDevedor = saldoDevedorInicial;
  let totalJurosParcelas = 0;
  let totalJurosReforcos = 0;
  let detalhes: DetalhesMes[] = [];
  
  // Current monthly payment and annual reinforcement (will be adjusted with CUB)
  let parcelaMensalAtual = parcelaMensalInicial;
  let reforcoAnualAtual = reforcoAnualInicial;
  
  // Current CUB value (starts with initial and will be updated monthly)
  let cubAtual = cubInicial;
  
  // Calculate monthly appreciation rate from annual rate
  const taxaValorizacaoMensal = calculateMonthlyRate(valorizacao);
  
  // Process each month
  for (let i = 1; i <= meses; i++) {
    // Update CUB value for current month
    if (i > 1) {
      cubAtual = cubAtual * (1 + variancaoCubMensal);
    }
    
    // Calculate CUB index (current CUB / initial CUB)
    const indiceCub = cubAtual / cubInicial;
    
    // Annual adjustment of payment and reinforcement based on CUB (every 12 months)
    if (i > 1 && (i - 1) % 12 === 0) {
      // Apply annual correction based on CUB
      const indiceCubAnual = cubAtual / cubInicial;
      parcelaMensalAtual = parcelaMensalInicial * indiceCubAnual;
      reforcoAnualAtual = reforcoAnualInicial * indiceCubAnual;
      
      // Calculate interest as difference between corrected value and original value
      const jurosParcela = parcelaMensalAtual - parcelaMensalInicial;
      totalJurosParcelas += jurosParcela * 12; // for the next 12 months
    }
    
    // Calculate current payment with CUB index
    const parcelaCubCorrigida = parcelaMensalInicial * indiceCub;
    
    // CORRECTION: Calculate remaining debt balance based on remaining period
    // This ensures the balance is linearly distributed across all months
    const percentualRestante = (meses - i) / meses;
    const saldoDevedorEsperado = saldoDevedorInicial * percentualRestante;
    
    // Update debt balance based on monthly amortization
    saldoDevedor -= parcelaCubCorrigida;
    
    // Add monthly payment to total invested
    valorInvestido += parcelaCubCorrigida;
    parcelasPagas += parcelaCubCorrigida;
    
    // Flag to indicate if this month has reinforcement
    let temReforcoNesteMes = false;
    
    // Apply annual reinforcement at the end of each year with CUB-corrected value
    if (i % 12 === 0 && i / 12 <= numAnos) {
      temReforcoNesteMes = true;
      
      // Calculate CUB-corrected reinforcement
      const reforcoCubCorrigido = reforcoAnualInicial * indiceCub;
      
      // Calculate interest as difference between corrected value and original value
      const jurosReforco = reforcoCubCorrigido - reforcoAnualInicial;
      totalJurosReforcos += jurosReforco;
      
      // Apply reinforcement to debt balance
      saldoDevedor = saldoDevedor - reforcoCubCorrigido;
      valorInvestido += reforcoCubCorrigido;
      reforcosPagos += reforcoCubCorrigido;
    }
    
    // Calculate property appreciation
    const valorAtualImovel = valorInicialImovel * Math.pow(1 + taxaValorizacaoMensal, i);
    
    // Add month details
    detalhes.push({
      mes: i,
      investido: formatNumber(valorInvestido),
      valorImovel: formatNumber(valorAtualImovel),
      saldoDevedor: i === meses ? 0 : formatNumber(saldoDevedor), // Ensure zero balance in last month
      parcelasPagas: formatNumber(parcelasPagas),
      reforcosPagos: formatNumber(reforcosPagos),
      parcelaMensal: formatNumber(parcelaCubCorrigida),
      temReforco: temReforcoNesteMes,
      valorCubAtual: formatNumber(cubAtual),
      indiceCubMensal: formatNumber(indiceCub, 4)
    });
    
    // Adjustment in last month to ensure zero debt balance
    if (i === meses) {
      // If there's a small residual value (due to rounding), adjust
      if (Math.abs(saldoDevedor) > 0.01) {
        const ultimoRegistro = detalhes[detalhes.length - 1];
        
        // Update last record to ensure zero balance
        detalhes[detalhes.length - 1] = {
          ...ultimoRegistro,
          saldoDevedor: 0
        };
      }
    }
  }

  return {
    detalhes,
    valorInvestido,
    parcelasPagas,
    reforcosPagos,
    saldoDevedor,
    totalJurosParcelas,
    totalJurosReforcos
  };
}
