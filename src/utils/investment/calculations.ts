
// Core calculation functions for investment simulation
import { DadosSimulacao, DetalhesMes, ResultadoSimulacao } from './types';

/**
 * Calcula a simulação de investimento imobiliário com base nos dados fornecidos
 * Utilizando o CUB (Custo Unitário Básico) como índice de correção
 */
export function calcularSimulacaoInvestimento(dados: DadosSimulacao): ResultadoSimulacao {
  const { valorMercado, valorCompra, valorizacao, cubInicial, variancaoCubAnual, entrada, parcelas, reforcos, meses } = dados;

  // Calcular a taxa mensal de correção CUB a partir da taxa anual
  const variancaoCubMensal = Math.pow(1 + variancaoCubAnual, 1 / 12) - 1;
  
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
  let totalJurosParcelas = 0;
  let totalJurosReforcos = 0;
  let detalhes: DetalhesMes[] = [];
  
  // Valor inicial do imóvel
  const valorInicialImovel = valorMercado;
  
  // A parcela mensal será corrigida pelo CUB
  let parcelaMensalAtual = parcelaMensalInicial;
  
  // O valor do reforço anual também será corrigido pelo CUB
  let reforcoAnualAtual = reforcoAnualInicial;
  
  // Valor atual do CUB (começa com o inicial e será atualizado mensalmente)
  let cubAtual = cubInicial;
  
  // Processamento mês a mês
  for (let i = 1; i <= meses; i++) {
    // Atualizar o valor do CUB para o mês atual
    if (i > 1) {
      cubAtual = cubAtual * (1 + variancaoCubMensal);
    }
    
    // Calcular o índice de correção do CUB (CUB atual / CUB inicial)
    const indiceCub = cubAtual / cubInicial;
    
    // Correção anual da parcela e do reforço com base no CUB (a cada 12 meses)
    if (i > 1 && (i - 1) % 12 === 0) {
      // Aplicar a correção anual com base no CUB
      const indiceCubAnual = cubAtual / cubInicial;
      parcelaMensalAtual = parcelaMensalInicial * indiceCubAnual;
      reforcoAnualAtual = reforcoAnualInicial * indiceCubAnual;
      
      // Calcular juros como a diferença entre valor corrigido e valor original
      const jurosParcela = parcelaMensalAtual - parcelaMensalInicial;
      totalJurosParcelas += jurosParcela * 12; // para os próximos 12 meses
    }
    
    // Calcular valor da parcela atual com índice CUB
    const parcelaCubCorrigida = parcelaMensalInicial * indiceCub;
    
    // Atualizar o saldo devedor
    saldoDevedor -= parcelaCubCorrigida;
    
    // Adicionar a parcela mensal ao total investido
    valorInvestido += parcelaCubCorrigida;
    parcelasPagas += parcelaCubCorrigida;
    
    // Flag para indicar se este mês tem reforço
    let temReforcoNesteMes = false;
    
    // Aplicar reforço anual ao final de cada ano com o valor corrigido pelo CUB
    if (i % 12 === 0 && i / 12 <= numAnos) {
      temReforcoNesteMes = true;
      
      // Calcular o reforço corrigido pelo CUB atual
      const reforcoCubCorrigido = reforcoAnualInicial * indiceCub;
      
      // Calcular juros como a diferença entre valor corrigido e valor original
      const jurosReforco = reforcoCubCorrigido - reforcoAnualInicial;
      totalJurosReforcos += jurosReforco;
      
      // Aplicar o reforço ao saldo devedor
      saldoDevedor = saldoDevedor - reforcoCubCorrigido;
      valorInvestido += reforcoCubCorrigido;
      reforcosPagos += reforcoCubCorrigido;
    }
    
    // Cálculo da valorização do imóvel (taxa mensal calculada a partir da anual)
    const taxaValorizacaoMensal = Math.pow(1 + valorizacao, 1/12) - 1;
    const valorAtualImovel = valorInicialImovel * Math.pow(1 + taxaValorizacaoMensal, i);
    
    // Adicionar ao histórico - importante manter a mesma precisão de casas decimais
    detalhes.push({
      mes: i,
      investido: parseFloat(valorInvestido.toFixed(2)),
      valorImovel: parseFloat(valorAtualImovel.toFixed(2)),
      saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
      parcelasPagas: parseFloat(parcelasPagas.toFixed(2)),
      reforcosPagos: parseFloat(reforcosPagos.toFixed(2)),
      parcelaMensal: parseFloat(parcelaCubCorrigida.toFixed(2)),
      temReforco: temReforcoNesteMes,
      valorCubAtual: parseFloat(cubAtual.toFixed(2)),
      indiceCubMensal: parseFloat(indiceCub.toFixed(4))
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

  // Cálculo final dos resultados - mantendo sempre a mesma precisão decimal
  const valorImovelFinal = parseFloat((valorInicialImovel * Math.pow(1 + valorizacao, meses / 12)).toFixed(2));
  const totalInvestidoFinal = parseFloat(detalhes[detalhes.length - 1].investido.toFixed(2));
  const lucro = parseFloat((valorImovelFinal - totalInvestidoFinal).toFixed(2));
  const retornoPercentual = parseFloat(((totalInvestidoFinal > 0 ? (lucro / totalInvestidoFinal) : 0)).toFixed(4));
  
  // Valor final do CUB
  const cubFinal = detalhes[detalhes.length - 1].valorCubAtual;

  return {
    totalInvestido: totalInvestidoFinal,
    valorImovel: valorImovelFinal,
    lucro: lucro,
    retornoPercentual: retornoPercentual,
    taxaCorrecao: variancaoCubAnual,
    valorizacao: valorizacao,
    valorCompra: valorCompra,
    totalEntrada: entrada,
    totalParcelas: parseFloat(parcelasPagas.toFixed(2)),
    totalReforcos: parseFloat(reforcosPagos.toFixed(2)),
    totalJurosParcelas: parseFloat(totalJurosParcelas.toFixed(2)),
    totalJurosReforcos: parseFloat(totalJurosReforcos.toFixed(2)),
    detalhes,
    reforcos: reforcos,
    cubInicial: cubInicial,
    cubFinal: parseFloat(cubFinal.toFixed(2)),
    indiceCubFinal: parseFloat((cubFinal / cubInicial).toFixed(4))
  };
}
