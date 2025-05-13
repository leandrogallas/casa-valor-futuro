
import React from "react";
import { ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DetalhesMesProcessado } from "@/types/simulador";
import NegocioSection from "./cards/NegocioSection";
import CustosSection from "./cards/CustosSection";
import ValorizacaoSection from "./cards/ValorizacaoSection";

interface CardsResumoProps {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
  latestData: DetalhesMesProcessado;
  meses: number;
  totalJurosPagos: number;
  totalJurosParcelas: number;
  totalJurosReforcos: number;
  valorImovelMaisJuros: number;
  valorCompra: number;
  resultado: ResultadoSimulacao;
  valorParcelaSemCorrecao: number;
  numeroParcelas: number;
  numeroReforcos: number;
  valorReforcoSemCorrecao: number;
  cubInicial?: number;
  cubFinal?: number;
  indiceCubFinal?: number;
}

const CardsResumo: React.FC<CardsResumoProps> = ({
  totalInvestido,
  valorImovel,
  lucro,
  retornoPercentual,
  latestData,
  meses,
  totalJurosPagos,
  totalJurosParcelas,
  totalJurosReforcos,
  valorImovelMaisJuros,
  valorCompra,
  resultado,
  valorParcelaSemCorrecao,
  numeroParcelas,
  numeroReforcos,
  valorReforcoSemCorrecao,
  cubInicial,
  cubFinal,
  indiceCubFinal
}) => {
  // Correção do cálculo da valorização mensal em percentual
  // Calculamos a taxa mensal equivalente a partir da taxa anual
  const valorizacaoAnual = resultado.valorizacao;
  const valorizacaoMensalPercent = Math.pow(1 + valorizacaoAnual, 1/12) - 1;
  
  // CORRIGIDO: Cálculo da valorização mensal em R$
  // Usa o ganho de capital total dividido pelo número de meses
  const ganhoCapitalTotal = valorImovel - valorCompra;
  const valorizacaoMensalReais = ganhoCapitalTotal / meses;

  return (
    <div className="space-y-8">
      {/* Seção 1: Detalhes do negócio */}
      <NegocioSection
        valorCompra={valorCompra}
        totalEntrada={resultado.totalEntrada}
        numeroParcelas={numeroParcelas}
        meses={meses}
        valorParcelaSemCorrecao={valorParcelaSemCorrecao}
        numeroReforcos={numeroReforcos}
        valorReforcoSemCorrecao={valorReforcoSemCorrecao}
      />

      {/* Seção 2: Custos da operação */}
      <CustosSection
        totalJurosParcelas={totalJurosParcelas}
        totalJurosReforcos={totalJurosReforcos}
        totalJurosPagos={totalJurosPagos}
        valorCompra={valorCompra}
        totalInvestido={totalInvestido}
        cubInicial={cubInicial}
        cubFinal={cubFinal}
        indiceCubFinal={indiceCubFinal}
      />

      {/* Seção 3: Valorização do Imóvel */}
      <ValorizacaoSection
        valorImovel={valorImovel}
        lucro={lucro}
        valorizacaoMensalPercent={valorizacaoMensalPercent}
        valorizacaoMensalReais={valorizacaoMensalReais}
        latestData={latestData}
        meses={meses}
        resultado={resultado}
      />
    </div>
  );
};

export default CardsResumo;
