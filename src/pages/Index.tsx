
import SimuladorInvestimento from "@/components/SimuladorInvestimento";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-investment-dark mb-2">Simulador de Investimento Imobiliário</h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Compare o investimento em imóveis considerando entrada, parcelas, reforços, valorização e juros.
            Analise o saldo devedor, ganho de capital e retorno do seu investimento ao longo do tempo.
          </p>
        </div>
        <SimuladorInvestimento />
      </div>
    </div>
  );
};

export default Index;
