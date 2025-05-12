
import { jsPDF } from "jspdf";
import { ResultadoSimulacao, formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, DetalhesMesProcessado } from "@/types/simulador";
import { Chart } from "chart.js/auto";
import { ArrowUp, ArrowDown } from "lucide-react";

// Configurações de estilo para o PDF
const styles = {
  colors: {
    primary: "#9b87f5",
    secondary: "#7E69AB", 
    success: "#22C55E",
    danger: "#EF4444",
    warning: "#F97316",
    info: "#0EA5E9",
    light: "#F9FAFB",
    dark: "#1A1F2C",
  },
  fonts: {
    heading: "helvetica",
    body: "helvetica",
  }
};

// Função para criar um gráfico como imagem para o PDF
const createChartImage = async (
  detalhesProcessed: DetalhesMesProcessado[],
  chartType: "global" | "monthly" | "comparative" = "global"
): Promise<string> => {
  // Filtrar dados para não sobrecarregar o gráfico
  const filteredData = detalhesProcessed.filter((_, i) => i % 3 === 0 || i === detalhesProcessed.length - 1);
  
  // Preparar dados para o Chart.js
  const labels = filteredData.map(item => `Mês ${item.mes}`);
  
  // Configurar datasets baseado no tipo de gráfico
  let datasets = [];
  
  if (chartType === "global") {
    datasets = [
      {
        label: "Valor Imóvel",
        data: filteredData.map(item => item.valorImovel),
        borderColor: "#9b87f5",
        backgroundColor: "rgba(155, 135, 245, 0.1)",
        tension: 0.3,
      },
      {
        label: "Total Investido",
        data: filteredData.map(item => item.investido),
        borderColor: "#7E69AB",
        backgroundColor: "rgba(126, 105, 171, 0.1)",
        tension: 0.3,
      },
      {
        label: "Saldo Devedor",
        data: filteredData.map(item => item.saldoDevedor),
        borderColor: "#F97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        tension: 0.3,
      }
    ];
  } else if (chartType === "monthly") {
    datasets = [
      {
        label: "Ganho Capital Mensal",
        data: filteredData.map(item => item.ganhoCapitalMensal),
        backgroundColor: "#FEC6A1",
        type: "bar",
      },
      {
        label: "Ganho Capital Acumulado",
        data: filteredData.map(item => item.ganhoCapitalAcumulado),
        borderColor: "#F97316",
        tension: 0.3,
        type: "line",
      }
    ];
  } else if (chartType === "comparative") {
    datasets = [
      {
        label: "Valor do Imóvel",
        data: filteredData.map(item => item.valorImovel),
        borderColor: "#9b87f5",
        tension: 0.3,
      },
      {
        label: "Lucro Líquido",
        data: filteredData.map(item => item.lucroLiquido),
        borderColor: "#22C55E",
        tension: 0.3,
      }
    ];
  }

  // Criar um canvas para o Chart.js
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  document.body.appendChild(canvas);

  // Criar gráfico
  const chart = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        title: {
          display: true,
          text: chartType === "global" 
            ? "Evolução do Investimento"
            : chartType === "monthly"
              ? "Ganho de Capital Mensal"
              : "Comparativo de Valores",
          font: {
            size: 16,
            weight: "bold",
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: function(value) {
              return formatarMoeda(Number(value));
            }
          }
        }
      }
    }
  });

  // Renderizar e obter imagem
  await new Promise(resolve => setTimeout(resolve, 100)); // Aguardar pela renderização
  const imageData = canvas.toDataURL("image/png");
  
  // Limpar
  chart.destroy();
  document.body.removeChild(canvas);

  return imageData;
};

// Generate a PDF with simulation results and project details
export const generatePDF = async (
  resultado: ResultadoSimulacao,
  dadosSimulacao: DadosSimulacao,
  dadosEmpreendimento: DadosEmpreendimento,
  detalhesProcessed?: DetalhesMesProcessado[]
): Promise<Blob> => {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Define estilo consistente com o simulador
  doc.setFont(styles.fonts.heading, "bold");
  doc.setFontSize(20);
  doc.setTextColor(styles.colors.dark);
  
  // Gradient header
  const createGradientBackground = (y: number, height: number, colors: string[]) => {
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = parseInt(colors[0].slice(1, 3), 16) * (1 - ratio) + parseInt(colors[1].slice(1, 3), 16) * ratio;
      const g = parseInt(colors[0].slice(3, 5), 16) * (1 - ratio) + parseInt(colors[1].slice(3, 5), 16) * ratio;
      const b = parseInt(colors[0].slice(5, 7), 16) * (1 - ratio) + parseInt(colors[1].slice(5, 7), 16) * ratio;
      
      doc.setFillColor(r, g, b);
      doc.rect(0, y + i, pageWidth, 1, "F");
    }
  };
  
  // Add header with gradient and title
  createGradientBackground(0, 40, ["#9b87f5", "#D6BCFA"]);
  doc.text(`Relatório de Investimento Imobiliário`, margin, 25);
  
  if (dadosEmpreendimento.nomeEmpreendimento) {
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(dadosEmpreendimento.nomeEmpreendimento, margin, 35);
  }
  
  // Add date
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const today = new Date().toLocaleDateString('pt-BR');
  doc.text(`Gerado em: ${today}`, pageWidth - margin - 40, 35, { align: "left" });
  
  // Current Y position for content
  let y = 55;
  
  // Card de resumo principal
  const drawCard = (title: string, value: string, x: number, y: number, width: number, height: number, 
                   colorStart: string, colorEnd: string, icon?: string) => {
    // Background gradient
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = parseInt(colorStart.slice(1, 3), 16) * (1 - ratio) + parseInt(colorEnd.slice(1, 3), 16) * ratio;
      const g = parseInt(colorStart.slice(3, 5), 16) * (1 - ratio) + parseInt(colorEnd.slice(3, 5), 16) * ratio;
      const b = parseInt(colorStart.slice(5, 7), 16) * (1 - ratio) + parseInt(colorEnd.slice(5, 7), 16) * ratio;
      
      doc.setFillColor(r, g, b);
      doc.roundedRect(x, y + i, width, 1, 1, 1, "F");
    }
    
    // Border
    doc.setDrawColor(240, 240, 240);
    doc.roundedRect(x, y, width, height, 1, 1, "S");
    
    // Title
    doc.setFont(styles.fonts.body, "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(title, x + 5, y + 10);
    
    // Value
    doc.setFont(styles.fonts.body, "bold");
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(value, x + 5, y + 20);
  };
  
  // Seção: Resultados da Simulação
  doc.setFont(styles.fonts.heading, "bold");
  doc.setFontSize(16);
  doc.setTextColor(styles.colors.dark);
  doc.text("Resumo da Simulação", margin, y);
  y += 10;
  
  // Cards de métricas principais - 2x2 grid
  const cardWidth = contentWidth / 2 - 5;
  const cardHeight = 25;
  
  drawCard("Total Investido", formatarMoeda(resultado.totalInvestido), 
           margin, y, cardWidth, cardHeight, "#E5DEFF", "#FFFFFF");
  
  drawCard("Valor Final do Imóvel", formatarMoeda(resultado.valorImovel), 
           margin + cardWidth + 10, y, cardWidth, cardHeight, "#D3E4FD", "#FFFFFF");
  
  y += cardHeight + 10;
  
  drawCard("Lucro", formatarMoeda(resultado.lucro), 
           margin, y, cardWidth, cardHeight, 
           resultado.lucro > 0 ? "#F2FCE2" : "#FFDEE2", "#FFFFFF");
  
  drawCard("Retorno sobre Investimento", formatarPercentual(resultado.retornoPercentual), 
           margin + cardWidth + 10, y, cardWidth, cardHeight, 
           resultado.retornoPercentual > 0 ? "#F2FCE2" : "#FFDEE2", "#FFFFFF");
  
  y += cardHeight + 20;
  
  // Seção: Detalhes do Empreendimento
  doc.setFont(styles.fonts.heading, "bold");
  doc.setFontSize(16);
  doc.setTextColor(styles.colors.dark);
  doc.text("Detalhes do Empreendimento", margin, y);
  y += 10;
  
  // Box para detalhes
  doc.setFillColor(249, 250, 251); // Light gray background
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "S");
  
  // Grid de informações - 2 columns
  doc.setFont(styles.fonts.body, "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  const col1X = margin + 5;
  const col2X = margin + contentWidth/2 + 5;
  let detailY = y + 10;
  
  // Column 1
  doc.text("Nome do Empreendimento:", col1X, detailY);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(dadosEmpreendimento.nomeEmpreendimento || "Não informado", col1X, detailY + 5);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Data de Início:", col1X, detailY + 15);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(dadosEmpreendimento.dataInicio ? 
    new Date(dadosEmpreendimento.dataInicio).toLocaleDateString('pt-BR') : "Não informada", col1X, detailY + 20);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Valorização Anual:", col1X, detailY + 30);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(`${(dadosSimulacao.valorizacao * 100).toFixed(2)}%`, col1X, detailY + 35);
  
  // Column 2
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Valor do Imóvel:", col2X, detailY);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(formatarMoeda(dadosSimulacao.valorMercado), col2X, detailY + 5);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Data de Entrega:", col2X, detailY + 15);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(dadosEmpreendimento.dataEntrega ? 
    new Date(dadosEmpreendimento.dataEntrega).toLocaleDateString('pt-BR') : "Não informada", col2X, detailY + 20);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Correção Anual:", col2X, detailY + 30);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(`${(dadosSimulacao.correcao * 100).toFixed(2)}%`, col2X, detailY + 35);
  
  y += 60;
  
  // Seção: Detalhes do Investimento
  doc.setFont(styles.fonts.heading, "bold");
  doc.setFontSize(16);
  doc.setTextColor(styles.colors.dark);
  doc.text("Detalhes do Investimento", margin, y);
  y += 10;
  
  // Box para detalhes do investimento
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "F");
  doc.setDrawColor(230, 230, 230);
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, "S");
  
  detailY = y + 10;
  
  // Column 1
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Entrada:", col1X, detailY);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(formatarMoeda(dadosSimulacao.entrada), col1X, detailY + 5);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Parcelas:", col1X, detailY + 15);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(formatarMoeda(dadosSimulacao.parcelas), col1X, detailY + 20);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Juros Pagos (Parcelas):", col1X, detailY + 30);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(formatarMoeda(resultado.totalJurosParcelas), col1X, detailY + 35);
  
  // Column 2
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Período:", col2X, detailY);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(`${dadosSimulacao.meses} meses (${Math.floor(dadosSimulacao.meses / 12)} anos e ${dadosSimulacao.meses % 12} meses)`, col2X, detailY + 5);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Reforços Anuais:", col2X, detailY + 15);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(formatarMoeda(dadosSimulacao.reforcos), col2X, detailY + 20);
  doc.setFont(styles.fonts.body, "normal");
  doc.setTextColor(100, 100, 100);
  
  doc.text("Juros Pagos (Reforços):", col2X, detailY + 30);
  doc.setFont(styles.fonts.body, "bold");
  doc.setTextColor(60, 60, 60);
  doc.text(formatarMoeda(resultado.totalJurosReforcos), col2X, detailY + 35);
  
  y += 60;
  
  // Adicionar gráficos se os dados detalhados estiverem disponíveis
  if (detalhesProcessed && detalhesProcessed.length > 0) {
    // Gerar imagem do gráfico global
    try {
      doc.setFont(styles.fonts.heading, "bold");
      doc.setFontSize(16);
      doc.setTextColor(styles.colors.dark);
      doc.text("Evolução do Investimento", margin, y);
      y += 10;
      
      const chartImage = await createChartImage(detalhesProcessed, "global");
      const imgWidth = contentWidth;
      const imgHeight = 80;
      doc.addImage(chartImage, "PNG", margin, y, imgWidth, imgHeight);
      
      y += imgHeight + 15;
      
      // Verificar se precisa de nova página para o gráfico mensal
      if (y + 100 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      
      // Adicionar gráfico mensal
      doc.setFont(styles.fonts.heading, "bold");
      doc.setFontSize(16);
      doc.setTextColor(styles.colors.dark);
      doc.text("Ganhos de Capital Mensais", margin, y);
      y += 10;
      
      const monthlyChartImage = await createChartImage(detalhesProcessed, "monthly");
      doc.addImage(monthlyChartImage, "PNG", margin, y, imgWidth, imgHeight);
      
      y += imgHeight + 15;
      
      // Verificar se precisa de nova página para tabela
      if (y + 60 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    } catch (error) {
      console.error("Erro ao criar gráfico:", error);
      // Continuar sem gráficos
    }
    
    // Tabela de resumo anual
    const yearlyData = detalhesProcessed.filter(item => item.mes % 12 === 0 || item.mes === 1 || 
      item.mes === detalhesProcessed.length);
    
    if (yearlyData.length > 0) {
      doc.setFont(styles.fonts.heading, "bold");
      doc.setFontSize(16);
      doc.setTextColor(styles.colors.dark);
      doc.text("Resumo Anual", margin, y);
      y += 10;
      
      // Cabeçalho da tabela
      const headers = ["Mês", "Investido", "Valor Imóvel", "Lucro Líquido"];
      const colWidths = [20, 45, 45, 45];
      
      // Desenhar cabeçalho
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentWidth, 10, "F");
      
      doc.setFont(styles.fonts.body, "bold");
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      
      let xPos = margin;
      headers.forEach((header, i) => {
        doc.text(header, xPos + 3, y + 6);
        xPos += colWidths[i];
      });
      
      y += 10;
      
      // Dados da tabela (limitar a 10 linhas para caber na página)
      const maxRows = Math.min(yearlyData.length, 10);
      const rowHeight = 8;
      
      doc.setFont(styles.fonts.body, "normal");
      doc.setFontSize(9);
      
      for (let i = 0; i < maxRows; i++) {
        const item = yearlyData[i];
        
        // Alternar cores de fundo
        if (i % 2 === 1) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, y, contentWidth, rowHeight, "F");
        }
        
        xPos = margin;
        doc.text(`${item.mes}`, xPos + 3, y + 5);
        xPos += colWidths[0];
        
        doc.text(formatarMoeda(item.investido), xPos + 3, y + 5);
        xPos += colWidths[1];
        
        doc.text(formatarMoeda(item.valorImovel), xPos + 3, y + 5);
        xPos += colWidths[2];
        
        doc.text(formatarMoeda(item.lucroLiquido), xPos + 3, y + 5);
        
        y += rowHeight;
      }
    }
  }
  
  // Footer na última página
  const addFooter = () => {
    const footerY = pageHeight - 15;
    doc.setFont(styles.fonts.body, "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Simulação de Investimento Imobiliário - Relatório Gerado Automaticamente", pageWidth / 2, footerY, { align: "center" });
    
    // Numeração de página
    doc.text(`${doc.getCurrentPageInfo().pageNumber}/${doc.getNumberOfPages()}`, pageWidth - margin, footerY, { align: "right" });
  };
  
  // Adicionar footer a todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }
  
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
