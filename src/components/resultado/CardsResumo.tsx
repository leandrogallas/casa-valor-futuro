
import React from "react";
import { formatarPercentual, ResultadoSimulacao, formatarMoeda } from "@/utils/investmentCalculator";
import { DetalhesMesProcessado } from "@/types/simulador";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Coins, TrendingUp, ArrowUp, ArrowDown, DollarSign, Calculator, Landmark, Home, Banknote, PieChart, PercentCircle, Percent, CalendarClock } from "lucide-react";
import MetricCard from "./cards/MetricCard";

interface CardsResumoProps {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
  latestData: DetalhesMesProcessado;
  meses: number;
  totalJurosPagos: number;
  totalJurosParcelas: number;
  totalJurosReforcos: number;
  valorImovelMaisJuros: number;
  valorCompra: number;
  resultado: ResultadoSimulacao;
  valorParcelaSemCorrecao: number;
  numeroParcelas: number;
  numeroReforcos: number;
  valorReforcoSemCorrecao: number;
}

const CardsResumo: React.FC<CardsResumoProps> = ({ 
  totalInvestido, 
  valorImovel,
  lucro, 
  retornoPercentual,
  latestData,
  meses,
  totalJurosPagos,
  totalJurosParcelas,
  totalJurosReforcos,
  valorImovelMaisJuros,
  valorCompra,
  resultado,
  valorParcelaSemCorrecao,
  numeroParcelas,
  numeroReforcos,
  valorReforcoSemCorrecao
}) => {
  // Cálculo da valorização mensal em percentual
  const valorizacaoMensalPercent = retornoPercentual / meses;
  
  // Cálculo da valorização mensal em R$
  const valorizacaoMensalReais = lucro / meses;

  // Calcular comissão de 5%
  const comissao = valorImovel * 0.05;
  const lucroComComissao = latestData.lucroLiquidoComComissao;
  
  return (
    <div className="space-y-8">
      {/* Seção 1: Detalhes do negócio */}
      <Card className="shadow-md border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-blue-700">
            <Building className="mr-2" /> 
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
              value={formatarMoeda(resultado.totalEntrada)}
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
              subtitle={`Total: ${formatarMoeda(valorParcelaSemCorrecao * numeroParcelas)}`}
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
              subtitle={`Total: ${formatarMoeda(valorReforcoSemCorrecao * numeroReforcos)}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Custos da operação */}
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
              subtitle={`${formatarPercentual(totalJurosParcelas / totalJurosPagos * 100)} dos juros totais`}
            />
            
            <MetricCard
              title="Juros dos Reforços"
              value={formatarMoeda(totalJurosReforcos)}
              icon={<div className="bg-orange-500 p-2 rounded-full text-white">
                <Calculator size={20} />
              </div>}
              bgColor="from-orange-50 to-white"
              subtitle={`${formatarPercentual(totalJurosReforcos / totalJurosPagos * 100)} dos juros totais`}
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
              subtitle={`Compra + Juros`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Valorização do Imóvel */}
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
              value={formatarMoeda(latestData.ganhoCapitalAcumulado)}
              icon={<div className="bg-emerald-500 p-2 rounded-full text-white">
                <TrendingUp size={20} />
              </div>}
              bgColor="from-emerald-50 to-white"
              subtitle={`Valorização - Valor Compra`}
            />
            
            <MetricCard
              title="Ganho Real"
              value={formatarMoeda(latestData.ganhoReal)}
              icon={<div className="bg-teal-500 p-2 rounded-full text-white">
                <DollarSign size={20} />
              </div>}
              bgColor="from-teal-50 to-white"
              subtitle={`Valorização - Valor Compra - Juros`}
            />
            
            <MetricCard
              title="Lucro Líquido"
              value={formatarMoeda(lucroComComissao)}
              icon={<div className={`p-2 rounded-full text-white ${lucroComComissao > 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                {lucroComComissao > 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </div>}
              bgColor={lucroComComissao > 0 ? 'from-green-50 to-white' : 'from-red-50 to-white'}
              textColor={lucroComComissao > 0 ? 'text-green-600' : 'text-red-600'}
              subtitle={`Após comissão de 5% (${formatarMoeda(comissao)})`}
            />
            
            <MetricCard
              title="Valorização Mensal"
              value={formatarPercentual(valorizacaoMensalPercent)}
              icon={<div className="bg-cyan-500 p-2 rounded-full text-white">
                <Percent size={20} />
              </div>}
              bgColor="from-cyan-50 to-white"
              subtitle={`${formatarPercentual(resultado.resultado.valorizacao * 100)} ao ano`}
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
    </div>
  );
};

export default CardsResumo;
