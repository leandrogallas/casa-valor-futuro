
import React from "react";
import { ResponsiveContainer, CartesianGrid, Legend, Line, Bar, XAxis, YAxis, Tooltip, ComposedChart } from "recharts";
import CustomTooltip, { formatters, TooltipFormatter } from "../CustomTooltip";
import { DetalhesMesProcessado } from "@/types/simulador";

export interface SeriesConfig {
  dataKey: string;
  name: string;
  color: string;
  type: 'line' | 'bar';
  strokeWidth?: number;
  dot?: boolean | object;
  barSize?: number;
  formatter?: TooltipFormatter;
}

interface GraficoBaseProps {
  data: DetalhesMesProcessado[];
  series: SeriesConfig[];
  tooltipFormatters?: Record<string, TooltipFormatter>;
  filterData?: (item: DetalhesMesProcessado, index: number, array: DetalhesMesProcessado[]) => boolean;
}

const GraficoBase: React.FC<GraficoBaseProps> = ({ 
  data, 
  series, 
  tooltipFormatters = {}, 
  filterData = (_, i) => i % 3 === 0 
}) => {
  const filteredData = data.filter(filterData);
  
  // Constrói formatters para o tooltip a partir da configuração das séries
  const tooltipSeriesFormatters = series.reduce((acc, serie) => {
    if (serie.formatter) {
      acc[serie.dataKey] = serie.formatter;
    }
    return acc;
  }, {...tooltipFormatters});

  return (
    <ResponsiveContainer>
      <ComposedChart data={filteredData}>
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
              formatters={tooltipSeriesFormatters}
              defaultFormatter={formatters.currency}
            />
          } 
        />
        <Legend verticalAlign="top" height={36} />
        
        {series.map((serie, index) => (
          serie.type === 'line' ? (
            <Line 
              key={`${serie.dataKey}-${index}`}
              type="monotone" 
              dataKey={serie.dataKey} 
              name={serie.name} 
              stroke={serie.color} 
              strokeWidth={serie.strokeWidth || 2}
              dot={serie.dot === undefined ? false : serie.dot}
              activeDot={{ r: 6 }}
            />
          ) : (
            <Bar 
              key={`${serie.dataKey}-${index}`}
              dataKey={serie.dataKey} 
              name={serie.name} 
              fill={serie.color}
              barSize={serie.barSize || 20}
            />
          )
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default GraficoBase;
