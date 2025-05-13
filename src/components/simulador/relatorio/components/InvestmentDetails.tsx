
import React from "react";
import { DadosSimulacao } from "@/types/simulador";
import { ResultadoSimulacao, formatarMoeda, formatarPercentual } from "@/utils/investmentCalculator";
import { DetalhesMesProcessado } from "@/types/simulador";

interface InvestmentDetailsProps {
  dadosSimulacao: DadosSimulacao;
  resultado: ResultadoSimulacao;
  latestData?: DetalhesMesProcessado;
  valorParcelaSemCorrecao?: number;
  valorReforcoSemCorrecao?: number;
  numeroParcelas?: number;
  numeroReforcos?: number;
  totalJurosPagos?: number;
}

const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({
  dadosSimulacao,
  resultado,
  latestData,
  valorParcelaSemCorrecao,
  valorReforcoSemCorrecao,
  numeroParcelas,
  numeroReforcos,
  totalJurosPagos
}) => {
  const { 
    totalInvestido, 
    totalJurosParcelas, 
    totalJurosReforcos, 
    cubInicial,
    cubFinal,
    indiceCubFinal
  } = resultado;
  
  // Calcular valores caso não sejam fornecidos
  const meses = dadosSimulacao.meses;
  const calculatedNumeroParcelas = numeroParcelas || meses;
  const calculatedNumeroReforcos = numeroReforcos || Math.floor(meses / 12);
  const calculatedValorParcelaSemCorrecao = valorParcelaSemCorrecao || (resultado.parcelas / meses);
  const calculatedValorReforcoSemCorrecao = valorReforcoSemCorrecao || 
      (calculatedNumeroReforcos > 0 ? dadosSimulacao.reforcos / calculatedNumeroReforcos : 0);
  const calculatedTotalJurosPagos = totalJurosPagos || (totalJurosParcelas + totalJurosReforcos);

  // Ícone com cor
  const getIcon = () => (
    <div className="bg-orange-500 p-2 rounded-full text-white h-9 w-9 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {getIcon()}
        <h3 className="text-lg font-semibold">Detalhes do Investimento</h3>
      </div>
      <div className="bg-gradient-to-r from-orange-50 to-white p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Entrada</p>
            <p className="font-medium">{formatarMoeda(dadosSimulacao.entrada)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Número de Parcelas</p>
            <p className="font-medium">{calculatedNumeroParcelas} ({Math.floor(calculatedNumeroParcelas / 12)} anos e {calculatedNumeroParcelas % 12} meses)</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor das Parcelas sem Correção</p>
            <p className="font-medium">{formatarMoeda(calculatedValorParcelaSemCorrecao)}</p>
            <p className="text-xs text-muted-foreground">Total: {formatarMoeda(calculatedValorParcelaSemCorrecao * calculatedNumeroParcelas)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Número de Reforços</p>
            <p className="font-medium">{calculatedNumeroReforcos} (anuais)</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor dos Reforços sem Correção</p>
            <p className="font-medium">{formatarMoeda(calculatedValorReforcoSemCorrecao)}</p>
            <p className="text-xs text-muted-foreground">Total: {formatarMoeda(calculatedValorReforcoSemCorrecao * calculatedNumeroReforcos)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Juros (Parcelas)</p>
            <p className="font-medium">{formatarMoeda(totalJurosParcelas)}</p>
            <p className="text-xs text-muted-foreground">{formatarPercentual(totalJurosParcelas / calculatedTotalJurosPagos * 100)} do total de juros</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Juros (Reforços)</p>
            <p className="font-medium">{formatarMoeda(totalJurosReforcos)}</p>
            <p className="text-xs text-muted-foreground">{formatarPercentual(totalJurosReforcos / calculatedTotalJurosPagos * 100)} do total de juros</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Custo Total do Imóvel</p>
            <p className="font-medium">{formatarMoeda(totalInvestido)}</p>
            <p className="text-xs text-muted-foreground">Inclui entrada, parcelas e reforços com correção CUB</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CUB Inicial</p>
            <p className="font-medium">{formatarMoeda(cubInicial || 0)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">CUB Final</p>
            <p className="font-medium">{formatarMoeda(cubFinal || 0)}</p>
            <p className="text-xs text-muted-foreground">Índice: {(indiceCubFinal || 1).toFixed(4)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetails;
