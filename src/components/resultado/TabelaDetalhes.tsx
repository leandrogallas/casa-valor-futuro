
import React from "react";
import { formatarMoeda } from "@/utils/investmentCalculator";

interface TabelaDetalhesProps {
  yearlyData: any[];
}

const TabelaDetalhes: React.FC<TabelaDetalhesProps> = ({ yearlyData }) => {
  return (
    <div>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted border-b">
                <th className="py-2 px-3 text-left font-medium">Ano</th>
                <th className="py-2 px-3 text-left font-medium">Mês</th>
                <th className="py-2 px-3 text-left font-medium">Investido</th>
                <th className="py-2 px-3 text-left font-medium">Valor Imóvel</th>
                <th className="py-2 px-3 text-left font-medium">Saldo Devedor</th>
                <th className="py-2 px-3 text-left font-medium">Valorização</th>
                <th className="py-2 px-3 text-left font-medium">Ganho Cap. Mensal</th>
                <th className="py-2 px-3 text-left font-medium">Lucro Líquido</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((mes, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                  <td className="py-2 px-3 border-b">{Math.ceil(mes.mes/12)}</td>
                  <td className="py-2 px-3 border-b">{mes.mes}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.investido)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorImovel)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.saldoDevedor)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorizacaoPrevista)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.ganhoCapitalMensal)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.lucroLiquido)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
        <p className="font-medium">Legenda:</p>
        <ul className="mt-2 space-y-1">
          <li><span className="font-medium">Investido:</span> Total investido até o período</li>
          <li><span className="font-medium">Valor Imóvel:</span> Valor projetado do imóvel com valorização</li>
          <li><span className="font-medium">Saldo Devedor:</span> Valor restante a pagar</li>
          <li><span className="font-medium">Valorização:</span> Aumento no valor do imóvel desde a compra</li>
          <li><span className="font-medium">Ganho Cap. Mensal:</span> Valorização apenas no mês</li>
          <li><span className="font-medium">Lucro Líquido:</span> Ganho real considerando custos de venda (5%)</li>
        </ul>
      </div>
    </div>
  );
};

export default TabelaDetalhes;
