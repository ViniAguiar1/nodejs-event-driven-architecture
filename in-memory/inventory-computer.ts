import { Channels } from "./channels.ts";
import type { Message } from "./message.ts";
import type { ItemPedido } from "./pedido.interface.ts";
import { waitRandomInMS } from './wait.ts';

const SYSTEM = '[INVENTORY(C)]';

export async function inventoryCheck(message: Message) {
    const orderItem: ItemPedido = JSON.parse(message.payload)

    console.debug(`[${SYSTEM}] - Checando inventário para o item:`, orderItem.nome)

    await waitRandomInMS(1000, 3000)
    console.debug(`[${SYSTEM}] - item ${orderItem.nome} existe no inventário ✅`)
}

Channels.NEW_ORDER_ITEM_STOCK_COMPUTER.subscribe(inventoryCheck)