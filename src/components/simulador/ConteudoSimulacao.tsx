
import React from "react";
import { DadosSimulacao } from "@/types/simulador";
import { ResultadoSimulacao } from "@/utils/investment/types";
import FormPanel from "./panels/FormPanel";
import ResultsPanel from "./panels/ResultsPanel";
import SimulacaoLayout from "./layout/SimulacaoLayout";

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
    <SimulacaoLayout
      formPanel={
        <FormPanel 
          dados={dados} 
          onDadosChange={onDadosChange} 
          onCalcular={onCalcular} 
        />
      }
      resultsPanel={
        <ResultsPanel resultado={resultado} />
      }
    />
  );
};

export default ConteudoSimulacao;
