
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import ResultadoInvestimento from "./ResultadoInvestimento";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { toast } from "@/components/ui/use-toast";

interface DadosSimulacao {
  valorMercado: number;
  valorCompra: number;
  valorizacao: number;
  correcao: number;
  entrada: number;
  parcelas: number;
  reforcos: number;
  meses: number;
}

const SimuladorInvestimento: React.FC = () => {
  const [dados, setDados] = useState<DadosSimulacao>({
    valorMercado: 500000,
    valorCompra: 450000,
    valorizacao: 0.12,
    correcao: 0.06,
    entrada: 20000,
    parcelas: 360000,
    reforcos: 70000,
    meses: 120,
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

  const handleInputChange = (campo: keyof DadosSimulacao) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value === '' ? 0 : parseFloat(e.target.value);
    setDados({ ...dados, [campo]: valor });
  };

  const handleSliderChange = (campo: keyof DadosSimulacao) => (valor: number[]) => {
    setDados({ ...dados, [campo]: valor[0] });
  };

  const formatarPercentual = (valor: number): string => {
    return `${(valor * 100).toFixed(2)}%`;
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-investment-dark">
        Simulador de Investimento Imobiliário
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="border-investment-primary/20">
            <CardHeader>
              <CardTitle>Parâmetros da Simulação</CardTitle>
              <CardDescription>
                Configure os valores para simular seu investimento imobiliário
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Valores do Imóvel</h3>
                <div className="space-y-2">
                  <Label htmlFor="valorMercado">Valor de Mercado (R$)</Label>
                  <Input
                    id="valorMercado"
                    type="number"
                    value={dados.valorMercado}
                    onChange={handleInputChange('valorMercado')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="valorCompra">Valor de Compra (R$)</Label>
                  <Input
                    id="valorCompra"
                    type="number"
                    value={dados.valorCompra}
                    onChange={handleInputChange('valorCompra')}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Taxas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="valorizacao">Valorização Anual</Label>
                    <span className="text-sm font-medium">{formatarPercentual(dados.valorizacao)}</span>
                  </div>
                  <Slider
                    id="valorizacao"
                    min={0}
                    max={0.25}
                    step={0.01}
                    value={[dados.valorizacao]}
                    onValueChange={handleSliderChange('valorizacao')}
                  />
                  <Input
                    type="number"
                    value={dados.valorizacao}
                    onChange={handleInputChange('valorizacao')}
                    step="0.01"
                    className="mt-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="correcao">Correção Anual das Parcelas</Label>
                    <span className="text-sm font-medium">{formatarPercentual(dados.correcao)}</span>
                  </div>
                  <Slider
                    id="correcao"
                    min={0}
                    max={0.15}
                    step={0.01}
                    value={[dados.correcao]}
                    onValueChange={handleSliderChange('correcao')}
                  />
                  <Input
                    type="number"
                    value={dados.correcao}
                    onChange={handleInputChange('correcao')}
                    step="0.01"
                    className="mt-1"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Valores do Investimento</h3>
                <div className="space-y-2">
                  <Label htmlFor="entrada">Entrada (R$)</Label>
                  <Input
                    id="entrada"
                    type="number"
                    value={dados.entrada}
                    onChange={handleInputChange('entrada')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parcelas">Total em Parcelas (R$)</Label>
                  <Input
                    id="parcelas"
                    type="number"
                    value={dados.parcelas}
                    onChange={handleInputChange('parcelas')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reforcos">Total em Reforços Anuais (R$)</Label>
                  <Input
                    id="reforcos"
                    type="number"
                    value={dados.reforcos}
                    onChange={handleInputChange('reforcos')}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="meses">Período (meses)</Label>
                  <Input
                    id="meses"
                    type="number"
                    value={dados.meses}
                    onChange={handleInputChange('meses')}
                  />
                </div>
              </div>
              
              <Button 
                onClick={calcularSimulacao} 
                className="w-full mt-4 bg-investment-primary hover:bg-investment-secondary"
              >
                Calcular Simulação
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {resultado ? (
            <ResultadoInvestimento resultado={resultado} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
                <h3 className="text-xl font-medium text-gray-600 mb-2">Sem dados de simulação</h3>
                <p className="text-gray-500">
                  Configure os parâmetros e clique em "Calcular Simulação" 
                  para visualizar os resultados.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimuladorInvestimento;
