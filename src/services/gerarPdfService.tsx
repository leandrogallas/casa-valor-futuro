
import { toast } from "@/components/ui/use-toast";
import { generatePDF, sendPDFByEmail } from "./pdfService";
import { ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, DetalhesMesProcessado } from "@/types/simulador";

export async function gerarEBaixarPDF(
  resultado: ResultadoSimulacao,
  dados: DadosSimulacao,
  dadosEmpreendimento: DadosEmpreendimento,
  detalhesProcessados: DetalhesMesProcessado[] | undefined
) {
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
      detalhesProcessados
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

export async function gerarEEnviarPDF(
  resultado: ResultadoSimulacao,
  dados: DadosSimulacao,
  dadosEmpreendimento: DadosEmpreendimento,
  detalhesProcessados: DetalhesMesProcessado[] | undefined
) {
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
      detalhesProcessados
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
