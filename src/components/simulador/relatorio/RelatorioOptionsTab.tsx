
import React from "react";
import { FileText } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PDFOptions } from "@/types/simulador";

interface RelatorioOptionsTabProps {
  opcoesPDF: PDFOptions;
  setOpcoesPDF: React.Dispatch<React.SetStateAction<PDFOptions>>;
}

const RelatorioOptionsTab: React.FC<RelatorioOptionsTabProps> = ({
  opcoesPDF,
  setOpcoesPDF
}) => {
  return (
    <CardContent className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Personalização do Relatório</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="grafico-global" className="text-base">Gráfico Global</Label>
                <p className="text-sm text-muted-foreground">Evolução completa do investimento</p>
              </div>
              <Switch 
                id="grafico-global" 
                checked={opcoesPDF.incluirGraficoGlobal} 
                onCheckedChange={(checked) => setOpcoesPDF(prev => ({...prev, incluirGraficoGlobal: checked}))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="grafico-mensal" className="text-base">Gráfico Mensal</Label>
                <p className="text-sm text-muted-foreground">Detalhamento dos ganhos mensais</p>
              </div>
              <Switch 
                id="grafico-mensal" 
                checked={opcoesPDF.incluirGraficoMensal} 
                onCheckedChange={(checked) => setOpcoesPDF(prev => ({...prev, incluirGraficoMensal: checked}))}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tabela" className="text-base">Tabela de Resumo</Label>
                <p className="text-sm text-muted-foreground">Valores detalhados por período</p>
              </div>
              <Switch 
                id="tabela" 
                checked={opcoesPDF.incluirTabela} 
                onCheckedChange={(checked) => setOpcoesPDF(prev => ({...prev, incluirTabela: checked}))}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-md">
          <h4 className="font-medium mb-2 flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Sobre o documento PDF
          </h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-center">
              <span className="bg-purple-100 h-2 w-2 rounded-full mr-2"></span>
              Formato A4 com design profissional que mantém a identidade visual do simulador
            </li>
            <li className="flex items-center">
              <span className="bg-blue-100 h-2 w-2 rounded-full mr-2"></span>
              Gráficos de alta qualidade gerados a partir dos dados da simulação
            </li>
            <li className="flex items-center">
              <span className="bg-green-100 h-2 w-2 rounded-full mr-2"></span>
              Tabelas formatadas com os números apresentados de forma clara
            </li>
            <li className="flex items-center">
              <span className="bg-orange-100 h-2 w-2 rounded-full mr-2"></span>
              Resumo completo do investimento e suas projeções
            </li>
          </ul>
        </div>
      </div>
    </CardContent>
  );
};

export default RelatorioOptionsTab;
