
import { DetalhesMes, ResultadoSimulacao } from "@/utils/investment/types";
import { DetalhesMesProcessado } from "@/types/simulador";

export function useProcessarDetalhes() {
  // Função para processar os detalhes mensais usando definições padronizadas
  const processarDetalhesMensais = (resultado: ResultadoSimulacao): DetalhesMesProcessado[] => {
    const { detalhes, valorCompra } = resultado;
    
    if (!detalhes || detalhes.length === 0) {
      return [];
    }

    const processados: DetalhesMesProcessado[] = [];
    
    // Variáveis para cálculos padronizados
    const meses = detalhes.length;
    const valorParcelaSemCorrecao = resultado.parcelas / meses;
    const numReforcos = Math.floor(meses / 12);
    const valorReforcoSemCorrecao = numReforcos > 0 ? resultado.reforcos / numReforcos : 0;
    
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // DEFINIÇÕES PADRONIZADAS:
      
      // 1. Ganho de capital mensal (valorização do mês atual)
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - valorCompra;
      
      // 2. Ganho de capital acumulado (valor atual do imóvel - valor de compra)
      const ganhoCapitalAcumulado = mes.valorImovel - valorCompra;
      
      // 3. Juros pagos no mês atual (diferença entre parcela corrigida e parcela original)
      const indiceCub = mes.indiceCubMensal || 1;
      const jurosMesPago = (mes.parcelaMensal - valorParcelaSemCorrecao);
      
      // 4. Juros acumulados até o mês atual
      const jurosPagos = index > 0 
        ? processados[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // 5. Juros do reforço no mês atual (se houver) - CORRIGIDO
      // IMPORTANTE: Esta é a fórmula corrigida para cálculo dos juros de reforço
      const jurosReforcoMesPago = mes.temReforco 
        ? ((valorReforcoSemCorrecao * indiceCub) - valorReforcoSemCorrecao)
        : 0;
      
      // 6. Juros de reforços acumulados
      const jurosReforcosPagos = index > 0
        ? processados[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // 7. Total de juros acumulados (parcelas + reforços)
      const totalJurosAcumulados = jurosPagos + jurosReforcosPagos;
      
      // 8. Ganho real (ganho de capital - total de juros)
      const ganhoReal = ganhoCapitalAcumulado - totalJurosAcumulados;
      
      // 9. Comissão de 5% sobre o valor atual do imóvel
      const comissao = mes.valorImovel * 0.05;
      
      // 10. Lucro líquido (ganho real - comissão)
      const lucroLiquido = ganhoReal;
      
      // 11. Lucro líquido após comissão 
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // 12. Valorização prevista (valor atual do imóvel)
      const valorizacaoPrevista = mes.valorImovel;
      
      processados.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado,
        ganhoReal,
        jurosPagos,
        jurosMesPago,
        jurosReforcosPagos,
        jurosReforcoMesPago,
        lucroLiquido,
        lucroLiquidoComComissao,
        valorizacaoPrevista,
        temReforco: mes.temReforco,
        valorCubAtual: mes.valorCubAtual || 0, // Was using dados.cubInicial
        indiceCubMensal: mes.indiceCubMensal || 1
      });
    });
    
    return processados;
  };

  return { processarDetalhesMensais };
}
