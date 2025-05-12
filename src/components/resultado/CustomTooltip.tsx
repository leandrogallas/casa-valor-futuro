
import React from "react";
import { TooltipProps } from "recharts";
import { formatarMoeda } from "@/utils/investmentCalculator";

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border rounded-md shadow-md">
        <p className="font-semibold">{`Mês: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${formatarMoeda(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
