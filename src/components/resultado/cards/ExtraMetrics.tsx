
import React from "react";
import { Percent, DollarSign, Calculator } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";

interface ExtraMetricsProps {
  valorizacaoMensalPercent: number;
  valorizacaoMensalReais: number;
  totalJurosPagos: number;
  valorImovelMaisJuros: number;
  valorCompra: number;
}

const ExtraMetrics: React.FC<ExtraMetricsProps> = ({
  valorizacaoMensalPercent,
  valorizacaoMensalReais,
  totalJurosPagos,
  valorImovelMaisJuros,
  valorCompra
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <MetricCard
        title="Valorização Mensal"
        value={formatarPercentual(valorizacaoMensalPercent)}
        icon={<div className="bg-cyan-500 p-2 rounded-full text-white">
          <Percent size={20} />
        </div>}
        bgColor="from-cyan-50 to-white"
      />
      
      <MetricCard
        title="Valorização R$ por mês"
        value={formatarMoeda(valorizacaoMensalReais)}
        icon={<div className="bg-emerald-500 p-2 rounded-full text-white">
          <DollarSign size={20} />
        </div>}
        bgColor="from-emerald-50 to-white"
      />
      
      <MetricCard
        title="Total de Juros Pagos"
        value={formatarMoeda(totalJurosPagos)}
        icon={<div className="bg-red-500 p-2 rounded-full text-white">
          <Calculator size={20} />
        </div>}
        bgColor="from-red-50 to-white"
      />
      
      <MetricCard
        title="Valor Imóvel + Juros"
        value={formatarMoeda(valorImovelMaisJuros)}
        icon={<div className="bg-orange-500 p-2 rounded-full text-white">
          <Calculator size={20} />
        </div>}
        bgColor="from-orange-50 to-white"
        subtitle={`(${formatarMoeda(valorCompra)} + ${formatarMoeda(totalJurosPagos)})`}
      />
    </div>
  );
};

export default ExtraMetrics;
