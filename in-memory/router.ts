import { createMessage, type Message } from './message.ts';
import { Channels } from './channels.ts';
import type { ItemPedido } from './pedido.interface.ts';

export function router(message: Message) {
    const orderItem: ItemPedido = JSON.parse(message.payload);
    const inventoryType = orderItem.id.startsWith('C_') ? 'computer' : 'phone';

    const jobInventoryCheck = createMessage({
        payload: orderItem,
        header: message.header,
    });
    if (inventoryType === 'computer') {
        Channels.NEW_ORDER_ITEM_STOCK_COMPUTER.send(jobInventoryCheck);
    } else {
        Channels.NEW_ORDER_ITEM_STOCK_PHONE.send(jobInventoryCheck);
    }
}

Channels.NEW_ORDER_ITEM.subscribe(router);