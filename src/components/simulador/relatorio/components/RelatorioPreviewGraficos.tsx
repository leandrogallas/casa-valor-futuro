
import React from "react";
import { ChartBar, Table } from "lucide-react";
import { PDFOptions } from "@/types/simulador";

interface RelatorioPreviewGraficosProps {
  opcoesPDF: PDFOptions;
}

const RelatorioPreviewGraficos: React.FC<RelatorioPreviewGraficosProps> = ({ opcoesPDF }) => {
  return (
    <div className="space-y-4">
      {opcoesPDF.incluirGraficoGlobal && (
        <div className="border p-3 rounded-md">
          <p className="text-sm font-medium mb-2">Evolução do Investimento (Gráfico Global)</p>
          <div className="h-40 bg-gradient-to-r from-purple-50 to-blue-50 rounded-md flex items-center justify-center">
            <ChartBar size={40} className="text-muted-foreground/50" />
          </div>
        </div>
      )}
      
      {opcoesPDF.incluirGraficoMensal && (
        <div className="border p-3 rounded-md">
          <p className="text-sm font-medium mb-2">Ganhos de Capital Mensais</p>
          <div className="h-40 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-md flex items-center justify-center">
            <ChartBar size={40} className="text-muted-foreground/50" />
          </div>
        </div>
      )}
      
      {opcoesPDF.incluirTabela && (
        <div className="border p-3 rounded-md">
          <p className="text-sm font-medium mb-2">Tabela de Resumo Anual</p>
          <div className="bg-gradient-to-r from-gray-50 to-white rounded-md p-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Mês</th>
                  <th className="text-left p-2">Investido</th>
                  <th className="text-left p-2">Valor Imóvel</th>
                  <th className="text-left p-2">Lucro</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">12</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ X.XXX</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="p-2">24</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ XX.XXX</td>
                  <td className="p-2">R$ X.XXX</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RelatorioPreviewGraficos;
