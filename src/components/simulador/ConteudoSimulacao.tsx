
import React from "react";
import FormularioParametros from "./FormularioParametros";
import TelaInicial from "./TelaInicial";
import ResultadoInvestimento from "../ResultadoInvestimento";
import { DadosSimulacao } from "@/types/simulador";
import { ResultadoSimulacao } from "@/utils/investment/types";

interface ConteudoSimulacaoProps {
  resultado: ResultadoSimulacao | null;
  dados: DadosSimulacao;
  onDadosChange: (dados: DadosSimulacao) => void;
  onCalcular: () => void;
}

const ConteudoSimulacao: React.FC<ConteudoSimulacaoProps> = ({
  resultado,
  dados,
  onDadosChange,
  onCalcular
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <FormularioParametros 
          dados={dados} 
          onDadosChange={onDadosChange} 
          onCalcular={onCalcular} 
        />
      </div>
      
      <div className="lg:col-span-2">
        {resultado ? (
          <ResultadoInvestimento resultado={resultado} />
        ) : (
          <TelaInicial />
        )}
      </div>
    </div>
  );
};

export default ConteudoSimulacao;
