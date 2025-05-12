
import React, { useState } from "react";
import FormularioParametros from "./simulador/FormularioParametros";
import TelaInicial from "./simulador/TelaInicial";
import ResultadoInvestimento from "./ResultadoInvestimento";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { toast } from "@/components/ui/use-toast";
import { DadosSimulacao } from "@/types/simulador";

const SimuladorInvestimento: React.FC = () => {
  const [dados, setDados] = useState<DadosSimulacao>({
    valorMercado: 500000,
    valorCompra: 450000,
    valorizacao: 0.12,
    correcao: 0.06,
    entrada: 90000,
    parcelas: 360000,
    reforcos: 70000,
    meses: 120,
  });

  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);

  const calcularSimulacao = () => {
    try {
      // Validações básicas
      if (dados.valorMercado <= 0 || dados.meses <= 0) {
        toast({
          title: "Dados inválidos",
          description: "Por favor, verifique os valores inseridos.",
          variant: "destructive"
        });
        return;
      }

      const resultadoCalculado = calcularSimulacaoInvestimento(dados);
      setResultado(resultadoCalculado);
      
      toast({
        title: "Simulação concluída!",
        description: "Os resultados foram calculados com sucesso."
      });
    } catch (error) {
      console.error("Erro ao calcular simulação:", error);
      toast({
        title: "Erro no cálculo",
        description: "Ocorreu um erro ao processar sua simulação.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <FormularioParametros 
            dados={dados} 
            onDadosChange={setDados} 
            onCalcular={calcularSimulacao} 
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
    </div>
  );
};

export default SimuladorInvestimento;
