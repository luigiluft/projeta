
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createTasksInBulk } from "@/utils/bulkTaskCreation";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function BulkTaskCreation() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: projectAttributes } = useQuery({
    queryKey: ['project_attributes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_attributes')
        .select('*');

      if (error) {
        toast.error('Erro ao carregar atributos do projeto');
        throw error;
      }

      return data;
    },
  });

  const handleCreateTasks = async () => {
    setIsSubmitting(true);
    
    try {
      // Array de tarefas para o projeto "Implementação Ecommerce B2C"
      const tasks = [
        {
          epic: "Implementação Ecommmerce B2C",
          story: "Briefing",
          task_name: "Preenchimento das planilhas de cadastro",
          formula: "PRODUCT_ATTRIBUTES * 20/60",
        },
        {
          epic: "Implementação Ecommmerce B2C",
          story: "Briefing",
          task_name: "Importação das planilhas de cadastro",
          formula: "if(SKU_COUNT<2000,15/60,Math.ceil(SKU_COUNT/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Implementação Ecommmerce B2C",
          story: "Configuração",
          task_name: "Validação do cadastro de produtos",
          formula: "",
        },
        {
          epic: "Implementação Ecommmerce B2B",
          story: "Briefing",
          task_name: "Preenchimento das planilhas de cadastro",
          formula: "PRODUCT_ATTRIBUTES*20/60",
        },
        {
          epic: "Implementação Ecommmerce B2B",
          story: "Briefing",
          task_name: "Importação das planilhas de cadastro",
          formula: "if(SKU_COUNT<2000,15/60,Math.ceil(SKU_COUNT/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Implementação Ecommmerce B2B",
          story: "Briefing",
          task_name: "Preenchimento das planilhas de tabelas de preço",
          formula: "PRODUCT_ATTRIBUTES/2*20/60",
        },
        {
          epic: "Implementação Ecommmerce B2B",
          story: "Briefing",
          task_name: "Importação das planilhas de preço",
          formula: "if(SKU_COUNT<2000,15/60,Math.ceil(SKU_COUNT/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Implementação Ecommmerce B2B",
          story: "Configuração",
          task_name: "Validação do cadastro de produtos",
          formula: "",
        },
        {
          epic: "Implementação Distribuidora Digital",
          story: "Briefing",
          task_name: "Preenchimento das planilhas de cadastro",
          formula: "PRODUCT_ATTRIBUTES*20/60",
        },
        {
          epic: "Implementação Distribuidora Digital",
          story: "Briefing",
          task_name: "Importação das planilhas de cadastro",
          formula: "if(SKU_COUNT<2000,15/60,Math.ceil(SKU_COUNT/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Implementação Distribuidora Digital",
          story: "Configuração",
          task_name: "Validação do cadastro de produtos",
          formula: "",
        },
        {
          epic: "Implementação ERP",
          story: "Cadastro",
          task_name: "Preenchimento das planilhas de cadastro com informações detalhadas (nome, descrição, preço, códigos fiscais, etc.).",
          formula: "PRODUCT_ATTRIBUTES*20/60",
        },
        {
          epic: "Implementação ERP",
          story: "Cadastro",
          task_name: "Importação das planilhas de cadastro no sistema.",
          formula: "if(SKU_COUNT<2000,15/60,Math.ceil(SKU_COUNT/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Implementação ERP AGREGA",
          story: "Cadastro",
          task_name: "Preenchimento das planilhas de cadastro com informações detalhadas (nome, descrição, preço, códigos fiscais, etc.).",
          formula: "PRODUCT_ATTRIBUTES*20/60",
        },
        {
          epic: "Implementação ERP AGREGA",
          story: "Cadastro",
          task_name: "Importação das planilhas de cadastro no sistema.",
          formula: "if(SKU_COUNT<2000,15/60,Math.ceil(SKU_COUNT/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Implementação Hub de Atendimento",
          story: "Configuração Inicial",
          task_name: "Configurar canais de atendimento (WhatsApp, Facebook Messenger, Telegram, e-mail, chat online)",
          formula: "SERVICE_CHANNELS*0.5",
        },
        {
          epic: "Implementação Hub de Atendimento",
          story: "Cadastro de Clientes",
          task_name: "Importar ou cadastrar manualmente clientes e fornecedores",
          formula: "REGISTERED_CUSTOMERS*20/60",
        },
        {
          epic: "Implementação Hub de Atendimento",
          story: "Cadastro de Clientes",
          task_name: "Revisar e validar os cadastros",
          formula: "PRODUCT_ATTRIBUTES*20/60*0.1",
        },
        {
          epic: "Implementação Hub de Atendimento",
          story: "Testes",
          task_name: "Realizar testes de atendimento em todos os canais",
          formula: "SERVICE_CHANNELS*0.5",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Suporte",
          task_name: "Oferecer suporte técnico para o uso do e-commerce.",
          formula: "TECHNICAL_SUPPORT",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Suporte",
          task_name: "Suporte na configuração e entendimento dos fluxos operacionais do e-commerce.",
          formula: "ECOMMERCE_TRAINING",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Suporte",
          task_name: "Monitoramento de bugs e acompanhamento da resolução.",
          formula: "BUG_MONITORING",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Atualizações e Melhorias",
          task_name: "Atualizar o conteúdo institucional (sobre nós, políticas, informações de contato, etc.).",
          formula: "INSTITUTIONAL_CONTENT_UPDATE",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Atualizações e Melhorias",
          task_name: "Implementar melhorias na usabilidade da plataforma para facilitar a navegação do cliente.",
          formula: "IMPROVEMENTS_IMPLEMENTATION",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Atualizações e Melhorias",
          task_name: "Realizar correções de erros identificados no e-commerce (ex.: páginas quebradas, lentidão).",
          formula: "FRONTEND_BUG_FIXES",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Configurações",
          task_name: "Configurar e ajustar funcionalidades do e-commerce (formas de pagamento, envio, etc.).",
          formula: "CONFIGURATION_UPDATE",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Configurações",
          task_name: "Editar regras de negócio para atender mudanças operacionais (ex.: política de devolução).",
          formula: "BUSINESS_RULES_UPDATE",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Configurações",
          task_name: "Criar e gerenciar regras promocionais (descontos, cupons, promoções).",
          formula: "PROMOTIONAL_RULES_CREATION",
        },
        {
          epic: "Sustentação Ecommerce",
          story: "Monitoramento e Correções",
          task_name: "Corrigir erros relacionados a processos de integração e troca de dados com outros sistemas.",
          formula: "INTEGRATION_BUG_FIXES",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Faturamento e Monitoramento",
          task_name: "Entrada de Notas Fiscais (NFs).",
          formula: "ORDERS_PER_MONTH/40*15/60*0.1",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Faturamento e Monitoramento",
          task_name: "Processamento de cancelamentos e devoluções.",
          formula: "RETURNS_PERCENTAGE*ORDERS_PER_MONTH*25/60",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Faturamento e Monitoramento",
          task_name: "Faturamento de pedidos (emissão de notas fiscais e envio ao cliente).",
          formula: "ORDERS_PER_MONTH/40*15/60",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Faturamento e Monitoramento",
          task_name: "Pagamento da Guia Difal",
          formula: "0.08*ORDERS_PER_MONTH/40*30/60",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Gestão Logística",
          task_name: "Acompanhamento logístico dos produtos (rastreio de envios e entregas).",
          formula: "if(ORDERS_PER_MONTH<22,ORDERS_PER_MONTH/40,22)",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Gestão Logística",
          task_name: "Resolução de problemas em entregas (atrasos, endereços incorretos, etc.).",
          formula: "if(ORDERS_PER_MONTH<22,ORDERS_PER_MONTH/40,22)*SERVICE_PERCENTAGE",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Cadastro e Importação",
          task_name: "Preenchimento das planilhas de cadastro com informações detalhadas (nome, descrição, preço, códigos fiscais, etc.).",
          formula: "PRODUCT_ATTRIBUTES*20/60*NEW_PRODUCTS_PERCENTAGE",
        },
        {
          epic: "Faturamento e Gestão Operacional",
          story: "Cadastro e Importação",
          task_name: "Importação das planilhas de cadastro no sistema.",
          formula: "if(SKU_COUNT*NEW_PRODUCTS_PERCENTAGE<2000,15/60,Math.ceil(SKU_COUNT*NEW_PRODUCTS_PERCENTAGE/2000)*Math.pow(15,1.78)/60)",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Atendimento",
          task_name: "Atendimento para entendimento do processo de compra e checkout",
          formula: "ORDERS_PER_MONTH*SERVICE_PERCENTAGE*CUSTOMER_SERVICE_TIME/60/2",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Atendimento",
          task_name: "Atendimento ao consumidor pós venda e infos do pedido",
          formula: "ORDERS_PER_MONTH*SERVICE_PERCENTAGE*CUSTOMER_SERVICE_TIME/60/2",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Atendimento",
          task_name: "Suporte para devoluções de pedidos",
          formula: "RETURNS_PERCENTAGE*ORDERS_PER_MONTH*25/60/3",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Atendimento",
          task_name: "Suporte para configuração de novos canais de atendimento (WhatsApp, Facebook Messenger, Telegram, etc.).",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Configurações",
          task_name: "Configuração de novos departamentos de atendimento.",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Configurações",
          task_name: "Configuração de regras de roteamento para direcionar clientes ao atendente certo.",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Configurações",
          task_name: "Configuração de notificações e alertas personalizados para a equipe de atendimento.",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Configurações",
          task_name: "Atualização de fluxos e mensagens nos chatbots.",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Regras e Promoções",
          task_name: "Criação e edição de fluxos promocionais para campanhas específicas.",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Atendimento ao Consumidor (SAC 4.0)",
          story: "Regras e Promoções",
          task_name: "Configuração de mensagens personalizadas para promoções e eventos.",
          formula: "SERVICE_CONFIG_UPDATE/7",
        },
        {
          epic: "Implementação do Anymarket",
          story: "Configuração Inicial",
          task_name: "Parametrização canal marketplace",
          formula: "MARKETPLACE_CHANNELS*2",
        },
        {
          epic: "Implementação do Anymarket",
          story: "Cadastro e Importação",
          task_name: "Vincular produtos no canal marketplace",
          formula: "MARKETPLACE_CHANNELS*SKU_COUNT*0.001*3",
        },
        {
          epic: "Sustentação do Anymarket",
          story: "Atualizações e Melhorias",
          task_name: "Atualizar o cadastro de produtos",
          formula: "MARKETPLACE_CHANNELS*SKU_COUNT*0.001*3*NEW_PRODUCTS_PERCENTAGE",
        },
      ];

      const result = await createTasksInBulk(tasks);
      
      if (result.success) {
        toast.success("Tarefas cadastradas com sucesso!");
        setTimeout(() => {
          navigate('/task-management');
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao cadastrar tarefas:", error);
      toast.error("Ocorreu um erro ao cadastrar as tarefas");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/task-management")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Importação em Lote de Tarefas</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Atributos Disponíveis</CardTitle>
          <CardDescription>
            Os seguintes códigos de atributos estão disponíveis para uso nas fórmulas:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {projectAttributes?.map((attr) => (
              <div key={attr.id} className="p-3 border rounded-md">
                <div className="font-bold">{attr.code}</div>
                <div className="text-sm text-gray-600">{attr.name}</div>
                <div className="text-xs text-gray-500">
                  Unidade: {attr.unit || 'N/A'} | Padrão: {attr.default_value || '0'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importar Tarefas em Lote</CardTitle>
          <CardDescription>
            Esta operação vai cadastrar todas as tarefas da lista predefinida.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Serão cadastradas 52 tarefas com suas respectivas fórmulas usando os códigos dos atributos em vez dos nomes.
            <br/>
            Fórmulas com funções como 'if' e operadores matemáticos foram adaptadas para JavaScript.
          </p>
        </CardContent>
        
        <CardFooter className="justify-end">
          <Button
            onClick={handleCreateTasks}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processando..." : "Cadastrar Tarefas"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
