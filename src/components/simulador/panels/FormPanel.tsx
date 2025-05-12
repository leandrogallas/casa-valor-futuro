
import React from "react";
import FormularioParametros from "../FormularioParametros";
import { DadosSimulacao } from "@/types/simulador";

interface FormPanelProps {
  dados: DadosSimulacao;
  onDadosChange: (dados: DadosSimulacao) => void;
  onCalcular: () => void;
}

/**
 * Left panel of the simulation content containing the parameter form
 */
const FormPanel: React.FC<FormPanelProps> = ({
  dados,
  onDadosChange,
  onCalcular
}) => {
  return (
    <div className="w-full">
      <FormularioParametros 
        dados={dados} 
        onDadosChange={onDadosChange} 
        onCalcular={onCalcular} 
      />
    </div>
  );
};

export default FormPanel;
