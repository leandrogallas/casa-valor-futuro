
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
    valorCompra 
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
      
      // Ganho real é apenas a valorização do imóvel
      const ganhoReal = mes.valorImovel - detalhes[0].valorImovel;
      
      // Juros pagos são a parte da parcela que não amortiza a dívida
      // Calculamos o juro com base na taxa sobre o saldo devedor anterior
      const jurosMesPago = index > 0 
        ? (mesAnterior.saldoDevedor * (Math.pow(1 + resultado.taxaCorrecao, 1/12) - 1)) 
        : 0;
      
      // Calcular o juro acumulado até este mês (soma de todos os juros pagos até agora)
      const jurosPagos = index > 0 
        ? detalhesProcessed[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // Juros relacionados aos reforços para este mês específico
      const jurosReforcoMesPago = mes.temReforco && index > 0
        ? (resultado.totalJurosReforcos / Math.floor(detalhes.length / 12)) * (Math.floor(index / 12) + 1) / Math.floor(detalhes.length / 12)
        : 0;
      
      // Juros acumulados relacionados aos reforços
      const jurosReforcosPagos = index > 0
        ? detalhesProcessed[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // Lucro líquido é a diferença entre o ganho real (valorização) e os juros pagos (parcelas + reforços)
      const lucroLiquido = ganhoReal - jurosPagos - jurosReforcosPagos;
      
      // Valorização prevista (acumulada desde o início)
      const valorizacaoPrevista = mes.valorImovel - detalhes[0].valorImovel;
      
      detalhesProcessed.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado: ganhoReal, // Mesmo que ganhoReal
        ganhoReal,
        jurosPagos,
        jurosMesPago,
        jurosReforcosPagos,
        jurosReforcoMesPago,
        lucroLiquido,
        valorizacaoPrevista,
        temReforco: mes.temReforco
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
        totalJurosParcelas={totalJurosParcelas}
        totalJurosReforcos={totalJurosReforcos}
        valorImovelMaisJuros={valorImovelMaisJuros}
        valorCompra={valorCompraFinal}
        resultado={resultado}
      />
      
      <GraficoResultado 
        detalhesProcessed={detalhesProcessed}
        yearlyData={yearlyData}
      />
    </div>
  );
};

export default ResultadoInvestimento;
