
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSimulacao } from "@/hooks/useSimulacao";
import ConteudoSimulacao from "./simulador/ConteudoSimulacao";
import ConteudoEmpreendimento from "./simulador/ConteudoEmpreendimento";
import { gerarEBaixarPDF, gerarEEnviarPDF } from "@/services/gerarPdfService";

const SimuladorInvestimento: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("simulacao");
  
  const { 
    dados, 
    setDados,
    dadosEmpreendimento,
    handleEmpreendimentoChange,
    resultado,
    detalhesProcessados,
    calcularSimulacao
  } = useSimulacao();

  return (
    <div className="container py-8">
      <Tabs defaultValue="simulacao" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="simulacao">Simulação Básica</TabsTrigger>
          <TabsTrigger value="empreendimento">Detalhes do Empreendimento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulacao">
          <ConteudoSimulacao
            resultado={resultado}
            dados={dados}
            onDadosChange={setDados}
            onCalcular={calcularSimulacao}
          />
        </TabsContent>
        
        <TabsContent value="empreendimento">
          <ConteudoEmpreendimento 
            resultado={resultado}
            dados={dados}
            dadosEmpreendimento={dadosEmpreendimento}
            detalhesProcessados={detalhesProcessados}
            onEmpreendimentoChange={handleEmpreendimentoChange}
            setActiveTab={setActiveTab}
            onEnviarPDF={() => 
              gerarEEnviarPDF(resultado!, dados, dadosEmpreendimento, detalhesProcessados)
            }
            onGerarPDF={() => 
              gerarEBaixarPDF(resultado!, dados, dadosEmpreendimento, detalhesProcessados)
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimuladorInvestimento;
