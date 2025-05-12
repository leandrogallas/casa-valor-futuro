
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import GraficoGlobal from "./GraficoGlobal";
import GraficoMensal from "./GraficoMensal";
import GraficoComparativo from "./GraficoComparativo";
import TabelaDetalhes from "./TabelaDetalhes";
import { ChartConfig } from "@/components/ui/chart";

interface GraficoResultadoProps {
  detalhesProcessed: any[];
  yearlyData: any[];
}

const GraficoResultado: React.FC<GraficoResultadoProps> = ({ 
  detalhesProcessed, 
  yearlyData 
}) => {
  const [chartView, setChartView] = useState<"global" | "monthly" | "comparative">("global");
  const chartConfig: ChartConfig = {};
  
  return (
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
            <ChartContainer config={chartConfig} className="h-full">
              {chartView === "global" && <GraficoGlobal detalhesProcessed={detalhesProcessed} />}
              {chartView === "monthly" && <GraficoMensal detalhesProcessed={detalhesProcessed} />}
              {chartView === "comparative" && <GraficoComparativo detalhesProcessed={detalhesProcessed} />}
            </ChartContainer>
          </TabsContent>

          <TabsContent value="detalhes">
            <TabelaDetalhes yearlyData={yearlyData} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GraficoResultado;
