import { createMessage } from './message.ts';
import type { ItemPedido } from './pedido.interface.ts';
import type { Pedido } from './pedido.interface.ts';
import { Channels } from './channels.ts';
import { splitter } from './splitter.ts';

const item: ItemPedido = {
    id: 'C_001',
    nome: 'Monitor 24"',
    quantidade: 1,
    precoUnitario: 1000,
}

const pedido: Pedido = {
    id: 'P_001',
    idCliente: 'C_001',
    itens: [item],
}

const message = createMessage({ payload: pedido });

Channels.NEW_ORDER.subscribe(splitter);

Channels.NEW_ORDER.send(message);