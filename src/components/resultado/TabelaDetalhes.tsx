
import React from "react";
import { formatarMoeda } from "@/utils/investmentCalculator";
import { Check } from "lucide-react";

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
                <th className="py-2 px-3 text-left font-medium">CUB</th>
                <th className="py-2 px-3 text-left font-medium">Índice</th>
                <th className="py-2 px-3 text-left font-medium">Investido</th>
                <th className="py-2 px-3 text-left font-medium">Valor Imóvel</th>
                <th className="py-2 px-3 text-left font-medium">Saldo Devedor</th>
                <th className="py-2 px-3 text-left font-medium">Valorização</th>
                <th className="py-2 px-3 text-left font-medium">Reforço</th>
                <th className="py-2 px-3 text-left font-medium">Juros Mês</th>
                <th className="py-2 px-3 text-left font-medium">Lucro Líquido</th>
              </tr>
            </thead>
            <tbody>
              {yearlyData.map((mes, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                  <td className="py-2 px-3 border-b">{Math.ceil(mes.mes/12)}</td>
                  <td className="py-2 px-3 border-b">{mes.mes}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorCubAtual)}</td>
                  <td className="py-2 px-3 border-b">{mes.indiceCubMensal?.toFixed(4)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.investido)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorImovel)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.saldoDevedor)}</td>
                  <td className="py-2 px-3 border-b">{formatarMoeda(mes.valorizacaoPrevista)}</td>
                  <td className="py-2 px-3 border-b text-center">
                    {mes.temReforco && <Check className="inline-block h-4 w-4 text-green-600" />}
                  </td>
                  <td className="py-2 px-3 border-b">
                    {formatarMoeda(mes.jurosMesPago + (mes.jurosReforcoMesPago || 0))}
                  </td>
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
          <li><span className="font-medium">CUB:</span> Valor do CUB no mês</li>
          <li><span className="font-medium">Índice:</span> Relação CUB atual/CUB inicial (fator de correção)</li>
          <li><span className="font-medium">Investido:</span> Total investido até o período</li>
          <li><span className="font-medium">Valor Imóvel:</span> Valor projetado do imóvel com valorização</li>
          <li><span className="font-medium">Saldo Devedor:</span> Valor restante a pagar</li>
          <li><span className="font-medium">Valorização:</span> Aumento no valor do imóvel desde a compra</li>
          <li><span className="font-medium">Reforço:</span> Indica se houve pagamento de reforço anual neste mês</li>
          <li><span className="font-medium">Juros Mês:</span> Juros pagos no mês (diferença entre valor corrigido e original)</li>
          <li><span className="font-medium">Lucro Líquido:</span> Ganho real considerando todos os custos</li>
        </ul>
      </div>
    </div>
  );
};

export default TabelaDetalhes;
