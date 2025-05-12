
import React from "react";
import { FileText } from "lucide-react";
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
  
  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gray-50 border-b">
        <div className="flex justify-between items-center">
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
          <Button onClick={onGerarPDF} className="bg-investment-primary hover:bg-investment-secondary">
            <FileText className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Seção de detalhes do empreendimento */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Informações do Empreendimento</h3>
          <div className="bg-gray-50 p-4 rounded-md space-y-2">
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
          <h3 className="text-lg font-semibold mb-3">Resumo do Investimento</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
                <p className="text-xl font-bold">{formatarMoeda(totalInvestido)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">Valor Final do Imóvel</p>
                <p className="text-xl font-bold">{formatarMoeda(valorImovel)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">Lucro</p>
                <p className="text-xl font-bold">{formatarMoeda(lucro)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-4">
                <p className="text-sm font-medium text-muted-foreground">Retorno sobre Investimento</p>
                <p className="text-xl font-bold">{(retornoPercentual * 100).toFixed(2)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Separator />
        
        {/* Seção de detalhes do investimento */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Detalhes do Investimento</h3>
          <div className="bg-gray-50 p-4 rounded-md">
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
        
        <div className="text-center p-6 bg-gray-50 border border-dashed rounded-md">
          <p className="text-muted-foreground">O relatório em PDF incluirá gráficos detalhados e tabelas anuais com a evolução do investimento.</p>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t p-4">
        <div className="w-full flex justify-end">
          <Button onClick={onGerarPDF} className="bg-investment-primary hover:bg-investment-secondary">
            <FileText className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default RelatorioPreview;
