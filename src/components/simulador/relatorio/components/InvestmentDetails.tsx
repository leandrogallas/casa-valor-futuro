
import React from "react";
import { DadosSimulacao, ResultadoSimulacao } from "@/utils/investmentCalculator";
import { formatarMoeda } from "@/utils/investmentCalculator";

interface InvestmentDetailsProps {
  dadosSimulacao: DadosSimulacao;
  resultado: ResultadoSimulacao;
}

const InvestmentDetails: React.FC<InvestmentDetailsProps> = ({
  dadosSimulacao,
  resultado
}) => {
  const { totalJurosParcelas, totalJurosReforcos } = resultado;

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
            <p className="text-sm font-medium text-muted-foreground">Parcelas</p>
            <p className="font-medium">{formatarMoeda(dadosSimulacao.parcelas)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Reforços Anuais</p>
            <p className="font-medium">{formatarMoeda(dadosSimulacao.reforcos)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Período</p>
            <p className="font-medium">{dadosSimulacao.meses} meses ({Math.floor(dadosSimulacao.meses / 12)} anos e {dadosSimulacao.meses % 12} meses)</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Juros Pagos (Parcelas)</p>
            <p className="font-medium">{formatarMoeda(totalJurosParcelas)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total de Juros Pagos (Reforços)</p>
            <p className="font-medium">{formatarMoeda(totalJurosReforcos)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDetails;
