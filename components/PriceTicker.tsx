import React, { useEffect, useState } from "react";
import { Text, View, StyleSheet } from "react-native";

interface PriceTickerProps {
  symbol: string; // Symbol of the asset (e.g., "BTC")
}

const PriceTicker: React.FC<PriceTickerProps> = ({ symbol }) => {
  const [price, setPrice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket("wss://api.hyperliquid-testnet.xyz/ws");

    ws.onopen = () => {
      console.log("WebSocket connected for Price Ticker!");

      const subscriptionMessage = {
        method: "subscribe",
        subscription: {
          type: "ticker",
          coin: symbol,
        },
      };

      ws.send(JSON.stringify(subscriptionMessage));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.channel === "ticker") {
          setPrice(message.data.last); // Assuming `last` is the price
          setIsLoading(false);
        }
      } catch (err) {
        setError("Failed to parse ticker data.");
        setIsLoading(false);
      }
    };

    ws.onerror = () => {
      setError("WebSocket error occurred.");
      setIsLoading(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
    };

    // Cleanup WebSocket connection
    return () => {
      ws.close();
    };
  }, [symbol]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Ticker for {symbol}</Text>
      {isLoading && <Text>Loading prices...</Text>}
      {error && <Text style={styles.error}>{error}</Text>}
      {!isLoading && price && (
        <Text style={styles.price}>Price: ${price}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#ddd",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    color: "green",
  },
  error: {
    fontSize: 14,
    color: "red",
  },
});

export default PriceTicker;
