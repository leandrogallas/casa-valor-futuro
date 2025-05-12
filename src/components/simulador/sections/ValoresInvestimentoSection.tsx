
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DadosSimulacao } from "@/types/simulador";

interface ValoresInvestimentoSectionProps {
  dados: DadosSimulacao;
  onInputChange: (campo: keyof DadosSimulacao) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ValoresInvestimentoSection: React.FC<ValoresInvestimentoSectionProps> = ({
  dados,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-muted-foreground">Valores do Investimento</h3>
      <div className="space-y-2">
        <Label htmlFor="entrada">Entrada (R$)</Label>
        <Input
          id="entrada"
          type="number"
          value={dados.entrada}
          onChange={onInputChange('entrada')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="parcelas">Total em Parcelas (R$)</Label>
        <Input
          id="parcelas"
          type="number"
          value={dados.parcelas}
          onChange={onInputChange('parcelas')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="reforcos">Total em Reforços Anuais (R$)</Label>
        <Input
          id="reforcos"
          type="number"
          value={dados.reforcos}
          onChange={onInputChange('reforcos')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="meses">Período (meses)</Label>
        <Input
          id="meses"
          type="number"
          value={dados.meses}
          onChange={onInputChange('meses')}
        />
      </div>
    </div>
  );
};

export default ValoresInvestimentoSection;
