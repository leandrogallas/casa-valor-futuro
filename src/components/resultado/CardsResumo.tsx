
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
  // Cálculo da valorização mensal em percentual
  const valorizacaoMensalPercent = retornoPercentual / meses;
  
  // Cálculo da valorização mensal em R$
  const valorizacaoMensalReais = lucro / meses;

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
        totalInvestido={totalInvestido} // Pass totalInvestido to CustosSection
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
