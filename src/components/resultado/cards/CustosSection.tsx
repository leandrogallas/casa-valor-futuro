
import React from "react";
import { Coins, Calculator, Building, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import { formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";

interface CustosSectionProps {
  totalJurosParcelas: number;
  totalJurosReforcos: number;
  totalJurosPagos: number;
  valorCompra: number;
}

const CustosSection: React.FC<CustosSectionProps> = ({
  totalJurosParcelas,
  totalJurosReforcos,
  totalJurosPagos,
  valorCompra
}) => {
  return (
    <Card className="shadow-md border-t-4 border-t-red-500">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-red-700">
          <Coins className="mr-2" /> 
          Custos da Operação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <MetricCard
            title="Juros das Parcelas"
            value={formatarMoeda(totalJurosParcelas)}
            icon={<div className="bg-red-500 p-2 rounded-full text-white">
              <Calculator size={20} />
            </div>}
            bgColor="from-red-50 to-white"
            subtitle={`${formatarPercentual(totalJurosParcelas / totalJurosPagos * 100)} do total de juros`}
          />
          
          <MetricCard
            title="Juros dos Reforços"
            value={formatarMoeda(totalJurosReforcos)}
            icon={<div className="bg-orange-500 p-2 rounded-full text-white">
              <Calculator size={20} />
            </div>}
            bgColor="from-orange-50 to-white"
            subtitle={`${formatarPercentual(totalJurosReforcos / totalJurosPagos * 100)} do total de juros`}
          />
          
          <MetricCard
            title="Total de Juros"
            value={formatarMoeda(totalJurosPagos)}
            icon={<div className="bg-pink-500 p-2 rounded-full text-white">
              <Landmark size={20} />
            </div>}
            bgColor="from-pink-50 to-white"
            subtitle="Parcelas + Reforços"
          />
          
          <MetricCard
            title="Custo Total do Imóvel"
            value={formatarMoeda(valorCompra + totalJurosPagos)}
            icon={<div className="bg-rose-500 p-2 rounded-full text-white">
              <Building size={20} />
            </div>}
            bgColor="from-rose-50 to-white"
            subtitle={`Valor inicial (${formatarMoeda(valorCompra)}) + Total de juros`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CustosSection;
