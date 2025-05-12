
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

  const { totalInvestido, valorImovel, lucro, retornoPercentual, detalhes } = resultado;

  // Calculate additional metrics for each month
  const detalhesProcessed = detalhes.map((mes, index) => {
    const mesAnterior = index > 0 ? detalhes[index - 1] : null;
    
    // Monthly capital gain
    const ganhoCapitalMensal = mesAnterior 
      ? mes.valorImovel - mesAnterior.valorImovel 
      : mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    // Real gain (value - invested - debt)
    const ganhoReal = mes.valorImovel - mes.investido;
    
    // Net profit (considering closing costs would be about 5%)
    const lucroLiquido = Math.max(0, mes.valorImovel * 0.95 - mes.investido);
    
    // Valorização prevista (accumulated since start)
    const valorizacaoPrevista = mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    return {
      ...mes,
      ganhoCapitalMensal,
      ganhoCapitalAcumulado: mes.valorImovel - resultado.detalhes[0].valorImovel,
      ganhoReal,
      lucroLiquido,
      valorizacaoPrevista
    } as DetalhesMesProcessado;
  });

  // Latest data for cards
  const latestData = detalhesProcessed[detalhesProcessed.length - 1];
  
  // Get data for specific years to display in the table (yearly increments)
  const yearlyData = detalhesProcessed.filter(item => item.mes % 12 === 0 || item.mes === 1 || item.mes === detalhesProcessed.length);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-investment-dark">Resumo da Simulação</h2>
      
      <CardsResumo 
        totalInvestido={totalInvestido}
        valorImovel={valorImovel}
        lucro={lucro}
        retornoPercentual={retornoPercentual}
        latestData={latestData}
      />
      
      <GraficoResultado 
        detalhesProcessed={detalhesProcessed}
        yearlyData={yearlyData}
      />
    </div>
  );
};

export default ResultadoInvestimento;
