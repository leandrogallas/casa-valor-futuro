
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormularioParametros from "./simulador/FormularioParametros";
import FormularioEmpreendimento from "./simulador/FormularioEmpreendimento";
import TelaInicial from "./simulador/TelaInicial";
import ResultadoInvestimento from "./ResultadoInvestimento";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { toast } from "@/components/ui/use-toast";
import { DadosSimulacao, DadosEmpreendimento, DetalhesMesProcessado } from "@/types/simulador";
import { RelatorioPreview } from "./simulador/RelatorioImports";
import { generatePDF, sendPDFByEmail } from "@/services/pdfService";

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
  // Estado para armazenar os dados processados para os gráficos
  const [detalhesProcessados, setDetalhesProcessados] = useState<DetalhesMesProcessado[]>([]);

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
      
      // Processar detalhes para os gráficos e PDF
      processarDetalhesMensais(resultadoCalculado);
      
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

  // Função para processar os detalhes mensais
  const processarDetalhesMensais = (resultado: ResultadoSimulacao) => {
    const { detalhes } = resultado;
    
    if (!detalhes || detalhes.length === 0) {
      setDetalhesProcessados([]);
      return;
    }

    const processados: DetalhesMesProcessado[] = [];
    
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // Monthly capital gain (valorização do mês)
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - detalhes[0].valorImovel;
      
      // Ganho real é apenas a valorização do imóvel
      const ganhoReal = mes.valorImovel - detalhes[0].valorImovel;
      
      // Juros pagos são a parte da parcela que não amortiza a dívida
      // Calculamos o juro com base na taxa sobre o saldo devedor anterior
      const jurosMesPago = index > 0 
        ? (mesAnterior.saldoDevedor * (Math.pow(1 + resultado.taxaCorrecao, 1/12) - 1)) 
        : 0;
      
      // Calcular o juro acumulado até este mês (soma de todos os juros pagos até agora)
      const jurosPagos = index > 0 
        ? processados[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // Juros relacionados aos reforços para este mês específico
      const jurosReforcoMesPago = mes.temReforco && index > 0
        ? (resultado.totalJurosReforcos / Math.floor(detalhes.length / 12)) * (Math.floor(index / 12) + 1) / Math.floor(detalhes.length / 12)
        : 0;
      
      // Juros acumulados relacionados aos reforços
      const jurosReforcosPagos = index > 0
        ? processados[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // Lucro líquido é a diferença entre o ganho real (valorização) e os juros pagos (parcelas + reforços)
      const lucroLiquido = ganhoReal - jurosPagos - jurosReforcosPagos;
      
      // Valorização prevista (acumulada desde o início)
      const valorizacaoPrevista = mes.valorImovel - detalhes[0].valorImovel;
      
      processados.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado: ganhoReal, // Mesmo que ganhoReal
        ganhoReal,
        jurosPagos,
        jurosMesPago,
        jurosReforcosPagos,
        jurosReforcoMesPago,
        lucroLiquido,
        valorizacaoPrevista,
        temReforco: mes.temReforco
      });
    });
    
    setDetalhesProcessados(processados);
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
  async function gerarEBaixarPDF() {
    if (!resultado) return;
    
    toast({
      title: "Gerando PDF",
      description: "O PDF está sendo gerado, aguarde o download iniciar."
    });
    
    try {
      // Gerar o PDF usando o serviço e passando os dados processados
      const pdfBlob = await generatePDF(
        resultado, 
        dados, 
        dadosEmpreendimento,
        detalhesProcessados.length > 0 ? detalhesProcessados : undefined
      );
      
      // Criar URL para o blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Criar elemento de link e simular clique para download
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `relatorio-${dadosEmpreendimento.nomeEmpreendimento || 'investimento'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar a URL do objeto
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
      toast({
        title: "PDF Gerado",
        description: "O PDF foi gerado e baixado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive"
      });
    }
  }
  
  async function gerarEEnviarPDF() {
    if (!resultado || !dadosEmpreendimento.emailCliente) return;
    
    toast({
      title: "Enviando PDF",
      description: `Enviando para ${dadosEmpreendimento.emailCliente}, aguarde...`
    });
    
    try {
      // Gerar o PDF usando o serviço
      const pdfBlob = await generatePDF(
        resultado, 
        dados, 
        dadosEmpreendimento,
        detalhesProcessados.length > 0 ? detalhesProcessados : undefined
      );
      
      // Enviar o PDF por email
      const subject = `Simulação de Investimento - ${dadosEmpreendimento.nomeEmpreendimento || 'Novo Empreendimento'}`;
      const message = dadosEmpreendimento.mensagem || "Segue anexo a simulação do investimento solicitado.";
      
      const enviado = await sendPDFByEmail(
        pdfBlob,
        dadosEmpreendimento.emailCliente,
        subject,
        message
      );
      
      if (enviado) {
        toast({
          title: "PDF Enviado",
          description: `O relatório foi enviado com sucesso para ${dadosEmpreendimento.emailCliente}`
        });
      } else {
        throw new Error("Falha no envio do email");
      }
    } catch (error) {
      console.error("Erro ao enviar PDF:", error);
      toast({
        title: "Erro ao enviar PDF",
        description: "Ocorreu um erro ao enviar o PDF por email. Tente novamente.",
        variant: "destructive"
      });
    }
  }
};

export default SimuladorInvestimento;
