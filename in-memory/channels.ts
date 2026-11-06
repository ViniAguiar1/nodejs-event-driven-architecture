import { createChannel } from './channel.interface.ts';

export const Channels = Object.freeze({
    NEW_ORDER: createChannel('new_order'),
    NEW_ORDER_ITEM: createChannel('new_order_item'),
});