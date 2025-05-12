
interface InvestmentData {
  valorMercado: number;
  valorCompra: number;
  valorizacao: number;
  correcao: number;
  entrada: number;
  parcelas: number;
  reforcos: number;
  meses: number;
}

export interface ResultadoSimulacao {
  totalInvestido: number;
  valorImovel: number;
  lucro: number;
  retornoPercentual: number;
  taxaCorrecao: number;
  valorCompra: number;
  detalhes: DetalhesMes[];
}

export interface DetalhesMes {
  mes: number;
  investido: number;
  valorImovel: number;
  saldoDevedor: number;
  parcelasPagas: number;
  reforcosPagos: number;
  parcelaMensal: number; // Adicionado o valor da parcela mensal atualizada
}

export function calcularSimulacaoInvestimento(dados: InvestmentData): ResultadoSimulacao {
  const { valorMercado, valorCompra, valorizacao, correcao, entrada, parcelas, reforcos, meses } = dados;

  // Calcular a taxa mensal de correção a partir da taxa anual
  const taxaMensal = Math.pow(1 + correcao, 1 / 12) - 1;
  
  // Número de reforços anuais esperados (total de anos)
  const numAnos = Math.floor(meses / 12);
  
  // Cálculo do valor inicial do saldo devedor (preço de compra menos entrada)
  const saldoDevedorInicial = valorCompra - entrada;
  
  // Cálculo do valor total dos reforços previstos
  const valorReforcoAnual = numAnos > 0 ? reforcos / numAnos : 0;
  
  // Cálculo do valor da parcela mensal inicial (sem correção)
  // Usaremos o Sistema Price para calcular a parcela inicial
  let parcelaMensalInicial = 0;
  
  if (Math.abs(taxaMensal) < 0.000001) {
    // Se a taxa for praticamente zero, dividimos o valor efetivo igualmente
    parcelaMensalInicial = saldoDevedorInicial / meses;
  } else {
    // Fórmula do Sistema Price: PMT = PV * [ r * (1+r)^n ] / [ (1+r)^n - 1 ]
    // Usamos taxa zero para calcular a parcela inicial sem juros
    const taxaZero = 0;
    parcelaMensalInicial = saldoDevedorInicial / meses;
  }
  
  // Variáveis para acompanhamento
  let valorInvestido = entrada;
  let parcelasPagas = 0;
  let reforcosPagos = 0;
  let saldoDevedor = saldoDevedorInicial;
  let detalhes: DetalhesMes[] = [];
  
  // Valor inicial do imóvel
  const valorInicialImovel = valorMercado;
  
  // A parcela mensal será corrigida anualmente
  let parcelaMensalAtual = parcelaMensalInicial;
  
  // Processamento mês a mês
  for (let i = 1; i <= meses; i++) {
    // Correção anual da parcela (a cada 12 meses)
    // No primeiro mês de cada ano (exceto o primeiro ano), aplicamos a correção
    if (i > 1 && (i - 1) % 12 === 0) {
      // Aplicar a correção anual à parcela
      parcelaMensalAtual = parcelaMensalAtual * (1 + correcao);
    }
    
    // Calcular juros do mês sobre o saldo devedor atual
    const jurosMes = saldoDevedor * taxaMensal;
    
    // Determinar o valor de amortização: parcela menos juros
    const amortizacao = parcelaMensalAtual - jurosMes;
    
    // Verificar se a amortização é negativa (juros maiores que a parcela)
    // Em caso positivo, a diferença é incorporada ao saldo devedor
    const amortizacaoEfetiva = Math.max(0, amortizacao);
    
    // Atualizar o saldo devedor
    saldoDevedor = saldoDevedor - amortizacaoEfetiva;
    
    // Adicionar a parcela mensal ao total investido
    valorInvestido += parcelaMensalAtual;
    parcelasPagas += parcelaMensalAtual;
    
    // Aplicar reforço anual ao final de cada ano
    if (i % 12 === 0 && i / 12 <= numAnos) {
      // Aplicar o reforço ao saldo devedor
      saldoDevedor = saldoDevedor - valorReforcoAnual;
      valorInvestido += valorReforcoAnual;
      reforcosPagos += valorReforcoAnual;
    }
    
    // Cálculo da valorização do imóvel (taxa mensal calculada a partir da anual)
    const taxaValorizacaoMensal = Math.pow(1 + valorizacao, 1/12) - 1;
    const valorAtualImovel = valorInicialImovel * Math.pow(1 + taxaValorizacaoMensal, i);
    
    // Adicionar ao histórico
    detalhes.push({
      mes: i,
      investido: parseFloat(valorInvestido.toFixed(2)),
      valorImovel: parseFloat(valorAtualImovel.toFixed(2)),
      saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
      parcelasPagas: parseFloat(parcelasPagas.toFixed(2)),
      reforcosPagos: parseFloat(reforcosPagos.toFixed(2)),
      parcelaMensal: parseFloat(parcelaMensalAtual.toFixed(2))
    });
    
    // Ajuste no último mês para garantir saldo devedor zero
    if (i === meses) {
      // Se houver um pequeno valor residual (por causa de arredondamentos), ajustar
      if (Math.abs(saldoDevedor) > 0.01) {
        const ultimoRegistro = detalhes[detalhes.length - 1];
        const ajuste = ultimoRegistro.saldoDevedor;
        
        // Adicionar o ajuste final ao total investido
        valorInvestido += ajuste;
        parcelasPagas += ajuste;
        
        // Atualizar o último registro para garantir saldo zero
        detalhes[detalhes.length - 1] = {
          ...ultimoRegistro,
          investido: parseFloat(valorInvestido.toFixed(2)),
          saldoDevedor: 0,
          parcelasPagas: parseFloat(parcelasPagas.toFixed(2))
        };
      }
    }
  }

  // Cálculo final dos resultados
  const valorImovelFinal = valorInicialImovel * Math.pow(1 + valorizacao, meses / 12);
  const totalInvestidoFinal = detalhes[detalhes.length - 1].investido;
  const lucro = valorImovelFinal - totalInvestidoFinal;
  const retornoPercentual = totalInvestidoFinal > 0 ? (lucro / totalInvestidoFinal) * 100 : 0;

  return {
    totalInvestido: totalInvestidoFinal,
    valorImovel: parseFloat(valorImovelFinal.toFixed(2)),
    lucro: parseFloat(lucro.toFixed(2)),
    retornoPercentual: parseFloat(retornoPercentual.toFixed(2)),
    taxaCorrecao: correcao,
    valorCompra: valorCompra,
    detalhes
  };
}

// Função para formatar valores monetários
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(valor);
}

// Função para formatar percentuais
export function formatarPercentual(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor / 100);
}
