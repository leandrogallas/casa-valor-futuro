
import React from "react";
import { ResponsiveContainer, CartesianGrid, Legend, Bar, Line, XAxis, YAxis, Tooltip, ComposedChart } from "recharts";
import CustomTooltip, { formatters } from "./CustomTooltip";
import { DetalhesMesProcessado } from "@/types/simulador";

interface GraficoMensalProps {
  detalhesProcessed: DetalhesMesProcessado[];
}

const GraficoMensal: React.FC<GraficoMensalProps> = ({ detalhesProcessed }) => {
  return (
    <ResponsiveContainer>
      <ComposedChart data={detalhesProcessed.filter((_,i) => i % 3 === 0)}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
        <XAxis dataKey="mes" />
        <YAxis 
          tickFormatter={(value) => `${new Intl.NumberFormat('pt-BR', {
            notation: 'compact',
            compactDisplay: 'short',
          }).format(value)}`}
        />
        <Tooltip 
          content={
            <CustomTooltip 
              formatters={{
                ganhoCapitalMensal: formatters.currency,
                ganhoCapitalAcumulado: formatters.currency
              }}
            />
          } 
        />
        <Legend verticalAlign="top" height={36} />
        <Bar 
          dataKey="ganhoCapitalMensal" 
          name="Ganho Capital Mensal" 
          fill="#FEC6A1"
          barSize={20}
        />
        <Line 
          type="monotone" 
          dataKey="ganhoCapitalAcumulado" 
          name="Ganho Capital Acumulado" 
          stroke="#F97316" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GraficoMensal;
