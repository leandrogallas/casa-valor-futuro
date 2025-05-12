
import React from "react";
import FormularioEmpreendimento from "./FormularioEmpreendimento";
import { RelatorioPreview } from "./relatorio";
import { DadosEmpreendimento, DetalhesMesProcessado } from "@/types/simulador";
import { ResultadoSimulacao } from "@/utils/investmentCalculator";
import { toast } from "@/components/ui/use-toast";

interface ConteudoEmpreendimentoProps {
  resultado: ResultadoSimulacao | null;
  dados: any;
  dadosEmpreendimento: DadosEmpreendimento;
  detalhesProcessados: DetalhesMesProcessado[];
  onEmpreendimentoChange: (campo: keyof DadosEmpreendimento, valor: any) => void;
  onEnviarPDF: () => void;
  onGerarPDF: () => void;
  setActiveTab: (tab: string) => void;
}

const ConteudoEmpreendimento: React.FC<ConteudoEmpreendimentoProps> = ({
  resultado,
  dados,
  dadosEmpreendimento,
  detalhesProcessados,
  onEmpreendimentoChange,
  onEnviarPDF,
  onGerarPDF,
  setActiveTab
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <FormularioEmpreendimento
          dadosEmpreendimento={dadosEmpreendimento}
          onChange={onEmpreendimentoChange}
          hasSimulacao={resultado !== null}
          onEnviarPDF={() => {
            if (!resultado) {
              toast({
                title: "Simulação necessária",
                description: "Por favor, realize a simulação antes de enviar o relatório.",
                variant: "destructive"
              });
              setActiveTab("simulacao");
              return;
            }
            
            if (!dadosEmpreendimento.nomeEmpreendimento || !dadosEmpreendimento.emailCliente) {
              toast({
                title: "Dados incompletos",
                description: "Por favor, preencha o nome do empreendimento e o email do cliente.",
                variant: "destructive"
              });
              return;
            }
            
            onEnviarPDF();
          }}
        />
      </div>
      
      <div className="lg:col-span-2">
        {resultado ? (
          <RelatorioPreview 
            resultado={resultado}
            dadosSimulacao={dados}
            dadosEmpreendimento={dadosEmpreendimento}
            detalhesProcessados={detalhesProcessados}
            onGerarPDF={onGerarPDF}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
              <h3 className="text-xl font-medium text-gray-600 mb-2">Relatório do Empreendimento</h3>
              <p className="text-gray-500">
                Realize uma simulação na aba "Simulação Básica" para visualizar e enviar o relatório.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConteudoEmpreendimento;
