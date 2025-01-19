import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from "react-native";
import WebSocketManager from "@/api/WebSocketManager";

interface OrderBookProps {
  symbol: string; // Symbol of the asset (e.g., "BTC")
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol }) => {
  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);
  const [midPrice, setMidPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance();

    const orderBookListener = (data: any) => {
      if (data.levels && Array.isArray(data.levels)) {
        const [bidsData, asksData] = data.levels;

        setBids(
          bidsData.slice(0, 10).map((level: any) => ({
            px: parseFloat(level.px),
            sz: parseFloat(level.sz),
          }))
        );

        setAsks(
          asksData.slice(0, 10).map((level: any) => ({
            px: parseFloat(level.px),
            sz: parseFloat(level.sz),
          }))
        );
      }

      setIsLoading(false);
    };

    const allMidsListener = (data: any) => {
      if (data?.mids && data.mids[symbol]) {
        setMidPrice(parseFloat(data.mids[symbol]));
      }
    };

    wsManager.subscribe(
      "l2Book",
      { type: "l2Book", coin: symbol, nSigFigs: 5 },
      orderBookListener
    );

    wsManager.subscribe("allMids", { type: "allMids" }, allMidsListener);

    return () => {
      wsManager.unsubscribe(
        "l2Book",
        { type: "l2Book", coin: symbol, nSigFigs: 5 },
        orderBookListener
      );
      wsManager.unsubscribe("allMids", { type: "allMids" }, allMidsListener);
    };
  }, [symbol]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading order book...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Price (USDT)</Text>
        <Text style={styles.headerText}>Amount (XAU)</Text>
      </View>
      <FlatList
        data={asks}
        keyExtractor={(_, index) => `ask-${index}`}
        renderItem={({ item }) => (
          <View style={styles.orderRow}>
            <View style={[styles.bar, styles.askBar, { width: `${item.sz / 100}%` }]} />
            <Text style={styles.askText}>{item.px.toFixed(4)}</Text>
            <Text style={styles.askText}>{item.sz.toFixed(2)}</Text>
          </View>
        )}
        inverted
      />
      <View style={styles.midPriceContainer}>
        <Text style={styles.midPriceText}>
          {midPrice !== null ? midPrice.toFixed(4) : "Loading..."}
        </Text>
      </View>
      <FlatList
        data={bids}
        keyExtractor={(_, index) => `bid-${index}`}
        renderItem={({ item }) => (
          <View style={styles.orderRow}>
            <View style={[styles.bar, styles.bidBar, { width: `${item.sz / 100}%` }]} />
            <Text style={styles.bidText}>{item.px.toFixed(4)}</Text>
            <Text style={styles.bidText}>{item.sz.toFixed(2)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    padding: 10,
    borderRadius: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#888",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30,
    position: "relative",
  },
  bar: {
    position: "absolute",
    top: 0,
    bottom: 0,
    opacity: 0.2,
    borderRadius: 5,
  },
  askBar: {
    backgroundColor: "red",
    left: 0,
  },
  bidBar: {
    backgroundColor: "green",
    left: 0,
  },
  midPriceContainer: {
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 5,
    marginVertical: 8,
  },
  midPriceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
  askText: {
    color: "red",
    fontSize: 14,
    marginLeft: 50,
  },
  bidText: {
    color: "green",
    fontSize: 14,
    marginLeft: 50,
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export default OrderBook;
