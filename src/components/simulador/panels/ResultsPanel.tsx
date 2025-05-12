
import React from "react";
import ResultadoInvestimento from "@/components/ResultadoInvestimento";
import TelaInicial from "../TelaInicial";
import { ResultadoSimulacao } from "@/utils/investment/types";

interface ResultsPanelProps {
  resultado: ResultadoSimulacao | null;
}

/**
 * Right panel of the simulation content displaying either results or initial screen
 */
const ResultsPanel: React.FC<ResultsPanelProps> = ({ resultado }) => {
  return (
    <div className="w-full">
      {resultado ? (
        <ResultadoInvestimento resultado={resultado} />
      ) : (
        <TelaInicial />
      )}
    </div>
  );
};

export default ResultsPanel;
