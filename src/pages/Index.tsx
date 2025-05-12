
import SimuladorInvestimento from "@/components/SimuladorInvestimento";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-investment-dark mb-2">Simulador de Investimento Imobiliário</h1>
          <p className="text-lg text-muted-foreground">
            Calcule retornos, valorização e ganhos de capital para seu investimento imobiliário
          </p>
        </div>
        <SimuladorInvestimento />
      </div>
    </div>
  );
};

export default Index;
