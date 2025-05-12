
import React from "react";
import { FileText, ChartBar, Table, Settings } from "lucide-react";
import { CardContent, Separator } from "@/components/ui/card";
import { ResultadoSimulacao, formatarMoeda } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, PDFOptions } from "@/types/simulador";
import { format } from "date-fns";

interface RelatorioPreviewTabProps {
  resultado: ResultadoSimulacao;
  dadosSimulacao: DadosSimulacao;
  dadosEmpreendimento: DadosEmpreendimento;
  opcoesPDF: PDFOptions;
}

const RelatorioPreviewTab: React.FC<RelatorioPreviewTabProps> = ({
  resultado,
  dadosSimulacao,
  dadosEmpreendimento,
  opcoesPDF,
}) => {
  const { totalInvestido, valorImovel, lucro, retornoPercentual, totalJurosParcelas, totalJurosReforcos } = resultado;

  // Ícones com cores
  const getIcon = (color: string) => (
    <div className={`bg-${color}-500 p-2 rounded-full text-white h-9 w-9 flex items-center justify-center`}>
      {color === "blue" && <ChartBar size={18} />}
      {color === "green" && <Table size={18} />}
      {color === "orange" && <Settings size={18} />}
    </div>
  );

  return (
    <CardContent className="p-6 space-y-6">
      {/* Seção de detalhes do empreendimento */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          {getIcon("blue")}
          <h3 className="text-lg font-semibold">Informações do Empreendimento</h3>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-md space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome do Empreendimento</p>
              <p className="font-medium">{dadosEmpreendimento.nomeEmpreendimento || "Não informado"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valor do Imóvel</p>
              <p className="font-medium">{formatarMoeda(dadosSimulacao.valorMercado)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Início das Obras</p>
              <p className="font-medium">
                {dadosEmpreendimento.dataInicio
                  ? format(dadosEmpreendimento.dataInicio, "dd/MM/yyyy")
                  : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Entrega Prevista</p>
              <p className="font-medium">
                {dadosEmpreendimento.dataEntrega
                  ? format(dadosEmpreendimento.dataEntrega, "dd/MM/yyyy")
                  : "Não informado"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Valorização Anual</p>
              <p className="font-medium">{(dadosSimulacao.valorizacao * 100).toFixed(2)}%</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Variação Anual do CUB</p>
              <p className="font-medium">{(dadosSimulacao.variancaoCubAnual * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Seção de resumo financeiro */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          {getIcon("green")}
          <h3 className="text-lg font-semibold">Resumo do Investimento</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-sm rounded-md p-4">
            <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
            <p className="text-xl font-bold">{formatarMoeda(totalInvestido)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm rounded-md p-4">
            <p className="text-sm font-medium text-muted-foreground">Valor Final do Imóvel</p>
            <p className="text-xl font-bold">{formatarMoeda(valorImovel)}</p>
          </div>
          
          <div className={`bg-gradient-to-br ${lucro > 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} border-none shadow-sm rounded-md p-4`}>
            <p className="text-sm font-medium text-muted-foreground">Lucro</p>
            <p className={`text-xl font-bold ${lucro > 0 ? "text-green-600" : "text-red-600"}`}>
              {formatarMoeda(lucro)}
            </p>
          </div>
          
          <div className={`bg-gradient-to-br ${retornoPercentual > 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} border-none shadow-sm rounded-md p-4`}>
            <p className="text-sm font-medium text-muted-foreground">Retorno sobre Investimento</p>
            <p className={`text-xl font-bold ${retornoPercentual > 0 ? "text-green-600" : "text-red-600"}`}>
              {(retornoPercentual * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
      
      <Separator />
      
      {/* Seção de detalhes do investimento */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          {getIcon("orange")}
          <h3 className="text-lg font-semibold">Detalhes do Investimento</h3>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Entrada</p>
              <p className="font-medium">{formatarMoeda(dadosSimulacao.entrada)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
              <p className="font-medium">{formatarMoeda(dadosSimulacao.parcelas)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Reforços Anuais</p>
              <p className="font-medium">{formatarMoeda(dadosSimulacao.reforcos)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Período</p>
              <p className="font-medium">{dadosSimulacao.meses} meses ({Math.floor(dadosSimulacao.meses / 12)} anos e {dadosSimulacao.meses % 12} meses)</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Juros Pagos (Parcelas)</p>
              <p className="font-medium">{formatarMoeda(totalJurosParcelas)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Juros Pagos (Reforços)</p>
              <p className="font-medium">{formatarMoeda(totalJurosReforcos)}</p>
            </div>
          </div>
        </div>
      </div>
      
      <RelatorioPreviewGraficos opcoesPDF={opcoesPDF} />
      
      <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white border border-dashed rounded-md">
        <p className="text-muted-foreground">O relatório em PDF incluirá todos os gráficos e tabelas selecionados nas opções.</p>
        <p className="text-muted-foreground text-sm mt-2">Clique em "Baixar PDF" para gerar o relatório completo.</p>
      </div>
    </CardContent>
  );
};

// Componente interno para a visualização dos gráficos e tabelas
const RelatorioPreviewGraficos: React.FC<{ opcoesPDF: PDFOptions }> = ({ opcoesPDF }) => {
  return (
    <div className="space-y-4">
      {opcoesPDF.incluirGraficoGlobal && (
        <div className="border p-3 rounded-md">
          <p className="text-sm font-medium mb-2">Evolução do Investimento (Gráfico Global)</p>
          <div className="h-40 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md flex items-center justify-center">
            <ChartBar size={40} className="text-muted-foreground/50" />
          </div>
        </div>
      )}
      
      {opcoesPDF.incluirGraficoMensal && (
        <div className="border p-3 rounded-md">
          <p className="text-sm font-medium mb-2">Ganhos de Capital Mensais</p>
          <div className="h-40 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-md flex items-center justify-center">
            <ChartBar size={40} className="text-muted-foreground/50" />
          </div>
        </div>
      )}
      
      {opcoesPDF.incluirTabela && (
        <div className="border p-3 rounded-md">
          <p className="text-sm font-medium mb-2">Tabela de Resumo Anual</p>
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-md p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mês</th>
                  <th className="text-left p-2">Investido</th>
                  <th className="text-left p-2">Valor Imóvel</th>
                  <th className="text-left p-2">Lucro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">12</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ X.XXX</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-2">24</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ X.XXX</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioPreviewTab;
