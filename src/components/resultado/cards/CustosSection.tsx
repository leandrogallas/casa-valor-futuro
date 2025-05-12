
import React from "react";
import { Coins, Calculator, Building, Landmark, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import { formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";

interface CustosSectionProps {
  totalJurosParcelas: number;
  totalJurosReforcos: number;
  totalJurosPagos: number;
  valorCompra: number;
  totalInvestido: number; // Added totalInvestido parameter
  cubInicial?: number;
  cubFinal?: number;
  indiceCubFinal?: number;
}

const CustosSection: React.FC<CustosSectionProps> = ({
  totalJurosParcelas,
  totalJurosReforcos,
  totalJurosPagos,
  valorCompra,
  totalInvestido,
  cubInicial,
  cubFinal,
  indiceCubFinal
}) => {
  return (
    <Card className="shadow-md border-t-4 border-t-red-500">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-red-700">
          <Coins className="mr-2" /> 
          Custos da Operação (Correção CUB)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            value={formatarMoeda(totalInvestido)}
            icon={<div className="bg-rose-500 p-2 rounded-full text-white">
              <Building size={20} />
            </div>}
            bgColor="from-rose-50 to-white"
            subtitle={`Valor inicial (${formatarMoeda(valorCompra)}) + Parcelas + Reforços (com juros)`}
          />

          <MetricCard
            title="CUB Inicial"
            value={formatarMoeda(cubInicial || 0)}
            icon={<div className="bg-blue-500 p-2 rounded-full text-white">
              <TrendingUp size={20} />
            </div>}
            bgColor="from-blue-50 to-white"
            subtitle="Valor CUB na data do contrato"
          />
          
          <MetricCard
            title="CUB Final"
            value={formatarMoeda(cubFinal || 0)}
            icon={<div className="bg-indigo-500 p-2 rounded-full text-white">
              <TrendingUp size={20} />
            </div>}
            bgColor="from-indigo-50 to-white"
            subtitle={`Índice: ${(indiceCubFinal || 1).toFixed(4)}`}
          />
        </div>

        <div className="mt-5 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Sobre a Correção pelo CUB</h3>
          <p className="text-sm text-muted-foreground">
            O CUB (Custo Unitário Básico) é utilizado para corrigir o valor das parcelas e reforços ao longo do tempo.
            A fórmula aplicada é: <span className="font-mono bg-gray-100 px-1">Valor corrigido = Valor base × (CUB atual / CUB inicial)</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustosSection;
