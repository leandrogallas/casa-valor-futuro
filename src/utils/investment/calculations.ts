
// Core calculation functions for investment simulation
import { DadosSimulacao, DetalhesMes, ResultadoSimulacao } from './types';

/**
 * Calcula a simulação de investimento imobiliário com base nos dados fornecidos
 */
export function calcularSimulacaoInvestimento(dados: DadosSimulacao): ResultadoSimulacao {
  const { valorMercado, valorCompra, valorizacao, correcao, entrada, parcelas, reforcos, meses } = dados;

  // Calcular a taxa mensal de correção a partir da taxa anual
  const taxaMensal = Math.pow(1 + correcao, 1 / 12) - 1;
  
  // Número de reforços anuais esperados (total de anos)
  const numAnos = Math.floor(meses / 12);
  
  // Cálculo do valor inicial do saldo devedor (preço de compra menos entrada)
  const saldoDevedorInicial = valorCompra - entrada;
  
  // Cálculo do valor do reforço anual inicial (sem correção)
  const reforcoAnualInicial = numAnos > 0 ? reforcos / numAnos : 0;
  
  // Cálculo do valor da parcela mensal inicial (sem correção)
  let parcelaMensalInicial = saldoDevedorInicial / meses;
  
  // Variáveis para acompanhamento
  let valorInvestido = entrada;
  let parcelasPagas = 0;
  let reforcosPagos = 0;
  let saldoDevedor = saldoDevedorInicial;
  let detalhes: DetalhesMes[] = [];
  
  // Valor inicial do imóvel
  const valorInicialImovel = valorMercado;
  
  // A parcela mensal será corrigida anualmente
  let parcelaMensalAtual = parcelaMensalInicial;
  
  // O valor do reforço anual também será corrigido anualmente
  let reforcoAnualAtual = reforcoAnualInicial;
  
  // Processamento mês a mês
  for (let i = 1; i <= meses; i++) {
    // Correção anual da parcela e do reforço (a cada 12 meses)
    // No primeiro mês de cada ano (exceto o primeiro ano), aplicamos a correção
    if (i > 1 && (i - 1) % 12 === 0) {
      // Aplicar a correção anual à parcela e ao reforço
      parcelaMensalAtual = parcelaMensalAtual * (1 + correcao);
      reforcoAnualAtual = reforcoAnualAtual * (1 + correcao);
    }
    
    // Atualizar o saldo devedor
    if (i === 1) {
      // No primeiro mês, apenas reduzimos o saldo pelo valor da parcela inicial
      saldoDevedor -= parcelaMensalAtual;
    } else {
      // Nos meses seguintes, consideramos a amortização com parcela corrigida
      saldoDevedor -= parcelaMensalAtual;
    }
    
    // Adicionar a parcela mensal ao total investido
    valorInvestido += parcelaMensalAtual;
    parcelasPagas += parcelaMensalAtual;
    
    // Flag para indicar se este mês tem reforço
    let temReforcoNesteMes = false;
    
    // Aplicar reforço anual ao final de cada ano com o valor corrigido
    if (i % 12 === 0 && i / 12 <= numAnos) {
      temReforcoNesteMes = true;
      
      // Aplicar o reforço ao saldo devedor
      saldoDevedor = saldoDevedor - reforcoAnualAtual;
      valorInvestido += reforcoAnualAtual;
      reforcosPagos += reforcoAnualAtual;
    }
    
    // Cálculo da valorização do imóvel (taxa mensal calculada a partir da anual)
    const taxaValorizacaoMensal = Math.pow(1 + valorizacao, 1/12) - 1;
    const valorAtualImovel = valorInicialImovel * Math.pow(1 + taxaValorizacaoMensal, i);
    
    // Adicionar ao histórico
    detalhes.push({
      mes: i,
      investido: parseFloat(valorInvestido.toFixed(2)),
      valorImovel: parseFloat(valorAtualImovel.toFixed(2)),
      saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
      parcelasPagas: parseFloat(parcelasPagas.toFixed(2)),
      reforcosPagos: parseFloat(reforcosPagos.toFixed(2)),
      parcelaMensal: parseFloat(parcelaMensalAtual.toFixed(2)),
      temReforco: temReforcoNesteMes
    });
    
    // Ajuste no último mês para garantir saldo devedor zero
    if (i === meses) {
      // Se houver um pequeno valor residual (por causa de arredondamentos), ajustar
      if (Math.abs(saldoDevedor) > 0.01) {
        const ultimoRegistro = detalhes[detalhes.length - 1];
        const ajuste = ultimoRegistro.saldoDevedor;
        
        // Adicionar o ajuste final ao total investido
        valorInvestido += ajuste;
        parcelasPagas += ajuste;
        
        // Atualizar o último registro para garantir saldo zero
        detalhes[detalhes.length - 1] = {
          ...ultimoRegistro,
          investido: parseFloat(valorInvestido.toFixed(2)),
          saldoDevedor: 0,
          parcelasPagas: parseFloat(parcelasPagas.toFixed(2))
        };
      }
    }
  }

  // CORREÇÃO: Cálculo dos juros das parcelas como valor da parcela * (taxa anual / 12) * período total
  const jurosParcelasTotal = parcelaMensalInicial * (correcao / 12) * meses;
  
  // Cálculo dos juros dos reforços como taxa anual sobre cada reforço anual
  const jurosReforcosTotal = reforcoAnualInicial * correcao * numAnos;

  // Cálculo final dos resultados
  const valorImovelFinal = valorInicialImovel * Math.pow(1 + valorizacao, meses / 12);
  const totalInvestidoFinal = detalhes[detalhes.length - 1].investido;
  const lucro = valorImovelFinal - totalInvestidoFinal;
  const retornoPercentual = totalInvestidoFinal > 0 ? (lucro / totalInvestidoFinal) * 100 : 0;

  return {
    totalInvestido: totalInvestidoFinal,
    valorImovel: parseFloat(valorImovelFinal.toFixed(2)),
    lucro: parseFloat(lucro.toFixed(2)),
    retornoPercentual: parseFloat(retornoPercentual.toFixed(2)),
    taxaCorrecao: correcao,
    valorizacao: valorizacao,
    valorCompra: valorCompra,
    totalEntrada: entrada,
    totalParcelas: parseFloat(parcelasPagas.toFixed(2)),
    totalReforcos: parseFloat(reforcosPagos.toFixed(2)),
    totalJurosParcelas: parseFloat(jurosParcelasTotal.toFixed(2)),
    totalJurosReforcos: parseFloat(jurosReforcosTotal.toFixed(2)),
    detalhes,
    reforcos: reforcos
  };
}
