
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, PDFOptions } from "@/types/simulador";

import EmpreendimentoInfo from "./components/EmpreendimentoInfo";
import InvestmentSummary from "./components/InvestmentSummary";
import InvestmentDetails from "./components/InvestmentDetails";
import RelatorioPreviewGraficos from "./components/RelatorioPreviewGraficos";

interface RelatorioPreviewTabProps {
  resultado: ResultadoSimulacao;
  dadosSimulacao: DadosSimulacao;
  dadosEmpreendimento: DadosEmpreendimento;
  opcoesPDF: PDFOptions;
}

const RelatorioPreviewTab: React.FC<RelatorioPreviewTabProps> = ({
  resultado,
  dadosSimulacao,
  dadosEmpreendimento,
  opcoesPDF,
}) => {
  return (
    <CardContent className="p-6 space-y-6">
      {/* Seção de detalhes do empreendimento */}
      <EmpreendimentoInfo 
        dadosSimulacao={dadosSimulacao} 
        dadosEmpreendimento={dadosEmpreendimento} 
      />
      
      <Separator />
      
      {/* Seção de resumo financeiro */}
      <InvestmentSummary resultado={resultado} />
      
      <Separator />
      
      {/* Seção de detalhes do investimento */}
      <InvestmentDetails 
        dadosSimulacao={dadosSimulacao} 
        resultado={resultado} 
      />
      
      <RelatorioPreviewGraficos opcoesPDF={opcoesPDF} />
      
      <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white border border-dashed rounded-md">
        <p className="text-muted-foreground">O relatório em PDF incluirá todos os gráficos e tabelas selecionados nas opções.</p>
        <p className="text-muted-foreground text-sm mt-2">Clique em "Baixar PDF" para gerar o relatório completo.</p>
      </div>
    </CardContent>
  );
};

export default RelatorioPreviewTab;
