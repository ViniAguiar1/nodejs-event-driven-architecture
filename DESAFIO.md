# Desafio: "E se faltar estoque?"

Requisitos e regras de negócio para evoluir o fluxo de pedidos em memória (`in-memory/`).

## 1. Contexto

Hoje o fluxo só cobre o caminho feliz: todo item existe em estoque e todo pedido termina com `canBeAssisted: true`.

### Fluxo atual

```
main ──► new_order ──► [Splitter] ──► new_order_item ──► [Router]
                                                            │
                         ┌──────────────────────────────────┴───────┐
                         ▼                                          ▼
          new_order_item_stock_computer              new_order_item_stock_phone
                         │                                          │
                [Inventory (C)]                            [Inventory (S)]
                         └─────────────► status_order_item ◄────────┘
                                                │
                                          [Aggregator]
                                                │
                                                ▼
                                          status_order
```

### Glossário

| Termo | Significado |
|---|---|
| **Pedido** | Conjunto de itens de um cliente (`Pedido`). |
| **Item** | Produto dentro de um pedido (`ItemPedido`). O prefixo do `id` define o tipo: `C_` = computador, qualquer outro = celular. |
| **Checagem de item** | Resposta do inventário dizendo se o item está ou não disponível. |
| **Status do pedido** | Resultado final publicado em `status_order` (`OrderStatus`). |
| **Pedido aprovado** | `canBeAssisted: true`: todos os itens estão disponíveis. |
| **Pedido reprovado** | `canBeAssisted: false`: algum item está indisponível ou o pedido expirou. |

## 2. Regras de negócio

| ID | Regra |
|---|---|
| **RN-01** | Todo pedido com pelo menos 1 item deve receber um status final, inclusive pedidos com **um único item**. |
| **RN-02** | Cada pedido gera **exatamente um** status em `status_order`. Nunca zero e nunca mais de um. |
| **RN-03** | Um pedido só é **aprovado** se **todos** os itens forem checados e estiverem disponíveis. |
| **RN-04** | Um pedido é **reprovado** assim que **qualquer** item voltar indisponível, sem esperar os demais. |
| **RN-05** | Checagens que chegarem depois de o pedido já ter um status final são **ignoradas** e não geram um novo status. |
| **RN-06** | Se o pedido não receber todas as checagens dentro do **tempo limite**, ele é **reprovado por timeout**. |
| **RN-07** | Todo status reprovado deve informar o **motivo**: `"out_of_stock"` ou `"timeout"`. |
| **RN-08** | A checagem de item deve manter o `header` original, para que o aggregator saiba a qual pedido o item pertence (`orderId`) e quantos itens o pedido tem (`totalItens`). |
| **RN-09** | Depois que o pedido recebe o status final, o aggregator remove o registro desse pedido da memória. |

## 3. Requisitos por nível

### Nível 1: aquecimento

**Objetivo:** pedido com 1 item também é confirmado.

- **RF-1.1**: O aggregator deve confirmar o pedido quando o número de itens checados atingir `totalItens`, inclusive na **primeira** checagem recebida.

**Critérios de aceite**
- [x] Um pedido com `itens: [item]` publica uma mensagem em `status_order`. *(RN-01)*
- [x] O pedido de 2 itens continua funcionando como antes.

---

### Nível 2: o estoque pode dizer "não"

**Objetivo:** o inventário pode reprovar itens.

- **RF-2.1**: Cada inventário decide se o item está disponível. Na simulação, há **30% de chance** de o item estar indisponível.
- **RF-2.2**: O inventário publica em `status_order_item` uma **nova mensagem** que contém o item e o resultado da checagem (disponível ou não), mantendo o `header` original. *(RN-08)*
- **RF-2.3**: O aggregator publica `canBeAssisted: false` com o motivo `"out_of_stock"` se algum item estiver indisponível. *(RN-03, RN-07)*

**Critérios de aceite**
- [x] Rodando o exemplo várias vezes, aparecem pedidos aprovados **e** reprovados.
- [x] Os logs do inventário mostram ✅ para item disponível e ❌ para indisponível.

---

### Nível 3: falhar rápido

**Objetivo:** reprovar sem esperar os itens restantes.

- **RF-3.1**: Ao receber a primeira checagem indisponível, o aggregator publica o status reprovado **na hora**. *(RN-04)*
- **RF-3.2**: Checagens que chegarem depois do status final são descartadas, com um log informando o descarte. *(RN-05)*
- **RF-3.3**: Depois do status final, o registro do pedido sai do `Map`. *(RN-09)*

**Critérios de aceite**
- [ ] Cada pedido gera **exatamente uma** mensagem em `status_order`, seja aprovado ou reprovado. *(RN-02)*
- [ ] Num pedido de 3 itens em que o 1º volta indisponível, o status sai antes de os outros 2 chegarem.

---

### Nível 4: timeout

**Objetivo:** pedidos não ficam presos para sempre.

- **RF-4.1**: Ao registrar um pedido, o aggregator inicia um temporizador com o tempo limite (sugestão: **5 segundos**, configurável).
- **RF-4.2**: Se o tempo acabar e o pedido ainda não tiver status final, ele é reprovado com o motivo `"timeout"`. *(RN-06, RN-07)*
- **RF-4.3**: Quando o pedido recebe o status final antes do tempo acabar, o temporizador é cancelado.

**Critérios de aceite**
- [ ] Com o `import './inventory-phone.ts'` comentado no `main.ts`, o pedido recebe o status `timeout` depois do tempo limite.
- [ ] Pedidos que completam a tempo **não** recebem um segundo status de timeout. *(RN-02)*
- [ ] O processo termina normalmente, sem temporizador pendurado.

---

### 🏆 Bônus: testes automatizados

**Objetivo:** garantir as regras com testes, usando `node:test`.

- **RF-B.1**: A chance de falha do inventário deve ser configurável ou injetável, para os testes não dependerem do acaso.
- **RF-B.2**: O tempo limite do aggregator deve ser configurável, para os testes rodarem rápido.

**Casos de teste mínimos**
- [ ] Pedido de 1 item é aprovado. *(RN-01)*
- [ ] Pedido com todos os itens disponíveis é aprovado. *(RN-03)*
- [ ] Pedido com um item indisponível é reprovado com `"out_of_stock"`. *(RN-04, RN-07)*
- [ ] Checagem tardia não gera um segundo status. *(RN-05)*
- [ ] Pedido incompleto é reprovado com `"timeout"`. *(RN-06)*
- [ ] Cada pedido gera exatamente um status. *(RN-02)*

## 4. Contratos sugeridos

Esta é uma sugestão. Você pode adaptar os nomes como preferir.

```ts
// Resultado da checagem de um item (payload em status_order_item)
interface ItemCheckResult {
  item: ItemPedido;
  available: boolean;
}

// Status final do pedido (payload em status_order)
interface OrderStatus {
  orderId: string;
  canBeAssisted: boolean;
  reason?: 'out_of_stock' | 'timeout';
}
```

## 5. Fora do escopo

Estes temas ficaram de fora porque aparecem nas próximas aulas do curso:

- Idempotência (mensagens duplicadas)
- Checagem financeira
- DLQ (dead letter queue) e retentativas
- Persistência, já que o estado continua em memória
