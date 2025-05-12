
import React from "react";
import { ChartContainer, ChartConfig } from "@/components/ui/chart";
import GraficoGlobal from "../GraficoGlobal";
import GraficoMensal from "../GraficoMensal";
import GraficoComparativo from "../GraficoComparativo";
import { DetalhesMesProcessado } from "@/types/simulador";

interface GraficoWrapperProps {
  chartView: "global" | "monthly" | "comparative";
  chartConfig: ChartConfig;
  detalhesProcessed: DetalhesMesProcessado[];
}

const GraficoWrapper: React.FC<GraficoWrapperProps> = ({
  chartView,
  chartConfig,
  detalhesProcessed
}) => {
  // Renderizar o gráfico apropriado com base no chartView
  const renderChart = () => {
    switch(chartView) {
      case "global":
        return <GraficoGlobal detalhesProcessed={detalhesProcessed} />;
      case "monthly":
        return <GraficoMensal detalhesProcessed={detalhesProcessed} />;
      case "comparative":
        return <GraficoComparativo detalhesProcessed={detalhesProcessed} />;
      default:
        return null;
    }
  };

  return (
    <ChartContainer config={chartConfig} className="h-full">
      {renderChart()}
    </ChartContainer>
  );
};

export default GraficoWrapper;
