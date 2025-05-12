
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, DollarSign, Calendar, Calculator, TrendingUp, PieChart, Percent } from "lucide-react";
import { formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";

interface CardsResumoProps {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
  latestData: any;
  meses: number;
  totalJurosPagos: number;
}

const CardsResumo: React.FC<CardsResumoProps> = ({ 
  totalInvestido, 
  valorImovel, 
  lucro, 
  retornoPercentual,
  latestData,
  meses,
  totalJurosPagos
}) => {
  const isLucro = lucro > 0;
  
  // Cálculo da valorização mensal em percentual
  const valorizacaoMensalPercent = retornoPercentual / meses;
  
  // Cálculo da valorização mensal em R$
  const valorizacaoMensalReais = latestData.lucroLiquido / meses;
  
  return (
    <>
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(totalInvestido)}</h3>
              </div>
              <div className="bg-blue-500 p-2 rounded-full text-white">
                <DollarSign size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Final do Imóvel</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(valorImovel)}</h3>
              </div>
              <div className="bg-purple-500 p-2 rounded-full text-white">
                <Calendar size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isLucro ? 'from-green-50 to-white' : 'from-red-50 to-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lucro/Prejuízo</p>
                <h3 className={`text-2xl font-bold ${isLucro ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarMoeda(lucro)}
                </h3>
              </div>
              <div className={`p-2 rounded-full text-white ${isLucro ? 'bg-green-500' : 'bg-red-500'}`}>
                {isLucro ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isLucro ? 'from-green-50 to-white' : 'from-red-50 to-white'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Retorno sobre Investimento</p>
                <h3 className={`text-2xl font-bold ${isLucro ? 'text-green-600' : 'text-red-600'}`}>
                  {formatarPercentual(retornoPercentual)}
                </h3>
              </div>
              <div className={`p-2 rounded-full text-white ${isLucro ? 'bg-green-500' : 'bg-red-500'}`}>
                {isLucro ? <TrendingUp size={20} /> : <ArrowDown size={20} />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Devedor</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(latestData.saldoDevedor)}</h3>
              </div>
              <div className="bg-blue-500 p-2 rounded-full text-white">
                <Calculator size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valorização Prevista</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(latestData.valorizacaoPrevista)}</h3>
              </div>
              <div className="bg-purple-500 p-2 rounded-full text-white">
                <PieChart size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ganho Capital Acumulado</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(latestData.ganhoCapitalAcumulado)}</h3>
              </div>
              <div className="bg-amber-500 p-2 rounded-full text-white">
                <TrendingUp size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ganho Real (Líquido)</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(latestData.lucroLiquido)}</h3>
              </div>
              <div className="bg-green-500 p-2 rounded-full text-white">
                <DollarSign size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Novos Cards de Valorização Mensal e Juros Pagos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        <Card className="bg-gradient-to-br from-cyan-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valorização Mensal</p>
                <h3 className="text-2xl font-bold">{formatarPercentual(valorizacaoMensalPercent)}</h3>
              </div>
              <div className="bg-cyan-500 p-2 rounded-full text-white">
                <Percent size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valorização R$ por mês</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(valorizacaoMensalReais)}</h3>
              </div>
              <div className="bg-emerald-500 p-2 rounded-full text-white">
                <DollarSign size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Juros Pagos</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(totalJurosPagos)}</h3>
              </div>
              <div className="bg-red-500 p-2 rounded-full text-white">
                <Calculator size={20} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CardsResumo;
