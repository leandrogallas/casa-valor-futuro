
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
  const { valorMercado, valorizacao, correcao, entrada, parcelas, reforcos, meses } = dados;

  const parcelaMensal = parcelas / meses;
  const reforcosAnuais = reforcos / (meses / 12);
  
  let totalInvestido = entrada;
  let parcelasPagas = 0;
  let reforcosPagos = 0;
  let saldoDevedor = parcelas + reforcos;
  let detalhes: DetalhesMes[] = [];

  for (let i = 1; i <= meses; i++) {
    // Adiciona parcela mensal ao valor investido
    totalInvestido += parcelaMensal;
    parcelasPagas += parcelaMensal;
    
    // Adiciona reforço anual
    if (i % 12 === 0) {
      totalInvestido += reforcosAnuais;
      reforcosPagos += reforcosAnuais;
    }

    // Cálculo da correção do saldo devedor (juros compostos mensais)
    const taxaMensal = Math.pow(1 + correcao, 1 / 12) - 1;
    saldoDevedor = saldoDevedor * (1 + taxaMensal) - parcelaMensal;
    if (i % 12 === 0) {
      saldoDevedor -= reforcosAnuais;
    }

    // Cálculo da valorização do imóvel (juros compostos anuais)
    const mesesEmAno = i / 12;
    const valorAtualImovel = valorMercado * Math.pow(1 + valorizacao, mesesEmAno);

    // Adiciona ao histórico
    detalhes.push({
      mes: i,
      investido: parseFloat(totalInvestido.toFixed(2)),
      valorImovel: parseFloat(valorAtualImovel.toFixed(2)),
      saldoDevedor: parseFloat(Math.max(0, saldoDevedor).toFixed(2)),
      parcelasPagas: parseFloat(parcelasPagas.toFixed(2)),
      reforcosPagos: parseFloat(reforcosPagos.toFixed(2))
    });
  }

  // Cálculo final
  const valorImovel = valorMercado * Math.pow(1 + valorizacao, meses / 12);
  const lucro = valorImovel - totalInvestido;
  const retornoPercentual = (lucro / totalInvestido) * 100;

  return {
    totalInvestido,
    valorImovel,
    lucro,
    retornoPercentual,
    detalhes
  };
}

// Função para formatar valores monetários
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
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
