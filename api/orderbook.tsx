export const createOrderBookWebSocket = (
  symbol: string, // The coin symbol, e.g., "BTC"
  onData: (data: { bids: any[]; asks: any[]; midPrice?: number }) => void,
  onError: (error: string) => void
) => {
  const ws = new WebSocket("wss://api.hyperliquid.xyz/ws");

  ws.onopen = () => {
    console.log("WebSocket connected!");

    // Subscribe to l2Book for the selected symbol
    const l2BookSubscription = {
      method: "subscribe",
      subscription: {
        type: "l2Book",
        coin: symbol,
        nSigFigs: 5,
      },
    };

    // Subscribe to all mids
    const midsSubscription = {
      method: "subscribe",
      subscription: {
        type: "allMids",
      },
    };

    // Send subscription messages
    ws.send(JSON.stringify(l2BookSubscription));
    ws.send(JSON.stringify(midsSubscription));
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);

      // Handle l2Book data
      if (message.channel === "l2Book") {
        const orderBook = message.data;
        onData({
          bids: orderBook.levels[0], // Bids (Buy orders)
          asks: orderBook.levels[1], // Asks (Sell orders)
        });
      }

      // Handle allMids data
      if (message.channel === "allMids") {
        const midPrice = parseFloat(message.data.mids?.[symbol]); // Extract mid-price for the current symbol
        onData({ midPrice });
      }
    } catch (err) {
      console.error("Failed to parse WebSocket data:", err);
      onError("Failed to parse WebSocket data.");
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
    onError("WebSocket connection error.");
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed.");
  };

  // Return a cleanup function to close the WebSocket
  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
};
