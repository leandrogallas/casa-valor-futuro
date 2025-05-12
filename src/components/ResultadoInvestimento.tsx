
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetalhesMes, ResultadoSimulacao, formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";
import { ResponsiveContainer, CartesianGrid, Legend, Bar, ComposedChart, Line, XAxis, YAxis, Tooltip, TooltipProps } from "recharts";
import { ArrowUp, ArrowDown, DollarSign, Calendar, Calculator, TrendingUp, PieChart, ChartBarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";

interface ResultadoInvestimentoProps {
  resultado: ResultadoSimulacao | null;
}

const ResultadoInvestimento: React.FC<ResultadoInvestimentoProps> = ({ resultado }) => {
  const [chartView, setChartView] = useState<"global" | "monthly" | "comparative">("global");
  
  if (!resultado) return null;

  const { totalInvestido, valorImovel, lucro, retornoPercentual, detalhes } = resultado;
  const isLucro = lucro > 0;

  // Calculate additional metrics for each month
  const detalhesProcessed = detalhes.map((mes, index) => {
    const mesAnterior = index > 0 ? detalhes[index - 1] : null;
    
    // Monthly capital gain
    const ganhoCapitalMensal = mesAnterior 
      ? mes.valorImovel - mesAnterior.valorImovel 
      : mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    // Real gain (value - invested - debt)
    const ganhoReal = mes.valorImovel - mes.investido;
    
    // Net profit (considering closing costs would be about 5%)
    const lucroLiquido = Math.max(0, mes.valorImovel * 0.95 - mes.investido);
    
    // Valorização prevista (accumulated since start)
    const valorizacaoPrevista = mes.valorImovel - resultado.detalhes[0].valorImovel;
    
    return {
      ...mes,
      ganhoCapitalMensal,
      ganhoCapitalAcumulado: mes.valorImovel - resultado.detalhes[0].valorImovel,
      ganhoReal,
      lucroLiquido,
      valorizacaoPrevista
    };
  });

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-md shadow-md">
          <p className="font-semibold">{`Mês: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formatarMoeda(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Latest data for cards
  const latestData = detalhesProcessed[detalhesProcessed.length - 1];
  
  // Get data for specific years to display in the table (yearly increments)
  const yearlyData = detalhesProcessed.filter(item => item.mes % 12 === 0 || item.mes === 1 || item.mes === detalhesProcessed.length);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-investment-dark">Resumo da Simulação</h2>
      
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

      {/* Charts */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evolução do Investimento</CardTitle>
          <div className="flex flex-wrap space-x-2">
            <Button
              variant={chartView === "global" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("global")}
              className={chartView === "global" ? "bg-investment-primary" : ""}
            >
              Visão Global
            </Button>
            <Button
              variant={chartView === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("monthly")}
              className={chartView === "monthly" ? "bg-investment-primary" : ""}
            >
              Ganho Mensal
            </Button>
            <Button
              variant={chartView === "comparative" ? "default" : "outline"}
              size="sm"
              onClick={() => setChartView("comparative")}
              className={chartView === "comparative" ? "bg-investment-primary" : ""}
            >
              Comparativo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="grafico">
            <TabsList className="mb-4">
              <TabsTrigger value="grafico">Gráfico</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>

            <TabsContent value="grafico" className="h-[500px]">
              <ChartContainer config={{}} className="h-full">
                {chartView === "global" && (
                  <ComposedChart data={detalhesProcessed.filter((_,i) => i % 3 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="mes" 
                    />
                    <YAxis 
                      tickFormatter={(value) => `${new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line 
                      type="monotone" 
                      dataKey="valorImovel" 
                      name="Valor Imóvel" 
                      stroke="#9b87f5" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="investido" 
                      name="Total Investido" 
                      stroke="#7E69AB" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="saldoDevedor" 
                      name="Saldo Devedor" 
                      stroke="#F97316" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ganhoReal" 
                      name="Ganho Real" 
                      stroke="#0EA5E9" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                )}
                
                {chartView === "monthly" && (
                  <ComposedChart data={detalhesProcessed.filter((_,i) => i % 3 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="mes" />
                    <YAxis 
                      tickFormatter={(value) => `${new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Bar 
                      dataKey="ganhoCapitalMensal" 
                      name="Ganho Capital Mensal" 
                      fill="#FEC6A1"
                      barSize={20}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ganhoCapitalAcumulado" 
                      name="Ganho Capital Acumulado" 
                      stroke="#F97316" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                )}
                
                {chartView === "comparative" && (
                  <ComposedChart data={detalhesProcessed.filter((_,i) => i % 3 === 0)}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="mes" />
                    <YAxis 
                      tickFormatter={(value) => `${new Intl.NumberFormat('pt-BR', {
                        notation: 'compact',
                        compactDisplay: 'short',
                      }).format(value)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="top" height={36} />
                    <Line 
                      type="monotone" 
                      dataKey="valorImovel" 
                      name="Valor do Imóvel" 
                      stroke="#9b87f5" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="valorizacaoPrevista" 
                      name="Valorização Prevista" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lucroLiquido" 
                      name="Lucro Líquido" 
                      stroke="#22C55E" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                )}
              </ChartContainer>
            </TabsContent>

            <TabsContent value="detalhes">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="py-2 px-3 text-left font-medium">Ano</th>
                        <th className="py-2 px-3 text-left font-medium">Mês</th>
                        <th className="py-2 px-3 text-left font-medium">Investido</th>
                        <th className="py-2 px-3 text-left font-medium">Valor Imóvel</th>
                        <th className="py-2 px-3 text-left font-medium">Saldo Devedor</th>
                        <th className="py-2 px-3 text-left font-medium">Valorização</th>
                        <th className="py-2 px-3 text-left font-medium">Ganho Cap. Mensal</th>
                        <th className="py-2 px-3 text-left font-medium">Lucro Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyData.map((mes, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                          <td className="py-2 px-3 border-b">{Math.ceil(mes.mes/12)}</td>
                          <td className="py-2 px-3 border-b">{mes.mes}</td>
                          <td className="py-2 px-3 border-b">{formatarMoeda(mes.investido)}</td>
                          <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorImovel)}</td>
                          <td className="py-2 px-3 border-b">{formatarMoeda(mes.saldoDevedor)}</td>
                          <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorizacaoPrevista)}</td>
                          <td className="py-2 px-3 border-b">{formatarMoeda(mes.ganhoCapitalMensal)}</td>
                          <td className="py-2 px-3 border-b">{formatarMoeda(mes.lucroLiquido)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
                <p className="font-medium">Legenda:</p>
                <ul className="mt-2 space-y-1">
                  <li><span className="font-medium">Investido:</span> Total investido até o período</li>
                  <li><span className="font-medium">Valor Imóvel:</span> Valor projetado do imóvel com valorização</li>
                  <li><span className="font-medium">Saldo Devedor:</span> Valor restante a pagar</li>
                  <li><span className="font-medium">Valorização:</span> Aumento no valor do imóvel desde a compra</li>
                  <li><span className="font-medium">Ganho Cap. Mensal:</span> Valorização apenas no mês</li>
                  <li><span className="font-medium">Lucro Líquido:</span> Ganho real considerando custos de venda (5%)</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultadoInvestimento;
