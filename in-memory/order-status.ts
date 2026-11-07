export interface OrderStatus {
  orderId: string;
  canBeAssisted: boolean;
  reason?: 'out_of_stock' | 'timeout';
}
