
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

  // Calculate additional metrics for each month following the standardized definitions
  const detalhesProcessed: DetalhesMesProcessado[] = [];
  
  if (detalhes && detalhes.length > 0) {
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // Valorização mensal (diferença para o mês anterior)
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - detalhes[0].valorImovel;
      
      // DEFINIÇÃO PADRONIZADA: ganho capital acumulado = valor atual do imóvel - valor compra inicial
      const ganhoCapitalAcumulado = mes.valorImovel - valorCompra;
      
      // Cálculo de juros mensais
      const indiceCub = mes.indiceCubMensal || 1;
      const valorParcelaSemCorrecao = resultado.parcelas / resultado.detalhes.length;
      const jurosMesPago = (mes.parcelaMensal - valorParcelaSemCorrecao);
      
      // Juros acumulados até o mês atual
      const jurosPagos = index > 0 
        ? detalhesProcessed[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // Juros dos reforços
      const valorReforcoSemCorrecao = resultado.reforcos / Math.floor(resultado.detalhes.length / 12);
      const jurosReforcoMesPago = mes.temReforco 
        ? ((valorReforcoSemCorrecao * indiceCub) - valorReforcoSemCorrecao)
        : 0;
      
      // Juros acumulados relacionados aos reforços
      const jurosReforcosPagos = index > 0
        ? detalhesProcessed[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // DEFINIÇÃO PADRONIZADA: Ganho real = ganho capital acumulado - total de juros
      const totalJurosAcumulados = jurosPagos + jurosReforcosPagos;
      const ganhoReal = ganhoCapitalAcumulado - totalJurosAcumulados;
      
      // DEFINIÇÃO PADRONIZADA: Lucro líquido é o ganho real
      const lucroLiquido = ganhoReal;
      
      // DEFINIÇÃO PADRONIZADA: Lucro líquido após comissão (5% do valor do imóvel final)
      const taxaComissao = 0.05; // 5%
      const comissao = mes.valorImovel * taxaComissao;
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // DEFINIÇÃO PADRONIZADA: Valorização prevista = valor atual do imóvel
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
  
  // DEFINIÇÃO PADRONIZADA: Total de juros pagos = juros parcelas + juros reforços
  const totalJurosPagos = totalJurosParcelas + totalJurosReforcos;
  
  // DEFINIÇÃO PADRONIZADA: ganho de capital = valor final do imóvel - valor de compra
  const ganhoCapital = valorImovel - valorCompra;
  
  // DEFINIÇÃO PADRONIZADA: ganho real = ganho de capital - total de juros pagos
  const ganhoReal = ganhoCapital - totalJurosPagos;
  
  // DEFINIÇÃO PADRONIZADA: Valor do imóvel mais juros = valor de compra + total de juros
  const valorImovelMaisJuros = valorCompra + totalJurosPagos;
  
  // Cálculos para parcelas e reforços
  const valorParcelaSemCorrecao = resultado.parcelas / detalhes.length;
  const numeroParcelas = detalhes.length;
  const numeroReforcos = Math.floor(detalhes.length / 12);
  const valorReforcoSemCorrecao = numeroReforcos > 0 ? resultado.reforcos / numeroReforcos : 0;
  
  // Get data for specific years to display in the table (yearly increments)
  const yearlyData = detalhesProcessed.filter(item => item.mes % 12 === 0 || item.mes === 1 || item.mes === detalhesProcessed.length);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-investment-dark">Resumo da Simulação</h2>
      
      <CardsResumo 
        totalInvestido={totalInvestido}
        valorImovel={valorImovel}
        lucro={latestData.lucroLiquidoComComissao}
        retornoPercentual={latestData.lucroLiquidoComComissao / totalInvestido}
        latestData={latestData}
        meses={detalhes.length}
        totalJurosPagos={totalJurosPagos}
        totalJurosParcelas={totalJurosParcelas}
        totalJurosReforcos={totalJurosReforcos}
        valorImovelMaisJuros={valorImovelMaisJuros}
        valorCompra={valorCompra}
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
