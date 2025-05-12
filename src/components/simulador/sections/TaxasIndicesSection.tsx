
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info } from "lucide-react";
import { DadosSimulacao } from "@/types/simulador";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaxasIndicesSectionProps {
  dados: DadosSimulacao;
  onInputChange: (campo: keyof DadosSimulacao) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (campo: keyof DadosSimulacao) => (valor: number[]) => void;
  formatarPercentual: (valor: number) => string;
}

const TaxasIndicesSection: React.FC<TaxasIndicesSectionProps> = ({
  dados,
  onInputChange,
  onSliderChange,
  formatarPercentual
}) => {
  return (
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
          onValueChange={onSliderChange('valorizacao')}
        />
        <Input
          type="number"
          value={dados.valorizacao}
          onChange={onInputChange('valorizacao')}
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
          onChange={onInputChange('cubInicial')}
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
          onValueChange={onSliderChange('variancaoCubAnual')}
        />
        <Input
          type="number"
          value={dados.variancaoCubAnual}
          onChange={onInputChange('variancaoCubAnual')}
          step="0.01"
          className="mt-1"
        />
      </div>
      
      <CubInfoBox />
    </div>
  );
};

const CubInfoBox: React.FC = () => {
  return (
    <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-800 border border-blue-200">
      <p className="font-medium mb-1">O que é o CUB?</p>
      <p>O Custo Unitário Básico (CUB) é um indicador dos custos de construção civil, utilizado para correção de contratos imobiliários. A fórmula usada é: <span className="font-mono bg-white px-1 rounded">Valor corrigido = Valor original × (CUB atual / CUB inicial)</span></p>
    </div>
  );
};

export default TaxasIndicesSection;
