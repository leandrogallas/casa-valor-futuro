
import { useState } from "react";
import { DadosSimulacao, DadosEmpreendimento } from "@/types/simulador";

export function useSimulacaoState() {
  const [dados, setDados] = useState<DadosSimulacao>({
    valorMercado: 500000,
    valorCompra: 450000,
    valorizacao: 0.12,
    cubInicial: 2000,       // Valor inicial do CUB (R$/m²)
    variancaoCubAnual: 0.06, // Variação anual média do CUB (6%)
    entrada: 90000,
    parcelas: 360000,
    reforcos: 70000,
    meses: 120,
  });

  const [dadosEmpreendimento, setDadosEmpreendimento] = useState<DadosEmpreendimento>({
    nomeEmpreendimento: "",
    dataInicio: null,
    dataEntrega: null,
    emailCliente: "",
    mensagem: ""
  });

  const handleEmpreendimentoChange = (campo: keyof DadosEmpreendimento, valor: any) => {
    setDadosEmpreendimento(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  return {
    dados,
    setDados,
    dadosEmpreendimento,
    handleEmpreendimentoChange
  };
}
