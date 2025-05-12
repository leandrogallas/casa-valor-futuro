
import React from "react";
import { formatarPercentual } from "@/utils/investmentCalculator";
import PrimaryMetrics from "./cards/PrimaryMetrics";
import DetailedMetrics from "./cards/DetailedMetrics";
import ExtraMetrics from "./cards/ExtraMetrics";
import { DetalhesMesProcessado } from "@/types/simulador";

interface CardsResumoProps {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
  latestData: DetalhesMesProcessado;
  meses: number;
  totalJurosPagos: number;
  valorImovelMaisJuros: number;
  valorCompra: number;
}

const CardsResumo: React.FC<CardsResumoProps> = ({ 
  totalInvestido, 
  valorImovel, 
  lucro, 
  retornoPercentual,
  latestData,
  meses,
  totalJurosPagos,
  valorImovelMaisJuros,
  valorCompra
}) => {
  // Cálculo da valorização mensal em percentual
  const valorizacaoMensalPercent = retornoPercentual / meses;
  
  // Cálculo da valorização mensal em R$
  const valorizacaoMensalReais = latestData.lucroLiquido / meses;
  
  return (
    <>
      {/* Primary Metrics */}
      <PrimaryMetrics 
        totalInvestido={totalInvestido}
        valorImovel={valorImovel}
        lucro={lucro}
        retornoPercentual={retornoPercentual}
      />

      {/* Detailed Metrics */}
      <DetailedMetrics latestData={latestData} />

      {/* Extra Metrics: Valorização Mensal, Juros Pagos, e Valor Imóvel + Juros */}
      <ExtraMetrics 
        valorizacaoMensalPercent={valorizacaoMensalPercent}
        valorizacaoMensalReais={valorizacaoMensalReais}
        totalJurosPagos={totalJurosPagos}
        valorImovelMaisJuros={valorImovelMaisJuros}
        valorCompra={valorCompra}
      />
    </>
  );
};

export default CardsResumo;
