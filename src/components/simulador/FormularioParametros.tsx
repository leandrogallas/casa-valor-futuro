
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DadosSimulacao } from "@/types/simulador";
import ValoresImovelSection from "./sections/ValoresImovelSection";
import TaxasIndicesSection from "./sections/TaxasIndicesSection";
import ValoresInvestimentoSection from "./sections/ValoresInvestimentoSection";

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
        <ValoresImovelSection 
          dados={dados}
          onInputChange={handleInputChange}
        />
        
        <Separator />
        
        <TaxasIndicesSection 
          dados={dados}
          onInputChange={handleInputChange}
          onSliderChange={handleSliderChange}
          formatarPercentual={formatarPercentual}
        />
        
        <Separator />
        
        <ValoresInvestimentoSection 
          dados={dados}
          onInputChange={handleInputChange}
        />
        
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
