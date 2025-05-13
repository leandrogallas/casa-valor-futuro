
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao } from "@/types/simulador";
import { useProcessarDetalhes } from "./useProcessarDetalhes";

export function useCalcularSimulacao() {
  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const { processarDetalhesMensais } = useProcessarDetalhes();
  const [detalhesProcessados, setDetalhesProcessados] = useState<ReturnType<typeof processarDetalhesMensais>>([]);

  const calcularSimulacao = (dados: DadosSimulacao) => {
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
      
      // Processar detalhes para os gráficos e PDF usando as definições padronizadas
      const detalhesProcessados = processarDetalhesMensais(resultadoCalculado);
      setDetalhesProcessados(detalhesProcessados);
      
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

  return {
    resultado,
    detalhesProcessados,
    calcularSimulacao
  };
}
