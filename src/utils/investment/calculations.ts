
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
  let jurosParcelas = 0; // Juros acumulados sobre as parcelas
  let jurosReforcos = 0; // Juros acumulados sobre os reforços
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
      // Calcular juros sobre a parcela com base no índice de correção
      const jurosSobreParcela = parcelaMensalAtual * taxaMensal * 12; // Juros para um ano
      jurosParcelas += jurosSobreParcela;
      
      // Aplicar a correção anual à parcela e ao reforço
      parcelaMensalAtual = parcelaMensalAtual * (1 + correcao);
      reforcoAnualAtual = reforcoAnualAtual * (1 + correcao);
    }
    
    // Para o primeiro mês de cada ano, calcular os juros sobre o reforço
    if (i % 12 === 0 && i / 12 <= numAnos) {
      const jurosSobreReforco = reforcoAnualAtual * taxaMensal; // Juros de um mês sobre o reforço
      jurosReforcos += jurosSobreReforco;
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

  // Calcular juros das parcelas mensais simples (0.5% ao mês)
  // Para cada mês multiplicamos a parcela inicial pela taxa mensal
  const jurosParcelasSimples = parcelaMensalInicial * taxaMensal * meses;
  
  // Calcular juros dos reforços anuais simples (6% ao ano)
  // Para cada reforço anual multiplicamos o reforço inicial pela taxa anual 
  const jurosReforcosSimples = reforcoAnualInicial * correcao * numAnos;

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
    totalJurosParcelas: parseFloat(jurosParcelasSimples.toFixed(2)),
    totalJurosReforcos: parseFloat(jurosReforcosSimples.toFixed(2)),
    detalhes,
    reforcos: reforcos
  };
}
