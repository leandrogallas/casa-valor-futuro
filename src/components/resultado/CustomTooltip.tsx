
import React from "react";
import { TooltipProps } from "recharts";
import { formatarMoeda } from "@/utils/investmentCalculator";

export type TooltipFormatter = (value: number) => string;

export interface CustomTooltipProps extends TooltipProps<number, string> {
  formatters?: Record<string, TooltipFormatter>;
  defaultFormatter?: TooltipFormatter;
}

// Predefined formatters
export const formatters = {
  currency: (value: number) => formatarMoeda(value),
  percentage: (value: number) => `${(value * 100).toFixed(2)}%`,
  number: (value: number) => value.toLocaleString('pt-BR'),
  integer: (value: number) => Math.round(value).toLocaleString('pt-BR')
};

const CustomTooltip = ({ 
  active, 
  payload, 
  label,
  formatters: customFormatters = {},
  defaultFormatter = formatters.currency
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Combine default formatters with custom formatters
    const allFormatters = { ...formatters, ...customFormatters };
    
    return (
      <div className="bg-white p-4 border rounded-md shadow-md">
        <p className="font-semibold">{`Mês: ${label}`}</p>
        {payload.map((entry: any, index: number) => {
          const dataKey = entry.dataKey || entry.name;
          // Use specific formatter for this dataKey or default formatter
          const formatter = allFormatters[dataKey] || defaultFormatter;
          const formattedValue = formatter(entry.value);
          
          return (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formattedValue}`}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
