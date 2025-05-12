import React from "react";
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
import { DadosSimulacao } from "@/types/simulador";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FormularioParametrosProps {
  dados: DadosSimulacao;
  onDadosChange: (dados: DadosSimulacao) => void;
  onCalcular: () => void;
}

const FormularioParametros: React.FC<FormularioParametrosProps> = ({
  dados,
  onDadosChange,
  onCalcular
}) => {
  const handleInputChange = (campo: keyof DadosSimulacao) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value === '' ? 0 : parseFloat(e.target.value);
    onDadosChange({ ...dados, [campo]: valor });
  };

  const handleSliderChange = (campo: keyof DadosSimulacao) => (valor: number[]) => {
    onDadosChange({ ...dados, [campo]: valor[0] });
  };

  const formatarPercentual = (valor: number): string => {
    return `${(valor * 100).toFixed(2)}%`;
  };

  return (
    <Card className="border-investment-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Parâmetros da Simulação</CardTitle>
        <CardDescription>
          Ajuste os valores para simular seu investimento imobiliário
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
          <h3 className="font-semibold text-sm text-muted-foreground">Taxas e Índices</h3>
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="cubInicial">Valor do CUB Inicial (R$/m²)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-muted-foreground">
                        <Info size={14} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Custo Unitário Básico na data do contrato. Este é o valor base para as correções.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{dados.cubInicial}</span>
            </div>
            <Input
              id="cubInicial"
              type="number"
              value={dados.cubInicial}
              onChange={handleInputChange('cubInicial')}
              step="1"
              className="mt-1"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Label htmlFor="variancaoCubAnual">Variação Anual do CUB</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help text-muted-foreground">
                        <Info size={14} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p>Variação anual média do CUB que será aplicada para corrigir parcelas e reforços.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">{formatarPercentual(dados.variancaoCubAnual)}</span>
            </div>
            <Slider
              id="variancaoCubAnual"
              min={0}
              max={0.15}
              step={0.01}
              value={[dados.variancaoCubAnual]}
              onValueChange={handleSliderChange('variancaoCubAnual')}
            />
            <Input
              type="number"
              value={dados.variancaoCubAnual}
              onChange={handleInputChange('variancaoCubAnual')}
              step="0.01"
              className="mt-1"
            />
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-200">
            <p className="font-medium mb-1">O que é o CUB?</p>
            <p>O Custo Unitário Básico (CUB) é um indicador dos custos de construção civil, utilizado para correção de contratos imobiliários. A fórmula usada é: <span className="font-mono bg-white px-1 rounded">Valor corrigido = Valor original × (CUB atual / CUB inicial)</span></p>
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
          onClick={onCalcular} 
          className="w-full mt-4 bg-investment-primary hover:bg-investment-secondary"
        >
          Calcular Simulação
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormularioParametros;
