import { Channels } from './channels.ts';
import { createMessage, type Message } from './message.ts';
import type { ItemPedido } from './pedido.interface.ts';
import { waitRandomInMS } from './wait.ts';
import { availableToSale } from './availableToSale.ts'
import type { ItemCheckResult } from './item-check-results.ts';

const SYSTEM = '[INVENTORY(C)]';

export async function inventoryCheck(message: Message) {
  const orderItem: ItemPedido = JSON.parse(message.payload);
  console.debug(`${SYSTEM} - Checando inventário para o item:`, orderItem.nome);

  await waitRandomInMS(1000, 3000);

  const availableStockToSale = availableToSale(0.3)

  if (availableStockToSale){
    console.debug(`${SYSTEM} - item ${orderItem.nome} existe no inventário ✅`);
  } else {
    console.debug(`${SYSTEM} - item ${orderItem.nome} não existe no inventário ❌`)
  }

  const checkResult: ItemCheckResult = {
    item: orderItem,
    available: availableStockToSale,
  };

  const result = createMessage({
    payload: checkResult,
    header: message.header,
  });

  Channels.STATUS_ORDER_ITEM.send(result);
}

Channels.NEW_ORDER_ITEM_STOCK_COMPUTER.subscribe(inventoryCheck);
