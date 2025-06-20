
import React from "react";
import { TrendingUp, PieChart, DollarSign, Percent, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MetricCard from "./MetricCard";
import { formatarMoeda, formatarPercentual } from "@/utils/investment/formatters";
import { DetalhesMesProcessado } from "@/types/simulador";

interface ValorizacaoSectionProps {
  valorImovel: number;
  lucro: number;
  valorizacaoMensalPercent: number;
  valorizacaoMensalReais: number;
  latestData: DetalhesMesProcessado;
  meses: number;
  resultado: {
    valorizacao: number;
    valorCompra: number;
  };
}

const ValorizacaoSection: React.FC<ValorizacaoSectionProps> = ({
  valorImovel,
  lucro, 
  valorizacaoMensalPercent,
  valorizacaoMensalReais,
  latestData,
  meses,
  resultado
}) => {
  // DEFINIÇÕES PADRONIZADAS - Usando diretamente os valores calculados em latestData
  
  // 1. Comissão de 5% sobre o valor final do imóvel
  const comissao = valorImovel * 0.05;
  
  // 2. Usar os valores processados que seguem as definições padronizadas
  const ganhoCapital = latestData.ganhoCapitalAcumulado;
  const ganhoReal = latestData.ganhoReal;
  const lucroComComissao = latestData.lucroLiquidoComComissao;
  
  // 3. Taxas de valorização
  const valorizacaoAnual = resultado.valorizacao; // Ex: 0.12 para 12%
  const valorizacaoMensalCorrigida = Math.pow(1 + valorizacaoAnual, 1/12) - 1; // Taxa equivalente mensal
  
  // Formatação para exibição
  const valorizacaoMensalPercentFormatada = formatarPercentual(valorizacaoMensalCorrigida * 100);
  const valorizacaoAnualPercentFormatada = formatarPercentual(valorizacaoAnual * 100);
  
  return (
    <Card className="shadow-md border-t-4 border-t-green-500">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-green-700">
          <TrendingUp className="mr-2" /> 
          Valorização do Imóvel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <MetricCard
            title="Valorização Prevista"
            value={formatarMoeda(valorImovel)}
            icon={<div className="bg-green-500 p-2 rounded-full text-white">
              <PieChart size={20} />
            </div>}
            bgColor="from-green-50 to-white"
            subtitle={`Após ${meses} meses`}
          />
          
          <MetricCard
            title="Ganho de Capital"
            value={formatarMoeda(ganhoCapital)}
            icon={<div className="bg-emerald-500 p-2 rounded-full text-white">
              <TrendingUp size={20} />
            </div>}
            bgColor="from-emerald-50 to-white"
            subtitle={`Valor Final - Valor Compra`}
          />
          
          <MetricCard
            title="Ganho Real"
            value={formatarMoeda(ganhoReal)}
            icon={<div className="bg-teal-500 p-2 rounded-full text-white">
              <DollarSign size={20} />
            </div>}
            bgColor="from-teal-50 to-white"
            subtitle={`Ganho Capital - Juros Pagos`}
          />
          
          <MetricCard
            title="Lucro Líquido"
            value={formatarMoeda(lucroComComissao)}
            icon={<div className={`p-2 rounded-full text-white ${lucroComComissao > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
              {lucroComComissao > 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
            </div>}
            bgColor={lucroComComissao > 0 ? 'from-green-50 to-white' : 'from-red-50 to-white'}
            textColor={lucroComComissao > 0 ? 'text-green-600' : 'text-red-600'}
            subtitle={`Ganho Real - Comissão ${formatarPercentual(5)} (${formatarMoeda(comissao)})`}
          />
          
          <MetricCard
            title="Valorização Mensal"
            value={valorizacaoMensalPercentFormatada}
            icon={<div className="bg-cyan-500 p-2 rounded-full text-white">
              <Percent size={20} />
            </div>}
            bgColor="from-cyan-50 to-white"
            subtitle={`${valorizacaoAnualPercentFormatada} ao ano`}
          />
          
          <MetricCard
            title="Valorização R$ por mês"
            value={formatarMoeda(valorizacaoMensalReais)}
            icon={<div className="bg-blue-500 p-2 rounded-full text-white">
              <DollarSign size={20} />
            </div>}
            bgColor="from-blue-50 to-white"
            subtitle={`${formatarMoeda(valorizacaoMensalReais * 12)} ao ano`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ValorizacaoSection;
