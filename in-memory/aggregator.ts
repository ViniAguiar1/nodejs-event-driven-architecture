import { createMessage, type Message } from './message.ts';
import type { OrderItemHeader } from './splitter.ts';
import type { OrderStatus } from './order-status.ts';
import { Channels } from './channels.ts';
import type { ItemCheckResult } from './item-check-results.ts';

const mapOfOrderItens = new Map<
  string,
  { total: number; atual: number; hasFailure: boolean }
>();

const SYSTEM = '[Aggregator]';
export function aggregator(message: Message) {
  const checkResult: ItemCheckResult = JSON.parse(message.payload);
  const { totalItens, orderId } = JSON.parse(message.header) as OrderItemHeader;

  console.debug(
    `${SYSTEM} (ORDER=${orderId}) - Item do pedido verificado: ${checkResult.item.nome}`,
  );

  // 1. Garante que a ficha do pedido existe
  if (!mapOfOrderItens.has(orderId)) {
    mapOfOrderItens.set(orderId, {
      total: totalItens,
      atual: 0,
      hasFailure: false,
    });
  }

  // 2. Conta a checagem recebida
  const order = mapOfOrderItens.get(orderId)!;
  order.atual++;

  // 3. Se o item faltou, anota na ficha
  if (!checkResult.available) {
    console.debug(
      `${SYSTEM} (ORDER=${orderId}) ❌ Item indisponível: ${checkResult.item.nome}`,
    );
    order.hasFailure = true;
  }

  // 4. Quando todas as checagens chegarem, decide olhando a ficha
  if (order.atual >= order.total) {
    if (order.hasFailure) {
      sendOrderStatus(orderId, false, 'out_of_stock');
    } else {
      sendOrderStatus(orderId, true);
    }
  }
}

function sendOrderStatus(
  orderId: string,
  canBeAssisted: boolean,
  reason?: OrderStatus['reason'],
) {
  const orderStatus: OrderStatus = {
    orderId,
    canBeAssisted,
    reason,
  };
  const message = createMessage({
    payload: orderStatus,
  });
  Channels.STATUS_ORDER.send(message);
}

Channels.STATUS_ORDER_ITEM.subscribe(aggregator);
