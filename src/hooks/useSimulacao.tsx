
import { useSimulacaoState } from "./simulacao/useSimulacaoState";
import { useCalcularSimulacao } from "./simulacao/useCalcularSimulacao";

export function useSimulacao() {
  const { 
    dados, 
    setDados, 
    dadosEmpreendimento, 
    handleEmpreendimentoChange 
  } = useSimulacaoState();
  
  const { 
    resultado, 
    detalhesProcessados, 
    calcularSimulacao: calcularSimulacaoBase 
  } = useCalcularSimulacao();

  // Wrapper function to pass the current dados state to calcularSimulacao
  const calcularSimulacao = () => {
    calcularSimulacaoBase(dados);
  };

  return {
    dados,
    setDados,
    dadosEmpreendimento,
    handleEmpreendimentoChange,
    resultado,
    detalhesProcessados,
    calcularSimulacao
  };
}
