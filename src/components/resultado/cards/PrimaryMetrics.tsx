
import React from "react";
import { ArrowUp, ArrowDown, DollarSign, Calendar } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";

interface PrimaryMetricsProps {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
}

const PrimaryMetrics: React.FC<PrimaryMetricsProps> = ({
  totalInvestido,
  valorImovel,
  lucro,
  retornoPercentual
}) => {
  const isLucro = lucro > 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Total Investido"
        value={formatarMoeda(totalInvestido)}
        icon={<div className="bg-blue-500 p-2 rounded-full text-white">
          <DollarSign size={20} />
        </div>}
        bgColor="from-blue-50 to-white"
      />

      <MetricCard
        title="Valor Final do Imóvel"
        value={formatarMoeda(valorImovel)}
        icon={<div className="bg-purple-500 p-2 rounded-full text-white">
          <Calendar size={20} />
        </div>}
        bgColor="from-purple-50 to-white"
      />

      <MetricCard
        title="Lucro/Prejuízo"
        value={formatarMoeda(lucro)}
        icon={<div className={`p-2 rounded-full text-white ${isLucro ? 'bg-green-500' : 'bg-red-500'}`}>
          {isLucro ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
        </div>}
        bgColor={isLucro ? 'from-green-50 to-white' : 'from-red-50 to-white'}
        textColor={isLucro ? 'text-green-600' : 'text-red-600'}
      />

      <MetricCard
        title="Retorno sobre Investimento"
        value={formatarPercentual(retornoPercentual)}
        icon={<div className={`p-2 rounded-full text-white ${isLucro ? 'bg-green-500' : 'bg-red-500'}`}>
          {isLucro ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
        </div>}
        bgColor={isLucro ? 'from-green-50 to-white' : 'from-red-50 to-white'}
        textColor={isLucro ? 'text-green-600' : 'text-red-600'}
      />
    </div>
  );
};

export default PrimaryMetrics;
