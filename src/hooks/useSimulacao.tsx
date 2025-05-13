
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
      
      // Processar detalhes para os gráficos e PDF usando as definições padronizadas
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
  
  // Função para processar os detalhes mensais usando definições padronizadas
  const processarDetalhesMensais = (resultado: ResultadoSimulacao) => {
    const { detalhes, valorCompra, totalJurosParcelas, totalJurosReforcos } = resultado;
    
    if (!detalhes || detalhes.length === 0) {
      setDetalhesProcessados([]);
      return;
    }

    const processados: DetalhesMesProcessado[] = [];
    
    // Total de juros acumulados (somando parcelas e reforços)
    const totalJuros = totalJurosParcelas + totalJurosReforcos;
    
    detalhes.forEach((mes, index) => {
      const mesAnterior = index > 0 ? detalhes[index - 1] : null;
      
      // DEFINIÇÕES PADRONIZADAS:
      
      // 1. Ganho de capital mensal (valorização do mês atual)
      const ganhoCapitalMensal = mesAnterior 
        ? mes.valorImovel - mesAnterior.valorImovel 
        : mes.valorImovel - detalhes[0].valorImovel;
      
      // 2. Ganho de capital acumulado (valor atual do imóvel - valor de compra)
      const ganhoCapitalAcumulado = mes.valorImovel - valorCompra;
      
      // 3. Juros pagos no mês atual (diferença entre parcela corrigida e parcela original)
      const indiceCub = mes.indiceCubMensal || 1;
      const valorParcelaSemCorrecao = resultado.parcelas / resultado.detalhes.length;
      const jurosMesPago = (mes.parcelaMensal - valorParcelaSemCorrecao);
      
      // 4. Juros acumulados até o mês atual
      const jurosPagos = index > 0 
        ? processados[index - 1].jurosPagos + jurosMesPago 
        : jurosMesPago;
      
      // 5. Juros do reforço no mês atual (se houver)
      const valorReforcoSemCorrecao = resultado.reforcos / Math.floor(resultado.detalhes.length / 12);
      const jurosReforcoMesPago = mes.temReforco 
        ? ((mes.parcelaMensal * indiceCub) - valorReforcoSemCorrecao)
        : 0;
      
      // 6. Juros de reforços acumulados
      const jurosReforcosPagos = index > 0
        ? processados[index - 1].jurosReforcosPagos + (mes.temReforco ? jurosReforcoMesPago : 0)
        : jurosReforcoMesPago;
      
      // 7. Total de juros acumulados (parcelas + reforços)
      const totalJurosAcumulados = jurosPagos + jurosReforcosPagos;
      
      // 8. Ganho real (ganho de capital - total de juros)
      const ganhoReal = ganhoCapitalAcumulado - totalJurosAcumulados;
      
      // 9. Comissão de 5% sobre o valor atual do imóvel
      const comissao = mes.valorImovel * 0.05;
      
      // 10. Lucro líquido (ganho real - comissão)
      const lucroLiquido = ganhoReal;
      
      // 11. Lucro líquido após comissão 
      const lucroLiquidoComComissao = lucroLiquido - comissao;
      
      // 12. Valorização prevista (valor atual do imóvel)
      const valorizacaoPrevista = mes.valorImovel;
      
      processados.push({
        ...mes,
        ganhoCapitalMensal,
        ganhoCapitalAcumulado,
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
