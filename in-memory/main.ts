import { createMessage } from './message.ts';
import type { ItemPedido } from './pedido.interface.ts';
import type { Pedido } from './pedido.interface.ts';
import { Channels } from './channels.ts';
import './splitter.ts';

const item: ItemPedido = {
    id: 'C_001',
    nome: 'Monitor 24"',
    quantidade: 1,
    precoUnitario: 1000,
}

const item2: ItemPedido = {
    id: 'C_002',
    nome: 'Mouse',
    quantidade: 1,
    precoUnitario: 100,
}

const pedido: Pedido = {
    id: 'P_001',
    idCliente: 'C_001',
    itens: [item, item2],
}

const message = createMessage({ payload: pedido });

Channels.NEW_ORDER.send(message);