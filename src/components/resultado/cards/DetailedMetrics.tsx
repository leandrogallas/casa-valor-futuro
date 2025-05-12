
import React from "react";
import { Calculator, PieChart, TrendingUp, DollarSign, PlusCircle, ShieldAlert } from "lucide-react";
import MetricCard from "./MetricCard";
import { formatarMoeda } from "@/utils/investmentCalculator";
import { DetalhesMesProcessado } from "@/types/simulador";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DetailedMetricsProps {
  latestData: DetalhesMesProcessado;
  totalEntrada: number;
  totalParcelas: number;
  totalReforcos: number;
}

const DetailedMetrics: React.FC<DetailedMetricsProps> = ({ 
  latestData,
  totalEntrada,
  totalParcelas,
  totalReforcos
}) => {
  return (
    <>
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

      {/* Detalhamento de Investimento */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <ShieldAlert className="mr-2 h-5 w-5 text-investment-dark" />
          Detalhamento do Investimento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="Entrada"
            value={formatarMoeda(totalEntrada)}
            icon={<div className="bg-indigo-500 p-2 rounded-full text-white">
              <DollarSign size={20} />
            </div>}
            bgColor="from-indigo-50 to-white"
          />
          
          <MetricCard
            title="Total de Parcelas"
            value={formatarMoeda(totalParcelas)}
            icon={<div className="bg-cyan-500 p-2 rounded-full text-white">
              <Calculator size={20} />
            </div>}
            bgColor="from-cyan-50 to-white"
          />
          
          <MetricCard
            title="Total de Reforços"
            value={formatarMoeda(totalReforcos)}
            icon={<div className="bg-teal-500 p-2 rounded-full text-white">
              <PlusCircle size={20} />
            </div>}
            bgColor="from-teal-50 to-white"
            subtitle={latestData.temReforco ? "Incluído reforço neste mês" : ""}
          />
        </div>
      </div>
    </>
  );
};

export default DetailedMetrics;
