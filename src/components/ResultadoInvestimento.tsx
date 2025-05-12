
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetalhesMes, ResultadoSimulacao, formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Bar, ComposedChart } from "recharts";
import { ArrowUp, ArrowDown, DollarSign, Calendar, Calculator, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultadoInvestimentoProps {
  resultado: ResultadoSimulacao | null;
}

const ResultadoInvestimento: React.FC<ResultadoInvestimentoProps> = ({ resultado }) => {
  const [chartView, setChartView] = useState<"global" | "monthly">("global");
  
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

  const CustomTooltip = ({ active, payload, label }: any) => {
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-investment-light to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(totalInvestido)}</h3>
              </div>
              <div className="bg-investment-primary p-2 rounded-full text-white">
                <DollarSign size={20} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-investment-light to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Final do Imóvel</p>
                <h3 className="text-2xl font-bold">{formatarMoeda(valorImovel)}</h3>
              </div>
              <div className="bg-investment-primary p-2 rounded-full text-white">
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
                {isLucro ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-muted-foreground">Ganho de Capital Acumulado</p>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Evolução do Investimento</CardTitle>
          <div className="flex space-x-2">
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
              Ganhos Mensais
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
              <ResponsiveContainer width="100%" height="100%">
                {chartView === "global" ? (
                  <ComposedChart data={detalhesProcessed}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="mes" 
                      label={{ value: 'Mês', position: 'insideBottomRight', offset: -5 }} 
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
                      dataKey="investido" 
                      name="Total Investido" 
                      stroke="#7E69AB" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
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
                ) : (
                  <ComposedChart data={detalhesProcessed}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="mes" 
                      label={{ value: 'Mês', position: 'insideBottomRight', offset: -5 }} 
                    />
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
                    <Line 
                      type="monotone" 
                      dataKey="valorizacaoPrevista" 
                      name="Valorização Prevista" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </TabsContent>

            <TabsContent value="detalhes">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="py-2 px-4 text-left font-medium">Mês</th>
                        <th className="py-2 px-4 text-left font-medium">Total Investido</th>
                        <th className="py-2 px-4 text-left font-medium">Valor Imóvel</th>
                        <th className="py-2 px-4 text-left font-medium">Saldo Devedor</th>
                        <th className="py-2 px-4 text-left font-medium">Valorização Prevista</th>
                        <th className="py-2 px-4 text-left font-medium">Ganho Cap. Mensal</th>
                        <th className="py-2 px-4 text-left font-medium">Ganho Cap. Acum.</th>
                        <th className="py-2 px-4 text-left font-medium">Lucro Líquido</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalhesProcessed.filter((_, i) => i % 12 === 0 || i === detalhesProcessed.length - 1).map((mes, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                          <td className="py-2 px-4 border-b">{mes.mes}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.investido)}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.valorImovel)}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.saldoDevedor)}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.valorizacaoPrevista)}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.ganhoCapitalMensal)}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.ganhoCapitalAcumulado)}</td>
                          <td className="py-2 px-4 border-b">{formatarMoeda(mes.lucroLiquido)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultadoInvestimento;
