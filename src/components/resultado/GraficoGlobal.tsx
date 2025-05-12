
import React from "react";
import { DetalhesMesProcessado } from "@/types/simulador";
import GraficoBase, { SeriesConfig } from "./grafico/GraficoBase";
import { formatters } from "./CustomTooltip";

interface GraficoGlobalProps {
  detalhesProcessed: DetalhesMesProcessado[];
}

const GraficoGlobal: React.FC<GraficoGlobalProps> = ({ detalhesProcessed }) => {
  const series: SeriesConfig[] = [
    {
      dataKey: "valorImovel",
      name: "Valor Imóvel",
      color: "#9b87f5",
      type: "line",
      formatter: formatters.currency
    },
    {
      dataKey: "investido",
      name: "Total Investido",
      color: "#7E69AB",
      type: "line",
      formatter: formatters.currency
    },
    {
      dataKey: "saldoDevedor",
      name: "Saldo Devedor",
      color: "#F97316",
      type: "line",
      formatter: formatters.currency
    },
    {
      dataKey: "ganhoReal",
      name: "Ganho Real",
      color: "#0EA5E9",
      type: "line",
      formatter: formatters.currency
    },
    {
      dataKey: "jurosPagos",
      name: "Juros Pagos",
      color: "#EF4444",
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

export default GraficoGlobal;
