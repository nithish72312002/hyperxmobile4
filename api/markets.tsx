export const createInfoPageWebSocket = (
    onData: (data: any) => void,
    onError: (error: string) => void
  ) => {
    const ws = new WebSocket("wss://api.hyperliquid.xyz/ws");
  
    ws.onopen = () => {
      console.log("WebSocket connected for InfoPage!");
  
      // Subscribe to webData2
      const subscription = {
        method: "subscribe",
        subscription: {
          type: "webData2",
          user: "0x0000000000000000000000000000000000000000",
        },
      };
  
      ws.send(JSON.stringify(subscription));
    };
  
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
  
        if (message.channel === "webData2" && message.data) {
          onData(message.data);
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
      console.log("WebSocket connection closed for InfoPage.");
    };
  
    // Cleanup function to close the WebSocket
    return () => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close();
      }
    };
  };
  