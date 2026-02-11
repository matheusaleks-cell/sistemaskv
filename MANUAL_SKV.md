# 📙 Manual de Operação Detalhado - SKV Flow

Este manual foi desenvolvido para fornecer uma compreensão profunda de todas as engrenagens que movem o **SKV Flow**. Como uma plataforma integrada, cada ação em um módulo reflete em outros pontos do sistema.

---

## 🚀 1. Gestão de Identidade e Segurança

O SKV Flow separa as responsabilidades para garantir a integridade dos dados:

### 👤 Níveis de Acesso
*   **MASTER (Administrador):**
    *   Visualização de faturamento e métricas financeiras.
    *   Acesso total aos logs de auditoria (quem fez o quê).
    *   Gestão de configurações globais e usuários.
    *   Capacidade de excluir registros críticos (Produtos/Clientes).
*   **ATTENDANT (Atendente):**
    *   Foco operacional: criação de orçamentos e pedidos.
    *   Cadastro de clientes e consulta de preços.
    *   Não visualiza faturamento total nem logs de segurança.

**Dica de Segurança:** Ao trocar sua senha, ela é atualizada instantaneamente tanto no banco de dados quanto na sua sessão local. Recomendamos trocar a senha padrão no primeiro acesso.

---

## 🗂️ 2. Ciclo de Vida do Pedido (Workflow Técnico)

O sistema segue uma lógica de estado rigorosa para evitar erros de produção:

1.  **ORÇAMENTO (Status: `QUOTE`):**
    *   Nesta fase, o pedido não tem número de O.S.
    *   Pode ser editado livremente.
    *   **Cálculo de Área:** Para produtos como Lonas e Adesivos, o sistema multiplica `Largura x Altura` (em metros) pelo preço unitário.
2.  **APROVAÇÃO (Status: `APPROVED`):**
    *   O clique em "Aprovar Pedido" gera o número único de **O.S.** (ex: OS-2024-8742).
    *   O pedido entra na fila de espera da produção.
3.  **EM PRODUÇÃO (Status: `PRODUCTION`):**
    *   O sistema registra o `timestamp` exato de início.
    *   O card aparece no Kanban com destaque visual.
4.  **FINALIZADO (Status: `COMPLETED`):**
    *   O produto está fisicamente pronto.
    *   O sistema marca o fim do processo produtivo.
5.  **ENTREGUE (Status: `DELIVERED`):**
    *   Status final. O pedido sai da fila ativa de produção.
    *   Libera a geração do Recibo de Entrega.

---

## 🧮 3. Calculadora de Custos e Precificação

A inteligência de mercado da SKV está aqui. Ao usar a calculadora:
*   **Custo de Materiais:** Some tudo o que é gasto fisicamente.
*   **Margem de Markup:** O sistema sugere o preço de venda baseado na sua meta de lucratividade.
*   **Impostos:** Já descontados automaticamente do cálculo de margem real.

*Lembre-se: O preço final de venda pode ser exportado diretamente para a criação de um novo produto.*

---

## 📋 4. O.S. e Checklist de Qualidade

Ao imprimir uma **Ordem de Serviço (OS)**, o documento inclui:
*   **QRCode/Identificador:** Para busca rápida.
*   **Especificações Técnicas:** Medidas exatas e tipo de acabamento (ex: ilhós, bainha, verniz).
*   **Campo de Observações:** Para notas manuais do setor de produção.
*   **Área de Assinatura:** Para conferência do responsável pela qualidade.

---

## 🔍 5. Busca Global e Atalhos

A barra de busca no topo (Header) é "viva":
*   Ao digitar **3 letras**, ela busca simultaneamente em Clientes e Pedidos.
*   **Dica:** Você pode buscar por nome do cliente ou pelo número da OS diretamente.
*   O botão de **Notificações (Sininho)** mostra as últimas 5 ações relevantes (ex: "Novo orçamento criado").

---

## 🛠️ 6. Resolução de Problemas (Troubleshooting)

| Problema | Causa Provável | Solução |
| :--- | :--- | :--- |
| **PDF não abre** | Bloqueador de pop-ups | Permita pop-ups para o domínio do sistema. |
| **Preço por M² errado** | Medidas em CM | O sistema converte CM para M² automaticamente. Verifique se o produto está marcado como "Área". |
| **Login Inválido** | Letras maiúsculas | O sistema de nome de usuário diferencia `Wiliam` de `wiliam`. |

---

## 📜 7. Melhores Práticas

1.  **Mantenha o Kanban limpo:** Sempre mova os pedidos para "Entregue" assim que saírem da loja, para manter o faturamento diário preciso.
2.  **Cadastro Completo:** Sempre insira o WhatsApp do cliente. Isso permite enviar orçamentos com um clique.
3.  **Categorização:** Use as categorias de produtos (Banner, Adesivo, etc.) para extrair relatórios de vendas mais precisos no futuro.

---

*SKV Flow - Inteligência para o seu negócio.*
