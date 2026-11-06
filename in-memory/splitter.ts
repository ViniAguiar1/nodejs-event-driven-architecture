import type { Message } from './message.ts';
import type { Pedido } from './pedido.interface.ts';
import { createMessage } from './message.ts';
import { Channels } from './channels.ts';

export function splitter(message: Message) {
    const order: Pedido = JSON.parse(message.payload);
    console.debug('[Splitter] Pedido recebido: %o', order);

    for (const orderItem of order.itens){
        const newOrderItemMessage = createMessage({
            payload: orderItem,
            header: {
                orderId: order.id,
            }
        });
        Channels.NEW_ORDER_ITEM.send(newOrderItemMessage);
    }
}

Channels.NEW_ORDER.subscribe(splitter);