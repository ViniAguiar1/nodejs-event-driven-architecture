import { createMessage, type Message } from "./message.ts";
import type { ItemPedido } from "./pedido.interface.ts";
import type { OrderItemHeader } from "./splitter.ts";
import type { OrderStatus } from './order-status.ts'
import { Channels } from "./channels.ts";

const mapOfOrderItens = new Map<string, {total: number; atual: number }>();

const SYSTEM = '[Aggregator]';
export function aggregator(message: Message){
    const orderItem: ItemPedido = JSON.parse(message.payload)
    const { totalItens, orderId } = JSON.parse(
        message.header,
    ) as OrderItemHeader

    console.debug(`${SYSTEM} (ORDER=${orderId}) - Item do pedido verificado: ${orderItem.nome}`)

    const order = mapOfOrderItens.get(orderId)
    if(order){
        order.atual++;
        if(order.atual >= order.total) {
            confirmOrderStatus(orderId)
        }
    } else {
        mapOfOrderItens.set(orderId, {
            atual: 1,
            total: totalItens,
        })
    }
}
function confirmOrderStatus(orderId: string){
    const orderStatus: OrderStatus = {
        orderId,
        canBeAssisted: true
    };
    const message = createMessage({
        payload: orderStatus
    });
    Channels.STATUS_ORDER.send(message)
}

Channels.STATUS_ORDER_ITEM.subscribe(aggregator)