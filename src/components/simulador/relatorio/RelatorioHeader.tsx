
import React from "react";
import { FileText, Download } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DadosEmpreendimento } from "@/types/simulador";

interface RelatorioHeaderProps {
  onGerarPDF: () => void;
  dadosEmpreendimento: DadosEmpreendimento;
}

const RelatorioHeader: React.FC<RelatorioHeaderProps> = ({
  onGerarPDF,
  dadosEmpreendimento
}) => {
  // Ícone para o cabeçalho
  const getIcon = (color: string) => (
    <div className={`bg-${color}-500 p-2 rounded-full text-white h-9 w-9 flex items-center justify-center`}>
      <FileText size={18} />
    </div>
  );

  return (
    <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {getIcon("purple")}
          <div>
            <CardTitle className="text-2xl">
              Relatório de Investimento {dadosEmpreendimento.nomeEmpreendimento && `- ${dadosEmpreendimento.nomeEmpreendimento}`}
            </CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <Button onClick={onGerarPDF} variant="default" className="bg-investment-primary hover:bg-investment-secondary">
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>
    </CardHeader>
  );
};

export default RelatorioHeader;
