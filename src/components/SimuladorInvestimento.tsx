
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormularioParametros from "./simulador/FormularioParametros";
import FormularioEmpreendimento from "./simulador/FormularioEmpreendimento";
import TelaInicial from "./simulador/TelaInicial";
import ResultadoInvestimento from "./ResultadoInvestimento";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { toast } from "@/components/ui/use-toast";
import { DadosSimulacao, DadosEmpreendimento } from "@/types/simulador";

const SimuladorInvestimento: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("simulacao");
  
  const [dados, setDados] = useState<DadosSimulacao>({
    valorMercado: 500000,
    valorCompra: 450000,
    valorizacao: 0.12,
    correcao: 0.06,
    entrada: 90000,
    parcelas: 360000,
    reforcos: 70000,
    meses: 120,
  });

  const [dadosEmpreendimento, setDadosEmpreendimento] = useState<DadosEmpreendimento>({
    nomeEmpreendimento: "",
    dataInicio: null,
    dataEntrega: null,
    emailCliente: "",
    mensagem: ""
  });

  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  const calcularSimulacao = () => {
    try {
      // Validações básicas
      if (dados.valorMercado <= 0 || dados.meses <= 0) {
        toast({
          title: "Dados inválidos",
          description: "Por favor, verifique os valores inseridos.",
          variant: "destructive"
        });
        return;
      }

      const resultadoCalculado = calcularSimulacaoInvestimento(dados);
      setResultado(resultadoCalculado);
      
      toast({
        title: "Simulação concluída!",
        description: "Os resultados foram calculados com sucesso."
      });
    } catch (error) {
      console.error("Erro ao calcular simulação:", error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao processar sua simulação.",
        variant: "destructive"
      });
    }
  };

  const handleEmpreendimentoChange = (campo: keyof DadosEmpreendimento, valor: any) => {
    setDadosEmpreendimento(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return (
    <div className="container py-8">
      <Tabs defaultValue="simulacao" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="simulacao">Simulação Básica</TabsTrigger>
          <TabsTrigger value="empreendimento">Detalhes do Empreendimento</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulacao">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <FormularioParametros 
                dados={dados} 
                onDadosChange={setDados} 
                onCalcular={calcularSimulacao} 
              />
            </div>
            
            <div className="lg:col-span-2">
              {resultado ? (
                <ResultadoInvestimento resultado={resultado} />
              ) : (
                <TelaInicial />
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="empreendimento">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <FormularioEmpreendimento
                dadosEmpreendimento={dadosEmpreendimento}
                onChange={handleEmpreendimentoChange}
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
                  
                  gerarEEnviarPDF();
                }}
              />
            </div>
            
            <div className="lg:col-span-2">
              {resultado ? (
                <RelatorioPreview 
                  resultado={resultado}
                  dadosSimulacao={dados}
                  dadosEmpreendimento={dadosEmpreendimento}
                  onGerarPDF={() => gerarEBaixarPDF()}
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
        </TabsContent>
      </Tabs>
    </div>
  );

  // Funções para geração e envio de PDF
  function gerarEBaixarPDF() {
    if (!resultado) return;
    
    toast({
      title: "Gerando PDF",
      description: "O PDF está sendo gerado, aguarde o download iniciar."
    });
    
    // Em uma implementação real, aqui chamaríamos o serviço de geração de PDF
    // Por enquanto simulamos com um timeout
    setTimeout(() => {
      toast({
        title: "PDF Gerado",
        description: "O PDF foi gerado e baixado com sucesso."
      });
    }, 1500);
  }
  
  function gerarEEnviarPDF() {
    if (!resultado || !dadosEmpreendimento.emailCliente) return;
    
    toast({
      title: "Enviando PDF",
      description: `Enviando para ${dadosEmpreendimento.emailCliente}, aguarde...`
    });
    
    // Em uma implementação real, aqui chamaríamos o serviço de envio de email com o PDF
    // Por enquanto simulamos com um timeout
    setTimeout(() => {
      toast({
        title: "PDF Enviado",
        description: `O relatório foi enviado com sucesso para ${dadosEmpreendimento.emailCliente}`
      });
    }, 1500);
  }
};

export default SimuladorInvestimento;
