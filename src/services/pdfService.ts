
import { jsPDF } from "jspdf";
import { ResultadoSimulacao, formatarMoeda } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento } from "@/types/simulador";

// Generate a PDF with simulation results and project details
export const generatePDF = async (
  resultado: ResultadoSimulacao,
  dadosSimulacao: DadosSimulacao,
  dadosEmpreendimento: DadosEmpreendimento
): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  const title = `Relatório de Investimento`;
  doc.text(title, pageWidth / 2, 20, { align: "center" });
  
  if (dadosEmpreendimento.nomeEmpreendimento) {
    doc.setFontSize(16);
    doc.text(dadosEmpreendimento.nomeEmpreendimento, pageWidth / 2, 30, { align: "center" });
  }
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Data: ${today}`, pageWidth - 20, 40, { align: "right" });
  
  // Add horizontal separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 45, pageWidth - 20, 45);
  
  // Project details section
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text("Detalhes do Empreendimento", 20, 55);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  let y = 65;
  
  // Project name
  doc.text(`Nome do Empreendimento: ${dadosEmpreendimento.nomeEmpreendimento || "Não informado"}`, 25, y);
  y += 8;
  
  // Project dates
  doc.text(`Data de Início: ${dadosEmpreendimento.dataInicio ? 
    new Date(dadosEmpreendimento.dataInicio).toLocaleDateString('pt-BR') : "Não informada"}`, 25, y);
  y += 8;
  
  doc.text(`Data de Entrega: ${dadosEmpreendimento.dataEntrega ? 
    new Date(dadosEmpreendimento.dataEntrega).toLocaleDateString('pt-BR') : "Não informada"}`, 25, y);
  y += 8;
  
  // Investment parameters
  doc.text(`Valor de Mercado: ${formatarMoeda(dadosSimulacao.valorMercado)}`, 25, y);
  y += 8;
  
  doc.text(`Período: ${dadosSimulacao.meses} meses (${Math.floor(dadosSimulacao.meses / 12)} anos e ${dadosSimulacao.meses % 12} meses)`, 25, y);
  y += 8;
  
  doc.text(`Valorização Anual: ${(dadosSimulacao.valorizacao * 100).toFixed(2)}%`, 25, y);
  y += 8;
  
  doc.text(`Correção Anual: ${(dadosSimulacao.correcao * 100).toFixed(2)}%`, 25, y);
  y += 15;
  
  // Add a separator
  doc.line(20, y, pageWidth - 20, y);
  y += 15;
  
  // Results section
  doc.setFontSize(14);
  doc.setTextColor(44, 62, 80);
  doc.text("Resultados da Simulação", 20, y);
  y += 10;
  
  // Create a simple table for results
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  
  // Column 1 - Key financial metrics
  doc.text("Total Investido:", 25, y);
  doc.text(`${formatarMoeda(resultado.totalInvestido)}`, 90, y);
  y += 8;
  
  doc.text("Valor Final do Imóvel:", 25, y);
  doc.text(`${formatarMoeda(resultado.valorImovel)}`, 90, y);
  y += 8;
  
  doc.text("Lucro:", 25, y);
  doc.text(`${formatarMoeda(resultado.lucro)}`, 90, y);
  y += 8;
  
  doc.text("Retorno sobre Investimento:", 25, y);
  doc.text(`${(resultado.retornoPercentual * 100).toFixed(2)}%`, 90, y);
  y += 8;
  
  // Column 2 - More metrics
  y = y - 32; // Go back up for column 2
  
  doc.text("Entrada:", 120, y);
  doc.text(`${formatarMoeda(dadosSimulacao.entrada)}`, 185, y);
  y += 8;
  
  doc.text("Parcelas Totais:", 120, y);
  doc.text(`${formatarMoeda(dadosSimulacao.parcelas)}`, 185, y);
  y += 8;
  
  doc.text("Reforços Anuais:", 120, y);
  doc.text(`${formatarMoeda(dadosSimulacao.reforcos)}`, 185, y);
  y += 8;
  
  doc.text("Total Juros Pagos:", 120, y);
  doc.text(`${formatarMoeda(resultado.totalJurosParcelas + resultado.totalJurosReforcos)}`, 185, y);
  y += 24;
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Simulação de Investimento Imobiliário - Relatório Gerado Automaticamente", pageWidth / 2, 280, { align: "center" });
  
  // Convert the PDF to a Blob
  const pdfBlob = doc.output('blob');
  return pdfBlob;
};

export const sendPDFByEmail = async (
  pdfBlob: Blob,
  recipientEmail: string,
  subject: string,
  message: string
): Promise<boolean> => {
  console.log("Enviando PDF para:", recipientEmail, {
    subject,
    message,
    pdfSize: pdfBlob.size
  });
  
  // Em uma implementação real, aqui chamaríamos uma API para enviar o email com o PDF anexado
  // Por enquanto, simulamos o envio com um timeout
  
  return new Promise((resolve) => {
    // Simular um atraso na rede para dar feedback ao usuário
    setTimeout(() => {
      resolve(true); // Simulação de envio bem-sucedido
    }, 1500);
  });
};
