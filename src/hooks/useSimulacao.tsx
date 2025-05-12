
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, DetalhesMesProcessado } from "@/types/simulador";

export function useSimulacao() {
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

  const [dadosEmpreendimento, setDadosEmpreendimento] = useState<DadosEmpreendimento>({
    nomeEmpreendimento: "",
    dataInicio: null,
    dataEntrega: null,
    emailCliente: "",
    mensagem: ""
  });

  const [resultado, setResultado] = useState<ResultadoSimulacao | null>(null);
  const [detalhesProcessados, setDetalhesProcessados] = useState<DetalhesMesProcessado[]>([]);

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
      
      // Processar detalhes para os gráficos e PDF
      processarDetalhesMensais(resultadoCalculado);
      
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
  
  // Função para processar os detalhes mensais
  const processarDetalhesMensais = (resultado: ResultadoSimulacao) => {
    const { detalhes } = resultado;
    
    if (!detalhes || detalhes.length === 0) {
      setDetalhesProcessados([]);
      return;
    }

    const processados: DetalhesMesProcessado[] = [];
    
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // Monthly capital gain (valorização do mês)
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - detalhes[0].valorImovel;
      
      // Ganho real é apenas a valorização do imóvel
      const ganhoReal = mes.valorImovel - detalhes[0].valorImovel;
      
      // Juros pagos são a parte da parcela que não amortiza a dívida
      // Calculamos o juro com base na taxa sobre o saldo devedor anterior
      const jurosMesPago = index > 0 
        ? (mesAnterior.saldoDevedor * (Math.pow(1 + resultado.taxaCorrecao, 1/12) - 1)) 
        : 0;
      
      // Calcular o juro acumulado até este mês (soma de todos os juros pagos até agora)
      const jurosPagos = index > 0 
        ? processados[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // Juros relacionados aos reforços para este mês específico
      const jurosReforcoMesPago = mes.temReforco && index > 0
        ? (resultado.totalJurosReforcos / Math.floor(detalhes.length / 12)) * (Math.floor(index / 12) + 1) / Math.floor(detalhes.length / 12)
        : 0;
      
      // Juros acumulados relacionados aos reforços
      const jurosReforcosPagos = index > 0
        ? processados[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // Lucro líquido é a diferença entre o ganho real (valorização) e os juros pagos (parcelas + reforços)
      const lucroLiquido = ganhoReal - jurosPagos - jurosReforcosPagos;
      
      // Lucro líquido após comissão (5% do valor do imóvel final)
      const taxaComissao = 0.05; // 5%
      const comissao = mes.valorImovel * taxaComissao;
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // Valorização prevista (acumulada desde o início)
      const valorizacaoPrevista = mes.valorImovel - detalhes[0].valorImovel;
      
      processados.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado: ganhoReal, // Mesmo que ganhoReal
        ganhoReal,
        jurosPagos,
        jurosMesPago,
        jurosReforcosPagos,
        jurosReforcoMesPago,
        lucroLiquido,
        lucroLiquidoComComissao,
        valorizacaoPrevista,
        temReforco: mes.temReforco
      });
    });
    
    setDetalhesProcessados(processados);
  };

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
    handleEmpreendimentoChange,
    resultado,
    detalhesProcessados,
    calcularSimulacao
  };
}
