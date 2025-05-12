
import React from "react";

const TelaInicial: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50 w-full">
        <h3 className="text-xl font-medium text-gray-600 mb-2">Simulador de Investimento Imobiliário</h3>
        <p className="text-gray-500">
          Configure os parâmetros e clique em "Calcular Simulação" 
          para visualizar os resultados detalhados do seu investimento.
        </p>
        <div className="mt-6 space-y-4 text-sm text-left max-w-lg mx-auto">
          <div className="p-4 bg-white rounded shadow-sm">
            <h4 className="font-medium text-investment-dark">Como funciona:</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>Defina o valor de mercado e de compra do imóvel</li>
              <li>Ajuste as taxas de valorização e correção anual</li>
              <li>Configure os valores de entrada, parcelas e reforços</li>
              <li>Determine o período da simulação em meses</li>
            </ul>
          </div>
          <div className="p-4 bg-white rounded shadow-sm">
            <h4 className="font-medium text-investment-dark">O que a simulação mostra:</h4>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600">
              <li>Evolução do valor do imóvel ao longo do tempo</li>
              <li>Saldo devedor e total investido</li>
              <li>Ganho de capital mensal e acumulado</li>
              <li>Ganho real e lucro líquido do investimento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelaInicial;
