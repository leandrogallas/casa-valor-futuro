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
    totalReforcos
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
      
      // Ganho capital é a valorização do imóvel menos o valor de compra
      const ganhoCapital = mes.valorImovel - valorCompra;
      
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
      
      // Ganho real é a valorização menos os juros pagos
      const ganhoReal = ganhoCapital - jurosPagos - jurosReforcosPagos;
      
      // Lucro líquido é o ganho real
      const lucroLiquido = ganhoReal;
      
      // Lucro líquido após comissão (5% do valor do imóvel final)
      const taxaComissao = 0.05; // 5%
      const comissao = mes.valorImovel * taxaComissao;
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // Valorização prevista (acumulada desde o início)
      const valorizacaoPrevista = mes.valorImovel - detalhes[0].valorImovel;
      
      detalhesProcessed.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado: ganhoCapital, 
        ganhoReal,
        jurosPagos,
        jurosMesPago,
        jurosReforcosPagos,
        jurosReforcoMesPago,
        lucroLiquido,
        lucroLiquidoComComissao,
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
  
  // FIXED CALCULATION: Valor da parcela sem correção
  // This should be the total amount to be paid in parcels (principal only) divided by number of months
  const valorParcelaSemCorrecao = (valorCompra - totalEntrada) / detalhes.length;
  
  // Número total de parcelas (igual ao número de meses)
  const numeroParcelas = detalhes.length;
  
  // Número de reforços (anos)
  const numeroReforcos = Math.floor(detalhes.length / 12);
  
  // FIXED CALCULATION: Valor do reforço sem correção 
  // This should be the total reinforcement amount divided by number of reinforcements
  const valorReforcoSemCorrecao = numeroReforcos > 0 ? resultado.totalReforcos / numeroReforcos : 0;
  
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
        valorParcelaSemCorrecao={valorParcelaSemCorrecao}
        numeroParcelas={numeroParcelas}
        numeroReforcos={numeroReforcos}
        valorReforcoSemCorrecao={valorReforcoSemCorrecao}
      />
      
      <GraficoResultado 
        detalhesProcessed={detalhesProcessed}
        yearlyData={yearlyData}
      />
    </div>
  );
};

export default ResultadoInvestimento;
