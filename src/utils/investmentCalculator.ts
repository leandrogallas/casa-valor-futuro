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
  detalhes: DetalhesMes[];
}

export interface DetalhesMes {
  mes: number;
  investido: number;
  valorImovel: number;
  saldoDevedor: number;
  parcelasPagas: number;
  reforcosPagos: number;
}

export function calcularSimulacaoInvestimento(dados: InvestmentData): ResultadoSimulacao {
  const { valorMercado, valorCompra, valorizacao, correcao, entrada, parcelas, reforcos, meses } = dados;

  // Calcular a taxa mensal de correção a partir da taxa anual
  const taxaMensal = Math.pow(1 + correcao, 1 / 12) - 1;
  
  // Número de reforços anuais esperados
  const numReforcos = Math.floor(meses / 12);
  
  // Definir o valor inicial do saldo devedor
  const saldoDevedorInicial = valorCompra - entrada;
  
  // Calcular o valor total dos reforços previstos
  const totalReforcos = reforcos;
  
  // Calcular o valor das parcelas mensais fixas baseado no saldo devedor inicial,
  // considerando que os reforços anuais serão aplicados separadamente
  
  // Como os reforços serão divididos anualmente, precisamos ajustar o valor da parcela mensal
  // para que ao final do período o saldo devedor seja zero
  
  // Precisamos calcular o valor presente dos reforços anuais
  let valorPresenteReforcos = 0;
  for (let ano = 1; ano <= numReforcos; ano++) {
    const valorReforcoAnual = numReforcos > 0 ? totalReforcos / numReforcos : 0;
    // Aplica desconto para trazer a valor presente
    valorPresenteReforcos += valorReforcoAnual / Math.pow(1 + taxaMensal, ano * 12);
  }
  
  // Ajusta o saldo devedor subtraindo o valor presente dos reforços
  const saldoAjustado = saldoDevedorInicial - valorPresenteReforcos;
  
  // Calcula a parcela mensal para o saldo ajustado usando o Sistema Price
  let parcelaMensal = 0;
  
  if (Math.abs(taxaMensal) < 0.000001) {
    // Se a taxa for praticamente zero, dividimos o saldo igualmente
    parcelaMensal = saldoDevedorInicial / meses;
  } else {
    // Fórmula do Sistema Price: PMT = PV * [ r * (1+r)^n ] / [ (1+r)^n - 1 ]
    parcelaMensal = saldoAjustado * 
      (taxaMensal * Math.pow(1 + taxaMensal, meses)) / 
      (Math.pow(1 + taxaMensal, meses) - 1);
  }

  // Arrays para armazenar o histórico completo
  let valorInvestido = entrada;
  let parcelasPagas = 0;
  let reforcosPagos = 0;
  let saldoDevedor = saldoDevedorInicial;
  let detalhes: DetalhesMes[] = [];
  
  // Valor inicial do imóvel
  const valorInicialImovel = valorMercado;
  
  // Processamento mês a mês
  for (let i = 1; i <= meses; i++) {
    // Aplicação da correção sobre o saldo devedor atual (juros)
    const jurosMes = saldoDevedor * taxaMensal;
    
    // Valor da amortização na parcela mensal (parcela - juros)
    const amortizacao = parcelaMensal - jurosMes;
    
    // Atualiza o saldo devedor reduzindo a amortização
    saldoDevedor = saldoDevedor - amortizacao;
    
    // Adiciona a parcela mensal ao total investido
    valorInvestido += parcelaMensal;
    parcelasPagas += parcelaMensal;
    
    // Aplicação do reforço anual (ao fim de cada ano)
    if (i % 12 === 0 && i/12 <= numReforcos) {
      const valorReforcoAnual = numReforcos > 0 ? totalReforcos / numReforcos : 0;
      
      // Aplica o reforço diretamente no saldo devedor
      saldoDevedor = saldoDevedor - valorReforcoAnual;
      valorInvestido += valorReforcoAnual;
      reforcosPagos += valorReforcoAnual;
    }
    
    // Cálculo da valorização do imóvel (juros compostos mensais baseados na taxa anual)
    const taxaValorizacaoMensal = Math.pow(1 + valorizacao, 1/12) - 1;
    const valorAtualImovel = valorInicialImovel * Math.pow(1 + taxaValorizacaoMensal, i);
    
    // Adiciona ao histórico
    detalhes.push({
      mes: i,
      investido: parseFloat(valorInvestido.toFixed(2)),
      valorImovel: parseFloat(valorAtualImovel.toFixed(2)),
      saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
      parcelasPagas: parseFloat(parcelasPagas.toFixed(2)),
      reforcosPagos: parseFloat(reforcosPagos.toFixed(2))
    });
    
    // Ajuste no último mês para garantir saldo zero
    if (i === meses && Math.abs(saldoDevedor) > 0.01) {
      // Ajusta o último registro para garantir saldo zero
      const ultimoRegistro = detalhes[detalhes.length - 1];
      const ajuste = ultimoRegistro.saldoDevedor;
      
      valorInvestido += ajuste;
      parcelasPagas += ajuste;
      
      detalhes[detalhes.length - 1] = {
        ...ultimoRegistro,
        investido: parseFloat(valorInvestido.toFixed(2)),
        saldoDevedor: 0,
        parcelasPagas: parseFloat(parcelasPagas.toFixed(2))
      };
    }
  }

  // Cálculo final
  const valorImovelFinal = valorInicialImovel * Math.pow(1 + valorizacao, meses / 12);
  const totalInvestidoFinal = detalhes[detalhes.length - 1].investido;
  const lucro = valorImovelFinal - totalInvestidoFinal;
  const retornoPercentual = totalInvestidoFinal > 0 ? (lucro / totalInvestidoFinal) * 100 : 0;

  return {
    totalInvestido: totalInvestidoFinal,
    valorImovel: parseFloat(valorImovelFinal.toFixed(2)),
    lucro: parseFloat(lucro.toFixed(2)),
    retornoPercentual: parseFloat(retornoPercentual.toFixed(2)),
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
