
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

  // Calculate additional metrics for each month in a way that avoids circular references
  const detalhesProcessed: DetalhesMesProcessado[] = [];
  
  detalhes.forEach((mes, index) => {
    const mesAnterior = index > 0 ? detalhes[index - 1] : null;
    
    // Monthly capital gain (valorização do mês)
    const ganhoCapitalMensal = mesAnterior 
      ? mes.valorImovel - mesAnterior.valorImovel 
      : mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    // Ganho real é apenas a valorização do imóvel
    const ganhoReal = mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    // Juros pagos são a parte da parcela que não amortiza a dívida
    // Se não tivermos o detalhe dos juros, usamos uma estimativa baseada na taxa de correção
    const jurosMesPago = index > 0 ? 
      (mesAnterior.saldoDevedor * (Math.pow(1 + resultado.taxaCorrecao, 1/12) - 1)) : 0;
    
    // Calcular o juro acumulado até este mês (soma de todos os juros pagos até agora)
    // Use the previously calculated item in detalhesProcessed array
    const jurosPagos = index > 0 
      ? detalhesProcessed[index - 1].jurosPagos + jurosMesPago 
      : jurosMesPago;
    
    // Lucro líquido é a diferença entre o ganho real (valorização) e os juros pagos
    const lucroLiquido = ganhoReal - jurosPagos;
    
    // Valorização prevista (acumulada desde o início)
    const valorizacaoPrevista = mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    detalhesProcessed.push({
      ...mes,
      ganhoCapitalMensal,
      ganhoCapitalAcumulado: ganhoReal, // Mesmo que ganhoReal
      ganhoReal,
      jurosPagos,
      jurosMesPago, // Adicionando o juro mensal individual
      lucroLiquido,
      valorizacaoPrevista
    });
  });

  // Latest data for cards
  const latestData = detalhesProcessed[detalhesProcessed.length - 1];
  
  // Calculate the sum of all interest paid
  const totalJurosPagos = latestData.jurosPagos; // Agora usamos o valor acumulado do último mês
  
  // Get the valor compra, using the initial value of the property or the first month's value as fallback
  const valorCompra = 'valorCompra' in resultado 
    ? resultado.valorCompra 
    : resultado.detalhes[0].valorImovel;
  
  // Calculate the sum of property purchase price and total interest paid
  const valorImovelMaisJuros = valorCompra + totalJurosPagos;
  
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
        meses={detalhes.length}
        totalJurosPagos={totalJurosPagos}
        valorImovelMaisJuros={valorImovelMaisJuros}
        valorCompra={valorCompra}
      />
      
      <GraficoResultado 
        detalhesProcessed={detalhesProcessed}
        yearlyData={yearlyData}
      />
    </div>
  );
};

export default ResultadoInvestimento;
