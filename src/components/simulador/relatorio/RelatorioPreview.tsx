
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Settings } from "lucide-react";
import { ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, PDFOptions } from "@/types/simulador";

import RelatorioHeader from "./RelatorioHeader";
import RelatorioPreviewTab from "./RelatorioPreviewTab";
import RelatorioOptionsTab from "./RelatorioOptionsTab";
import RelatorioFooter from "./RelatorioFooter";

interface RelatorioPreviewProps {
  resultado: ResultadoSimulacao;
  dadosSimulacao: DadosSimulacao;
  dadosEmpreendimento: DadosEmpreendimento;
  onGerarPDF: () => void;
}

const RelatorioPreview: React.FC<RelatorioPreviewProps> = ({
  resultado,
  dadosSimulacao,
  dadosEmpreendimento,
  onGerarPDF
}) => {
  // Estado para opções de personalização do PDF
  const [opcoesPDF, setOpcoesPDF] = useState<PDFOptions>({
    incluirGraficoGlobal: true,
    incluirGraficoMensal: true,
    incluirTabela: true
  });
  
  return (
    <Card className="shadow-lg">
      <RelatorioHeader 
        onGerarPDF={onGerarPDF} 
        dadosEmpreendimento={dadosEmpreendimento} 
      />
      
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <FileText className="mr-2 h-4 w-4" />
            Visualização
          </TabsTrigger>
          <TabsTrigger value="options" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <Settings className="mr-2 h-4 w-4" />
            Opções
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="m-0 p-0">
          <RelatorioPreviewTab 
            resultado={resultado}
            dadosSimulacao={dadosSimulacao}
            dadosEmpreendimento={dadosEmpreendimento}
            opcoesPDF={opcoesPDF}
          />
        </TabsContent>
        
        <TabsContent value="options" className="m-0 p-0">
          <RelatorioOptionsTab 
            opcoesPDF={opcoesPDF}
            setOpcoesPDF={setOpcoesPDF}
          />
        </TabsContent>
      </Tabs>
      
      <RelatorioFooter onGerarPDF={onGerarPDF} />
    </Card>
  );
};

export default RelatorioPreview;
