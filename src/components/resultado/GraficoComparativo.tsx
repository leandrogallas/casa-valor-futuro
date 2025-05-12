
import React from "react";
import { DetalhesMesProcessado } from "@/types/simulador";
import GraficoBase, { SeriesConfig } from "./grafico/GraficoBase";
import { formatters } from "./CustomTooltip";

interface GraficoComparativoProps {
  detalhesProcessed: DetalhesMesProcessado[];
}

const GraficoComparativo: React.FC<GraficoComparativoProps> = ({ detalhesProcessed }) => {
  const series: SeriesConfig[] = [
    {
      dataKey: "valorImovel",
      name: "Valor do Imóvel",
      color: "#9b87f5",
      type: "line",
      formatter: formatters.currency
    },
    {
      dataKey: "valorizacaoPrevista",
      name: "Valorização Prevista",
      color: "#8884d8",
      type: "line",
      formatter: formatters.currency
    },
    {
      dataKey: "lucroLiquido",
      name: "Lucro Líquido",
      color: "#22C55E",
      type: "line",
      formatter: formatters.currency
    }
  ];

  return (
    <GraficoBase 
      data={detalhesProcessed}
      series={series}
    />
  );
};

export default GraficoComparativo;
