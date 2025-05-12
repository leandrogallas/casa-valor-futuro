import React from "react";
import { format } from "date-fns";
import { CalendarIcon, Mail, FileText } from "lucide-react";
import { DadosEmpreendimento } from "@/types/simulador";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface FormularioEmpreendimentoProps {
  dadosEmpreendimento: DadosEmpreendimento;
  onChange: (campo: keyof DadosEmpreendimento, valor: any) => void;
  hasSimulacao: boolean;
  onEnviarPDF: () => void;
}

const FormularioEmpreendimento: React.FC<FormularioEmpreendimentoProps> = ({
  dadosEmpreendimento,
  onChange,
  hasSimulacao,
  onEnviarPDF
}) => {
  const handleInputChange = (campo: keyof DadosEmpreendimento) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(campo, e.target.value);
  };

  return (
    <Card className="border-investment-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle>Detalhes do Empreendimento</CardTitle>
        <CardDescription>
          Informações sobre o projeto imobiliário e envio do relatório
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Informações do Projeto</h3>
          <div className="space-y-2">
            <Label htmlFor="nomeEmpreendimento">Nome do Empreendimento</Label>
            <Input
              id="nomeEmpreendimento"
              value={dadosEmpreendimento.nomeEmpreendimento}
              onChange={handleInputChange('nomeEmpreendimento')}
              placeholder="Ex: Residencial Vista Verde"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataInicio">Data de Início das Obras</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dadosEmpreendimento.dataInicio && "text-muted-foreground"
                  )}
                  id="dataInicio"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dadosEmpreendimento.dataInicio ? (
                    format(dadosEmpreendimento.dataInicio, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dadosEmpreendimento.dataInicio || undefined}
                  onSelect={(date) => onChange('dataInicio', date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dataEntrega">Data de Entrega Prevista</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dadosEmpreendimento.dataEntrega && "text-muted-foreground"
                  )}
                  id="dataEntrega"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dadosEmpreendimento.dataEntrega ? (
                    format(dadosEmpreendimento.dataEntrega, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione a data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dadosEmpreendimento.dataEntrega || undefined}
                  onSelect={(date) => onChange('dataEntrega', date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Envio de Relatório</h3>
          <div className="space-y-2">
            <Label htmlFor="emailCliente">Email do Cliente</Label>
            <Input
              id="emailCliente"
              type="email"
              value={dadosEmpreendimento.emailCliente}
              onChange={handleInputChange('emailCliente')}
              placeholder="cliente@exemplo.com"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem Personalizada (opcional)</Label>
            <Textarea
              id="mensagem"
              value={dadosEmpreendimento.mensagem}
              onChange={handleInputChange('mensagem')}
              placeholder="Escreva uma mensagem para o cliente..."
              className="w-full h-24"
            />
          </div>
        </div>
        
        <Button 
          onClick={onEnviarPDF} 
          className="w-full mt-4 bg-investment-primary hover:bg-investment-secondary"
          disabled={!hasSimulacao}
        >
          <Mail className="mr-2 h-4 w-4" />
          Enviar Relatório por Email
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormularioEmpreendimento;
