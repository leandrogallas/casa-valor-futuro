
import React from "react";
import { ResultadoSimulacao, formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";
import CardsResumo from "./resultado/CardsResumo";
import GraficoResultado from "./resultado/GraficoResultado";
import { DetalhesMesProcessado } from "@/types/simulador";

interface ResultadoInvestimentoProps {
  resultado: ResultadoSimulacao | null;
}

const ResultadoInvestimento: React.FC<ResultadoInvestimentoProps> = ({ resultado }) => {
  if (!resultado) return null;

  // Extrair valores do resultado
  const { 
    totalInvestido, 
    valorImovel, 
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

  // Calcular métricas adicionais com DEFINIÇÕES PADRONIZADAS
  const detalhesProcessed: DetalhesMesProcessado[] = [];
  
  if (detalhes && detalhes.length > 0) {
    // Variáveis para cálculos padronizados
    const meses = detalhes.length;
    const valorParcelaSemCorrecao = resultado.parcelas / meses;
    const numReforcos = Math.floor(meses / 12);
    const valorReforcoSemCorrecao = numReforcos > 0 ? resultado.reforcos / numReforcos : 0;
    
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // 1. Ganho de capital mensal
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - valorCompra;
      
      // 2. Ganho de capital acumulado (DEFINIÇÃO PADRONIZADA)
      const ganhoCapitalAcumulado = mes.valorImovel - valorCompra;
      
      // 3. Juros pagos no mês
      const indiceCub = mes.indiceCubMensal || 1;
      const jurosMesPago = (mes.parcelaMensal - valorParcelaSemCorrecao);
      
      // 4. Juros acumulados
      const jurosPagos = index > 0 
        ? detalhesProcessed[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // 5. Juros de reforço no mês - PADRONIZADO
      const jurosReforcoMesPago = mes.temReforco 
        ? ((valorReforcoSemCorrecao * indiceCub) - valorReforcoSemCorrecao)
        : 0;
      
      // 6. Juros de reforços acumulados
      const jurosReforcosPagos = index > 0
        ? detalhesProcessed[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // 7. Total de juros acumulados
      const totalJurosAcumulados = jurosPagos + jurosReforcosPagos;
      
      // 8. Ganho real (DEFINIÇÃO PADRONIZADA)
      const ganhoReal = ganhoCapitalAcumulado - totalJurosAcumulados;
      
      // 9. Comissão (5% do valor do imóvel)
      const comissao = mes.valorImovel * 0.05;
      
      // 10. Lucro líquido (DEFINIÇÃO PADRONIZADA)
      const lucroLiquido = ganhoReal;
      
      // 11. Lucro líquido após comissão (DEFINIÇÃO PADRONIZADA)
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // 12. Valorização prevista
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

  // Verificar se temos dados processados
  if (detalhesProcessed.length === 0) return null;
  
  // Utilizar os dados do último mês para os cartões
  const latestData = detalhesProcessed[detalhesProcessed.length - 1];
  
  // DEFINIÇÕES PADRONIZADAS para cálculos globais
  // 1. Total de juros pagos = juros parcelas + juros reforços
  const totalJurosPagos = totalJurosParcelas + totalJurosReforcos;
  
  // 2. Ganho de capital = valor final do imóvel - valor de compra
  const ganhoCapital = valorImovel - valorCompra;
  
  // 3. Ganho real = ganho de capital - total de juros pagos
  const ganhoReal = ganhoCapital - totalJurosPagos;
  
  // 4. Valor do imóvel mais juros = valor de compra + total de juros
  const valorImovelMaisJuros = valorCompra + totalJurosPagos;
  
  // Cálculos para parcelas e reforços
  const valorParcelaSemCorrecao = resultado.parcelas / detalhes.length;
  const numeroParcelas = detalhes.length;
  const numeroReforcos = Math.floor(detalhes.length / 12);
  const valorReforcoSemCorrecao = numeroReforcos > 0 ? resultado.reforcos / numeroReforcos : 0;
  
  // Selecionar dados para exibição na tabela (incrementos anuais)
  const yearlyData = detalhesProcessed.filter(item => item.mes % 12 === 0 || item.mes === 1 || item.mes === detalhesProcessed.length);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-investment-dark">Resumo da Simulação</h2>
      
      <CardsResumo 
        totalInvestido={totalInvestido}
        valorImovel={valorImovel}
        lucro={latestData.lucroLiquidoComComissao} // Usando o valor mais recente calculado com definições padronizadas
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
