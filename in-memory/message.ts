export interface Message {
  id: string;
  header: string;
  payload: string;
}

export type CreateMessageInput = {
  id?: string;
  header?: Record<string, any> | string;
  payload: Record<string, any> | string ;
};

export function createMessage(input: CreateMessageInput): Message {
  const header = typeof input.header === 'string' ? input.header : JSON.stringify(input.header);
  const payload = typeof input.payload === 'string' ? input.payload : JSON.stringify(input.payload);

  return {
    id: input.id ?? crypto.randomUUID(),
    header,
    payload,
  };
}
