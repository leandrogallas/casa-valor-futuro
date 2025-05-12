
import React from "react";
import { Mail, Download } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface RelatorioFooterProps {
  onGerarPDF: () => void;
}

const RelatorioFooter: React.FC<RelatorioFooterProps> = ({ onGerarPDF }) => {
  return (
    <CardFooter className="bg-gray-50 border-t p-4">
      <div className="w-full flex justify-between items-center">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="outline" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Opções de Envio
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="space-y-2">
              <h4 className="font-medium">Envio do Relatório</h4>
              <p className="text-sm text-muted-foreground">
                Na aba "Detalhes do Empreendimento" você pode enviar este relatório 
                por e-mail para o cliente.
              </p>
            </div>
          </HoverCardContent>
        </HoverCard>
        <Button onClick={onGerarPDF} className="bg-investment-primary hover:bg-investment-secondary">
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>
    </CardFooter>
  );
};

export default RelatorioFooter;
