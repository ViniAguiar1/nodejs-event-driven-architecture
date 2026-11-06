import { createChannel } from './channel.interface.ts';

export const Channels = Object.freeze({
    NEW_ORDER: createChannel('new_order'),
    NEW_ORDER_ITEM: createChannel('new_order_item'),
    NEW_ORDER_ITEM_STOCK_COMPUTER: createChannel('new_order_item_stock_computer'),
    NEW_ORDER_ITEM_STOCK_PHONE: createChannel('new_order_item_stock_phone'),
});