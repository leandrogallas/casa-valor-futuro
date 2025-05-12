
import React from "react";
import { Calculator, PieChart, TrendingUp, DollarSign } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatarMoeda } from "@/utils/investmentCalculator";
import { DetalhesMesProcessado } from "@/types/simulador";

interface DetailedMetricsProps {
  latestData: DetalhesMesProcessado;
}

const DetailedMetrics: React.FC<DetailedMetricsProps> = ({ latestData }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Saldo Devedor"
        value={formatarMoeda(latestData.saldoDevedor)}
        icon={<div className="bg-blue-500 p-2 rounded-full text-white">
          <Calculator size={20} />
        </div>}
        bgColor="from-blue-50 to-white"
      />
      
      <MetricCard
        title="Valorização Prevista"
        value={formatarMoeda(latestData.valorizacaoPrevista)}
        icon={<div className="bg-purple-500 p-2 rounded-full text-white">
          <PieChart size={20} />
        </div>}
        bgColor="from-purple-50 to-white"
      />

      <MetricCard
        title="Ganho Capital Acumulado"
        value={formatarMoeda(latestData.ganhoCapitalAcumulado)}
        icon={<div className="bg-amber-500 p-2 rounded-full text-white">
          <TrendingUp size={20} />
        </div>}
        bgColor="from-amber-50 to-white"
      />

      <MetricCard
        title="Ganho Real (Líquido)"
        value={formatarMoeda(latestData.lucroLiquido)}
        icon={<div className="bg-green-500 p-2 rounded-full text-white">
          <DollarSign size={20} />
        </div>}
        bgColor="from-green-50 to-white"
      />
    </div>
  );
};

export default DetailedMetrics;
