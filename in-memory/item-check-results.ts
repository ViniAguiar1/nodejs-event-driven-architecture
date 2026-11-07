import type { ItemPedido } from "./pedido.interface.ts";

export interface ItemCheckResult {
    item: ItemPedido;
    available: boolean;
}