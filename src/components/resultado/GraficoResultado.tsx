
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartConfig } from "@/components/ui/chart";
import GraficoWrapper from "./grafico/GraficoWrapper";
import TabelaDetalhes from "./TabelaDetalhes";
import { DetalhesMesProcessado } from "@/types/simulador";
import SeletorVisualizacao from "./grafico/SeletorVisualizacao";

interface GraficoResultadoProps {
  detalhesProcessed: DetalhesMesProcessado[];
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
        <SeletorVisualizacao 
          chartView={chartView} 
          onChangeView={setChartView} 
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="grafico">
          <TabsList className="mb-4">
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="grafico" className="h-[500px]">
            <GraficoWrapper 
              chartView={chartView}
              chartConfig={chartConfig} 
              detalhesProcessed={detalhesProcessed}
            />
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
