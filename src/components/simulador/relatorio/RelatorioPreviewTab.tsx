
import React from "react";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, PDFOptions, DetalhesMesProcessado } from "@/types/simulador";

import EmpreendimentoInfo from "./components/EmpreendimentoInfo";
import InvestmentSummary from "./components/InvestmentSummary";
import InvestmentDetails from "./components/InvestmentDetails";
import RelatorioPreviewGraficos from "./components/RelatorioPreviewGraficos";

interface RelatorioPreviewTabProps {
  resultado: ResultadoSimulacao;
  dadosSimulacao: DadosSimulacao;
  dadosEmpreendimento: DadosEmpreendimento;
  opcoesPDF: PDFOptions;
  detalhesProcessados?: DetalhesMesProcessado[];
}

const RelatorioPreviewTab: React.FC<RelatorioPreviewTabProps> = ({
  resultado,
  dadosSimulacao,
  dadosEmpreendimento,
  opcoesPDF,
  detalhesProcessados
}) => {
  // Verificar se temos dados processados
  const latestData = detalhesProcessados && detalhesProcessados.length > 0 
    ? detalhesProcessados[detalhesProcessados.length - 1] 
    : undefined;
  
  // Calcular valores necessários para os detalhes usando as definições padronizadas
  const meses = resultado.detalhes.length;
  const numeroParcelas = meses;
  const numeroReforcos = Math.floor(meses / 12);
  const valorParcelaSemCorrecao = resultado.parcelas / meses;
  const valorReforcoSemCorrecao = numeroReforcos > 0 ? resultado.reforcos / numeroReforcos : 0;
  const totalJurosPagos = resultado.totalJurosParcelas + resultado.totalJurosReforcos;
  
  // 1. Ganho de capital (DEFINIÇÃO PADRONIZADA)
  const ganhoCapital = resultado.valorImovel - resultado.valorCompra;
  
  // 2. Ganho real (DEFINIÇÃO PADRONIZADA)
  const ganhoReal = ganhoCapital - totalJurosPagos;
  
  // 3. Comissão (5% do valor final do imóvel)
  const comissao = resultado.valorImovel * 0.05;
  
  // 4. Lucro líquido (DEFINIÇÃO PADRONIZADA)
  const lucroLiquido = ganhoReal - comissao;
  
  // 5. Retorno percentual com base no lucro ajustado
  const retornoAjustado = resultado.totalInvestido > 0 ? lucroLiquido / resultado.totalInvestido : 0;
  
  return (
    <CardContent className="p-6 space-y-6">
      {/* Seção de detalhes do empreendimento */}
      <EmpreendimentoInfo 
        dadosSimulacao={dadosSimulacao} 
        dadosEmpreendimento={dadosEmpreendimento} 
      />
      
      <Separator />
      
      {/* Seção de resumo financeiro */}
      <InvestmentSummary 
        resultado={resultado}
        latestData={latestData}
        retornoPercentual={retornoAjustado} 
      />
      
      <Separator />
      
      {/* Seção de detalhes do investimento */}
      <InvestmentDetails 
        dadosSimulacao={dadosSimulacao} 
        resultado={resultado}
        latestData={latestData}
        valorParcelaSemCorrecao={valorParcelaSemCorrecao}
        valorReforcoSemCorrecao={valorReforcoSemCorrecao}
        numeroParcelas={numeroParcelas}
        numeroReforcos={numeroReforcos}
        totalJurosPagos={totalJurosPagos}
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
