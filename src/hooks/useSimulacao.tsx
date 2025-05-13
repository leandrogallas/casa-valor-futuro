
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { calcularSimulacaoInvestimento, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { DadosSimulacao, DadosEmpreendimento, DetalhesMesProcessado } from "@/types/simulador";

export function useSimulacao() {
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
    const { detalhes, valorCompra } = resultado;
    
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
      
      // Ganho capital é a valorização do imóvel menos o valor de compra
      // CORRIGIDO: ganho de capital = valor atual do imóvel - valor de compra
      const ganhoCapitalAcumulado = mes.valorImovel - valorCompra;
      
      // Juros pagos são calculados como a diferença entre o valor corrigido pelo CUB e o valor original
      // Calculamos o juro com base no índice do CUB
      const indiceCub = mes.indiceCubMensal || 1;
      const valorParcelaSemCorrecao = resultado.parcelas / resultado.detalhes.length;
      const jurosMesPago = (mes.parcelaMensal - valorParcelaSemCorrecao);
      
      // Calcular o juro acumulado até este mês (soma de todos os juros pagos até agora)
      const jurosPagos = index > 0 
        ? processados[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // Juros relacionados aos reforços para este mês específico
      const valorReforcoSemCorrecao = resultado.reforcos / Math.floor(resultado.detalhes.length / 12);
      const jurosReforcoMesPago = mes.temReforco 
        ? ((valorReforcoSemCorrecao * indiceCub) - valorReforcoSemCorrecao)
        : 0;
      
      // Juros acumulados relacionados aos reforços
      const jurosReforcosPagos = index > 0
        ? processados[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // CORRIGIDO: Ganho real = Ganho de capital - Total de juros pagos
      const ganhoReal = ganhoCapitalAcumulado - jurosPagos - jurosReforcosPagos;
      
      // CORRIGIDO: Lucro líquido é igual ao ganho real
      const lucroLiquido = ganhoReal;
      
      // Lucro líquido após comissão (5% do valor do imóvel final)
      const taxaComissao = 0.05; // 5%
      const comissao = mes.valorImovel * taxaComissao;
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // Valorização prevista (acumulada desde o início)
      const valorizacaoPrevista = mes.valorImovel;
      
      processados.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado, // CORRIGIDO: usar ganhoCapitalAcumulado corretamente calculado
        ganhoReal,
        jurosPagos,
        jurosMesPago,
        jurosReforcosPagos,
        jurosReforcoMesPago,
        lucroLiquido,
        lucroLiquidoComComissao,
        valorizacaoPrevista,
        temReforco: mes.temReforco,
        valorCubAtual: mes.valorCubAtual || dados.cubInicial,
        indiceCubMensal: mes.indiceCubMensal || 1
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
