
import React from "react";
import { Home, Banknote, CalendarClock, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import { formatarMoeda } from "@/utils/investmentCalculator";

interface NegocioSectionProps {
  valorCompra: number;
  totalEntrada: number;
  numeroParcelas: number;
  meses: number;
  valorParcelaSemCorrecao: number;
  numeroReforcos: number;
  valorReforcoSemCorrecao: number;
}

const NegocioSection: React.FC<NegocioSectionProps> = ({
  valorCompra,
  totalEntrada,
  numeroParcelas,
  meses,
  valorParcelaSemCorrecao,
  numeroReforcos,
  valorReforcoSemCorrecao
}) => {
  // Valor total das parcelas sem correção - Using the total principal amount to be paid in parcels
  const valorTotalParcelas = valorParcelaSemCorrecao * numeroParcelas;
  
  // Valor total dos reforços sem correção - Using the total reinforcement amount
  const valorTotalReforcos = valorReforcoSemCorrecao * numeroReforcos;

  return (
    <Card className="shadow-md border-t-4 border-t-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-blue-700">
          <Home className="mr-2" /> 
          Detalhes do Negócio
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="Valor de Compra do Imóvel"
            value={formatarMoeda(valorCompra)}
            icon={<div className="bg-blue-500 p-2 rounded-full text-white">
              <Home size={20} />
            </div>}
            bgColor="from-blue-50 to-white"
          />
          
          <MetricCard
            title="Entrada"
            value={formatarMoeda(totalEntrada)}
            icon={<div className="bg-green-500 p-2 rounded-full text-white">
              <Banknote size={20} />
            </div>}
            bgColor="from-green-50 to-white"
          />
          
          <MetricCard
            title="Número de Parcelas"
            value={numeroParcelas.toString()}
            icon={<div className="bg-purple-500 p-2 rounded-full text-white">
              <CalendarClock size={20} />
            </div>}
            bgColor="from-purple-50 to-white"
            subtitle={`${meses / 12} anos`}
          />
          
          <MetricCard
            title="Valor das Parcelas sem Correção"
            value={formatarMoeda(valorParcelaSemCorrecao)}
            icon={<div className="bg-indigo-500 p-2 rounded-full text-white">
              <Calculator size={20} />
            </div>}
            bgColor="from-indigo-50 to-white"
            subtitle={`Total: ${formatarMoeda(valorTotalParcelas)}`}
          />
          
          <MetricCard
            title="Número de Reforços"
            value={numeroReforcos.toString()}
            icon={<div className="bg-amber-500 p-2 rounded-full text-white">
              <CalendarClock size={20} />
            </div>}
            bgColor="from-amber-50 to-white"
            subtitle="Anual"
          />
          
          <MetricCard
            title="Valor dos Reforços sem Correção"
            value={formatarMoeda(valorReforcoSemCorrecao)}
            icon={<div className="bg-cyan-500 p-2 rounded-full text-white">
              <Calculator size={20} />
            </div>}
            bgColor="from-cyan-50 to-white"
            subtitle={`Total: ${formatarMoeda(valorTotalReforcos)}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NegocioSection;
