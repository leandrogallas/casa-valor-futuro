
import React from "react";
import { Button } from "@/components/ui/button";

interface SeletorVisualizacaoProps {
  chartView: "global" | "monthly" | "comparative";
  onChangeView: (view: "global" | "monthly" | "comparative") => void;
}

const SeletorVisualizacao: React.FC<SeletorVisualizacaoProps> = ({ 
  chartView, 
  onChangeView 
}) => {
  return (
    <div className="flex flex-wrap space-x-2">
      <Button
        variant={chartView === "global" ? "default" : "outline"}
        size="sm"
        onClick={() => onChangeView("global")}
        className={chartView === "global" ? "bg-investment-primary" : ""}
      >
        Visão Global
      </Button>
      <Button
        variant={chartView === "monthly" ? "default" : "outline"}
        size="sm"
        onClick={() => onChangeView("monthly")}
        className={chartView === "monthly" ? "bg-investment-primary" : ""}
      >
        Ganho Mensal
      </Button>
      <Button
        variant={chartView === "comparative" ? "default" : "outline"}
        size="sm"
        onClick={() => onChangeView("comparative")}
        className={chartView === "comparative" ? "bg-investment-primary" : ""}
      >
        Comparativo
      </Button>
    </div>
  );
};

export default SeletorVisualizacao;
