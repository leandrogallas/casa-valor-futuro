
import React from "react";
import { ResponsiveContainer, CartesianGrid, Legend, Line, XAxis, YAxis, Tooltip, ComposedChart } from "recharts";
import CustomTooltip from "./CustomTooltip";

interface GraficoComparativoProps {
  detalhesProcessed: any[];
}

const GraficoComparativo: React.FC<GraficoComparativoProps> = ({ detalhesProcessed }) => {
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
          name="Valor do Imóvel" 
          stroke="#9b87f5" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="valorizacaoPrevista" 
          name="Valorização Prevista" 
          stroke="#8884d8" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="lucroLiquido" 
          name="Lucro Líquido" 
          stroke="#22C55E" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GraficoComparativo;
