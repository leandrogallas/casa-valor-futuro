
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DadosSimulacao } from "@/types/simulador";

interface ValoresImovelSectionProps {
  dados: DadosSimulacao;
  onInputChange: (campo: keyof DadosSimulacao) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ValoresImovelSection: React.FC<ValoresImovelSectionProps> = ({
  dados,
  onInputChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm text-muted-foreground">Valores do Imóvel</h3>
      <div className="space-y-2">
        <Label htmlFor="valorMercado">Valor de Mercado (R$)</Label>
        <Input
          id="valorMercado"
          type="number"
          value={dados.valorMercado}
          onChange={onInputChange('valorMercado')}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="valorCompra">Valor de Compra (R$)</Label>
        <Input
          id="valorCompra"
          type="number"
          value={dados.valorCompra}
          onChange={onInputChange('valorCompra')}
        />
      </div>
    </div>
  );
};

export default ValoresImovelSection;
