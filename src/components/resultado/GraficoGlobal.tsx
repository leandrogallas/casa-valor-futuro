
import React from "react";
import { ResponsiveContainer, CartesianGrid, Legend, Line, XAxis, YAxis, Tooltip, ComposedChart } from "recharts";
import CustomTooltip from "./CustomTooltip";

interface GraficoGlobalProps {
  detalhesProcessed: any[];
}

const GraficoGlobal: React.FC<GraficoGlobalProps> = ({ detalhesProcessed }) => {
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
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Line 
          type="monotone" 
          dataKey="valorImovel" 
          name="Valor Imóvel" 
          stroke="#9b87f5" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="investido" 
          name="Total Investido" 
          stroke="#7E69AB" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="saldoDevedor" 
          name="Saldo Devedor" 
          stroke="#F97316" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="ganhoReal" 
          name="Ganho Real" 
          stroke="#0EA5E9" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GraficoGlobal;
