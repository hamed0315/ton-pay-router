
export function connectPaymentSocket(invoiceId: string, onStatus: (status: string) => void) {
  const ws = new WebSocket(`ws://localhost:8080/ws/pay/${invoiceId}`);
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'status_update') {
      onStatus(data.data.status);
    }
  };
  return () => ws.close();
}
