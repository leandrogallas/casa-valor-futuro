
import React from "react";
import { ResultadoSimulacao, DetalhesMes, formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";
import CardsResumo from "./resultado/CardsResumo";
import GraficoResultado from "./resultado/GraficoResultado";
import { DetalhesMesProcessado } from "@/types/simulador";

interface ResultadoInvestimentoProps {
  resultado: ResultadoSimulacao | null;
}

const ResultadoInvestimento: React.FC<ResultadoInvestimentoProps> = ({ resultado }) => {
  if (!resultado) return null;

  const { 
    totalInvestido, 
    valorImovel, 
    lucro, 
    retornoPercentual, 
    detalhes, 
    totalJurosParcelas, 
    totalJurosReforcos, 
    valorCompra,
    totalEntrada,
    totalParcelas,
    totalReforcos,
    cubInicial,
    cubFinal,
    indiceCubFinal
  } = resultado;

  // Calculate additional metrics for each month in a way that avoids circular references
  const detalhesProcessed: DetalhesMesProcessado[] = [];
  
  if (detalhes && detalhes.length > 0) {
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // Monthly capital gain (valorização do mês)
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - detalhes[0].valorImovel;
      
      // CORRIGIDO: Ganho capital acumulado = valor atual do imóvel - valor compra inicial
      const ganhoCapitalAcumulado = mes.valorImovel - valorCompra;
      
      // Juros pagos são calculados como a diferença entre o valor corrigido pelo CUB e o valor original
      // Usando o índice CUB mensal se disponível
      const indiceCub = mes.indiceCubMensal || 1;
      const valorParcelaSemCorrecao = resultado.parcelas / resultado.detalhes.length;
      const jurosMesPago = (mes.parcelaMensal - valorParcelaSemCorrecao);
      
      // Calcular o juro acumulado até este mês (soma de todos os juros pagos até agora)
      const jurosPagos = index > 0 
        ? detalhesProcessed[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // Juros relacionados aos reforços para este mês específico
      const valorReforcoSemCorrecao = resultado.reforcos / Math.floor(resultado.detalhes.length / 12);
      const jurosReforcoMesPago = mes.temReforco 
        ? ((valorReforcoSemCorrecao * indiceCub) - valorReforcoSemCorrecao)
        : 0;
      
      // Juros acumulados relacionados aos reforços
      const jurosReforcosPagos = index > 0
        ? detalhesProcessed[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // CORRIGIDO: Ganho real = ganho capital acumulado - total de juros
      const ganhoReal = ganhoCapitalAcumulado - jurosPagos - jurosReforcosPagos;
      
      // CORRIGIDO: Lucro líquido é o ganho real
      const lucroLiquido = ganhoReal;
      
      // CORRIGIDO: Lucro líquido após comissão (5% do valor do imóvel final)
      const taxaComissao = 0.05; // 5%
      const comissao = mes.valorImovel * taxaComissao;
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // CORRIGIDO: Valorização prevista = valor atual do imóvel
      const valorizacaoPrevista = mes.valorImovel;
      
      detalhesProcessed.push({
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
        valorCubAtual: mes.valorCubAtual,
        indiceCubMensal: mes.indiceCubMensal
      });
    });
  }

  // Latest data for cards
  const latestData = detalhesProcessed.length > 0 ? detalhesProcessed[detalhesProcessed.length - 1] : null;
  
  // Only proceed if we have processed data
  if (!latestData) return null;
  
  // Calculate the sum of all interest paid (parcelas + reforços)
  const totalJurosPagos = totalJurosParcelas + totalJurosReforcos;
  
  // Get the valor compra, using the initial value of the property or the first month's value as fallback
  const valorCompraFinal = valorCompra || (detalhes && detalhes.length > 0 ? detalhes[0].valorImovel : 0);
  
  // Calculate the sum of property purchase price and total interest paid
  const valorImovelMaisJuros = valorCompraFinal + totalJurosPagos;
  
  // CORRECTED CALCULATION: Valor da parcela sem correção
  // Using the total parcelas value directly from resultado (user input) divided by number of months
  const valorParcelaSemCorrecao = resultado.parcelas / detalhes.length;
  
  // Número total de parcelas (igual ao número de meses)
  const numeroParcelas = detalhes.length;
  
  // Número de reforços (anos)
  const numeroReforcos = Math.floor(detalhes.length / 12);
  
  // CORRECTED CALCULATION: Valor do reforço sem correção 
  // This should be the original total reinforcement amount divided by number of reinforcements (years)
  const valorReforcoSemCorrecao = numeroReforcos > 0 ? resultado.reforcos / numeroReforcos : 0;
  
  // Get data for specific years to display in the table (yearly increments)
  const yearlyData = detalhesProcessed.filter(item => item.mes % 12 === 0 || item.mes === 1 || item.mes === detalhesProcessed.length);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-investment-dark">Resumo da Simulação</h2>
      
      <CardsResumo 
        totalInvestido={totalInvestido}
        valorImovel={valorImovel}
        lucro={latestData.lucroLiquidoComComissao} // CORRIGIDO: Usando lucro líquido com comissão
        retornoPercentual={latestData.lucroLiquidoComComissao / totalInvestido} // CORRIGIDO: Recalculando o retorno percentual
        latestData={latestData}
        meses={detalhes.length}
        totalJurosPagos={totalJurosPagos}
        totalJurosParcelas={totalJurosParcelas}
        totalJurosReforcos={totalJurosReforcos}
        valorImovelMaisJuros={valorImovelMaisJuros}
        valorCompra={valorCompraFinal}
        resultado={resultado}
        valorParcelaSemCorrecao={valorParcelaSemCorrecao}
        numeroParcelas={numeroParcelas}
        numeroReforcos={numeroReforcos}
        valorReforcoSemCorrecao={valorReforcoSemCorrecao}
        cubInicial={cubInicial}
        cubFinal={cubFinal}
        indiceCubFinal={indiceCubFinal}
      />
      
      <GraficoResultado 
        detalhesProcessed={detalhesProcessed}
        yearlyData={yearlyData}
      />
    </div>
  );
};

export default ResultadoInvestimento;
