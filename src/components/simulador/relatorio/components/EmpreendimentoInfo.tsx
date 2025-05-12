
import React from "react";
import { format } from "date-fns";
import { DadosSimulacao, DadosEmpreendimento } from "@/types/simulador";
import { formatarMoeda } from "@/utils/investmentCalculator";

interface EmpreendimentoInfoProps {
  dadosSimulacao: DadosSimulacao;
  dadosEmpreendimento: DadosEmpreendimento;
}

const EmpreendimentoInfo: React.FC<EmpreendimentoInfoProps> = ({
  dadosSimulacao,
  dadosEmpreendimento,
}) => {
  // Ícone com cor
  const getIcon = () => (
    <div className="bg-blue-500 p-2 rounded-full text-white h-9 w-9 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-bar">
        <path d="M3 3v18h18"></path>
        <path d="M18 17V9"></path>
        <path d="M13 17V5"></path>
        <path d="M8 17v-3"></path>
      </svg>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        {getIcon()}
        <h3 className="text-lg font-semibold">Informações do Empreendimento</h3>
      </div>
      <div className="bg-gradient-to-r from-blue-50 to-white p-4 rounded-md space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Nome do Empreendimento</p>
            <p className="font-medium">{dadosEmpreendimento.nomeEmpreendimento || "Não informado"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valor do Imóvel</p>
            <p className="font-medium">{formatarMoeda(dadosSimulacao.valorMercado)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data de Início das Obras</p>
            <p className="font-medium">
              {dadosEmpreendimento.dataInicio
                ? format(dadosEmpreendimento.dataInicio, "dd/MM/yyyy")
                : "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Data de Entrega Prevista</p>
            <p className="font-medium">
              {dadosEmpreendimento.dataEntrega
                ? format(dadosEmpreendimento.dataEntrega, "dd/MM/yyyy")
                : "Não informado"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Valorização Anual</p>
            <p className="font-medium">{(dadosSimulacao.valorizacao * 100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Variação Anual do CUB</p>
            <p className="font-medium">{(dadosSimulacao.variancaoCubAnual * 100).toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmpreendimentoInfo;
