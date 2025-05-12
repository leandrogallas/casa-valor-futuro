
import React, { useState } from "react";
import { FileText, Download, Mail, ChartBar, Table, Settings } from "lucide-react";
import { format } from "date-fns";
import { ResultadoSimulacao, formatarMoeda } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento } from "@/types/simulador";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RelatorioPreviewProps {
  resultado: ResultadoSimulacao;
  dadosSimulacao: DadosSimulacao;
  dadosEmpreendimento: DadosEmpreendimento;
  onGerarPDF: () => void;
}

const RelatorioPreview: React.FC<RelatorioPreviewProps> = ({
  resultado,
  dadosSimulacao,
  dadosEmpreendimento,
  onGerarPDF
}) => {
  const { totalInvestido, valorImovel, lucro, retornoPercentual } = resultado;

  // Estado para opções de personalização do PDF
  const [opcoesPDF, setOpcoesPDF] = useState({
    incluirGraficoGlobal: true,
    incluirGraficoMensal: true,
    incluirTabela: true
  });

  // Ícones com cores
  const getIcon = (color: string) => (
    <div className={`bg-${color}-500 p-2 rounded-full text-white h-9 w-9 flex items-center justify-center`}>
      {color === "purple" && <FileText size={18} />}
      {color === "blue" && <ChartBar size={18} />}
      {color === "green" && <Table size={18} />}
      {color === "orange" && <Settings size={18} />}
    </div>
  );
  
  return (
    <Card className="shadow-lg">
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
      
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
          <TabsTrigger value="preview" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <FileText className="mr-2 h-4 w-4" />
            Visualização
          </TabsTrigger>
          <TabsTrigger value="options" className="rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary">
            <Settings className="mr-2 h-4 w-4" />
            Opções
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preview" className="m-0 p-0">
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
                    <p className="text-sm font-medium text-muted-foreground">Correção Anual</p>
                    <p className="font-medium">{(dadosSimulacao.correcao * 100).toFixed(2)}%</p>
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
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
                    <p className="text-xl font-bold">{formatarMoeda(totalInvestido)}</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Valor Final do Imóvel</p>
                    <p className="text-xl font-bold">{formatarMoeda(valorImovel)}</p>
                  </CardContent>
                </Card>
                
                <Card className={`bg-gradient-to-br ${lucro > 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} border-none shadow-sm`}>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Lucro</p>
                    <p className={`text-xl font-bold ${lucro > 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatarMoeda(lucro)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className={`bg-gradient-to-br ${retornoPercentual > 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} border-none shadow-sm`}>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground">Retorno sobre Investimento</p>
                    <p className={`text-xl font-bold ${retornoPercentual > 0 ? "text-green-600" : "text-red-600"}`}>
                      {(retornoPercentual * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>
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
                    <p className="font-medium">{formatarMoeda(resultado.totalJurosParcelas)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total de Juros Pagos (Reforços)</p>
                    <p className="font-medium">{formatarMoeda(resultado.totalJurosReforcos)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview de gráficos e tabelas */}
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
            
            <div className="text-center p-6 bg-gradient-to-b from-gray-50 to-white border border-dashed rounded-md">
              <p className="text-muted-foreground">O relatório em PDF incluirá todos os gráficos e tabelas selecionados nas opções.</p>
              <p className="text-muted-foreground text-sm mt-2">Clique em "Baixar PDF" para gerar o relatório completo.</p>
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="options" className="m-0 p-0">
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
        </TabsContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 border-t p-4">
        <div className="w-full flex justify-between items-center">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Opções de Envio
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="space-y-2">
                <h4 className="font-medium">Envio do Relatório</h4>
                <p className="text-sm text-muted-foreground">
                  Na aba "Detalhes do Empreendimento" você pode enviar este relatório 
                  por e-mail para o cliente.
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
          <Button onClick={onGerarPDF} className="bg-investment-primary hover:bg-investment-secondary">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RelatorioPreview;
