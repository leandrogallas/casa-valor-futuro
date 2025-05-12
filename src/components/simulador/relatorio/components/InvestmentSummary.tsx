
import React from "react";
import { ResultadoSimulacao, formatarMoeda } from "@/utils/investmentCalculator";

interface InvestmentSummaryProps {
  resultado: ResultadoSimulacao;
}

const InvestmentSummary: React.FC<InvestmentSummaryProps> = ({
  resultado
}) => {
  const { totalInvestido, valorImovel, lucro, retornoPercentual } = resultado;

  // Ícone com cor
  const getIcon = () => (
    <div className="bg-green-500 p-2 rounded-full text-white h-9 w-9 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-table">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"></path>
      </svg>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {getIcon()}
        <h3 className="text-lg font-semibold">Resumo do Investimento</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-none shadow-sm rounded-md p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Investido</p>
          <p className="text-xl font-bold">{formatarMoeda(totalInvestido)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-none shadow-sm rounded-md p-4">
          <p className="text-sm font-medium text-muted-foreground">Valor Final do Imóvel</p>
          <p className="text-xl font-bold">{formatarMoeda(valorImovel)}</p>
        </div>
        
        <div className={`bg-gradient-to-br ${lucro > 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} border-none shadow-sm rounded-md p-4`}>
          <p className="text-sm font-medium text-muted-foreground">Lucro</p>
          <p className={`text-xl font-bold ${lucro > 0 ? "text-green-600" : "text-red-600"}`}>
            {formatarMoeda(lucro)}
          </p>
        </div>
        
        <div className={`bg-gradient-to-br ${retornoPercentual > 0 ? "from-green-50 to-green-100" : "from-red-50 to-red-100"} border-none shadow-sm rounded-md p-4`}>
          <p className="text-sm font-medium text-muted-foreground">Retorno sobre Investimento</p>
          <p className={`text-xl font-bold ${retornoPercentual > 0 ? "text-green-600" : "text-red-600"}`}>
            {(retornoPercentual * 100).toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default InvestmentSummary;
