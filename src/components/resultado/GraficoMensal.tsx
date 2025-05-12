
import React from "react";
import { DetalhesMesProcessado } from "@/types/simulador";
import GraficoBase, { SeriesConfig } from "./grafico/GraficoBase";
import { formatters } from "./CustomTooltip";

interface GraficoMensalProps {
  detalhesProcessed: DetalhesMesProcessado[];
}

const GraficoMensal: React.FC<GraficoMensalProps> = ({ detalhesProcessed }) => {
  const series: SeriesConfig[] = [
    {
      dataKey: "ganhoCapitalMensal",
      name: "Ganho Capital Mensal",
      color: "#FEC6A1",
      type: "bar",
      barSize: 20,
      formatter: formatters.currency
    },
    {
      dataKey: "ganhoCapitalAcumulado",
      name: "Ganho Capital Acumulado",
      color: "#F97316",
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

export default GraficoMensal;
