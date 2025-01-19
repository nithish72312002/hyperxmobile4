import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from "react-native";
import { createInfoPageWebSocket } from "@/api/info";

interface PerpTokenData {
  name: string;
  price: number;
  volume: number;
  change: number; // 24-hour change percentage
}

const InfoPage: React.FC = () => {
  const [tokens, setTokens] = useState<PerpTokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleanupWebSocket = createInfoPageWebSocket(
      (data) => {
        try {
          if (!data || !data.meta || !data.assetCtxs) {
            console.error("Unexpected WebSocket data format:", data);
            return;
          }

          const { meta, assetCtxs } = data;

          // Map `meta.universe` (perps only) with `assetCtxs` (price and volume data)
          const formattedTokens = meta.universe.map((token: any, index: number) => {
            const ctx = assetCtxs[index] || {};
            const { markPx, dayBaseVlm, prevDayPx } = ctx;

            const price = markPx !== undefined ? parseFloat(markPx) : 0;
            const volume = dayBaseVlm !== undefined ? parseFloat(dayBaseVlm) : 0;
            const prevPrice = prevDayPx !== undefined ? parseFloat(prevDayPx) : 0;

            // Calculate 24-hour percentage change
            const change = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;

            return {
              name: token.name || "Unknown",
              price,
              volume,
              change,
            };
          });

          setTokens(formattedTokens);
          setIsLoading(false);
        } catch (err) {
          console.error("Error processing WebSocket data:", err);
          setError("Error processing WebSocket data.");
        }
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup WebSocket connection on component unmount
    return cleanupWebSocket;
  }, []);

  const renderToken = ({ item }: { item: PerpTokenData }) => (
    <View style={styles.tokenRow}>
      <Text style={styles.tokenName}>{item.name}</Text>
      <Text style={styles.tokenDetails}>
        Price: {item.price.toFixed(2)} | Volume: {item.volume.toFixed(2)}
      </Text>
      <Text
        style={[
          styles.tokenChange,
          item.change >= 0 ? styles.positiveChange : styles.negativeChange,
        ]}
      >
        24h Change: {item.change.toFixed(2)}%
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading perpetual markets...</Text>
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
      <Text style={styles.title}>Perpetual Token Information</Text>
      <FlatList
        data={tokens}
        keyExtractor={(item) => item.name}
        renderItem={renderToken}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  tokenRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tokenName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  tokenDetails: {
    fontSize: 14,
    color: "#555",
  },
  tokenChange: {
    fontSize: 14,
    fontWeight: "bold",
  },
  positiveChange: {
    color: "green",
  },
  negativeChange: {
    color: "red",
  },
  errorText: {
    color: "red",
    textAlign: "center",
  },
});

export default InfoPage;
