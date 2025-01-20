import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import tokenMapping from "@/assets/spottoken.json";
import WebSocketManager from "@/api/WebSocketManager";
import { useRouter } from "expo-router";

interface SpotTokenData {
  id: string; // Identifier (e.g., "PURR/USDC")
  name: string; // Mapped name (e.g., "PURR")
  price: number;
  volume: number;
  change: number; // 24-hour change percentage
}

const SpotInfoPage: React.FC = () => {
  const [tokens, setTokens] = useState<SpotTokenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleNavigateToDetails = (id: string) => {
    const encodedId = encodeURIComponent(id); // Encode the ID (e.g., "PURR/USDC" -> "PURR%2FUSDC")
    router.push(`/details/${encodedId}`); // Use encoded ID in the route
  };

  useEffect(() => {
    const wsManager = WebSocketManager.getInstance();

    const listener = (data: any) => {
      try {
        const { spotAssetCtxs } = data;

        if (!spotAssetCtxs || !Array.isArray(spotAssetCtxs)) {
          console.error("Invalid spotAssetCtxs format in WebSocket data.");
          return;
        }

        const formattedTokens = spotAssetCtxs.map((ctx: any) => {
          const { coin, markPx, dayBaseVlm, prevDayPx } = ctx;

          const id = coin; // Use the original identifier (e.g., "PURR/USDC")
          const name = tokenMapping[coin] || coin; // Map the display name (e.g., "PURR")
          const price = markPx !== undefined ? parseFloat(markPx) : 0;
          const volume = dayBaseVlm !== undefined ? parseFloat(dayBaseVlm) : 0;
          const prevPrice = prevDayPx !== undefined ? parseFloat(prevDayPx) : 0;

          const change = prevPrice > 0 ? ((price - prevPrice) / prevPrice) * 100 : 0;

          return {
            id, // Original identifier for routing
            name, // Mapped name for display
            price,
            volume,
            change,
          };
        });

        setTokens(formattedTokens);
        setIsLoading(false);
      } catch (err) {
        console.error("Error processing WebSocket data:", err);
      }
    };

    wsManager.addListener("webData2", listener);

    return () => {
      wsManager.removeListener("webData2", listener);
    };
  }, []);

  const RenderToken = React.memo(({ item, onPress }: { item: SpotTokenData; onPress: (id: string) => void }) => (
    <TouchableOpacity onPress={() => onPress(item.id)}>
      <View style={styles.tokenRow}>
        <View style={styles.tokenColumn}>
          <Text style={styles.tokenName}>{item.name}</Text>
          <Text style={styles.tokenVolume}>{item.volume.toFixed(2)} Vol</Text>
        </View>
        <View style={styles.priceColumn}>
          <Text style={styles.tokenPrice}>{item.price}</Text>
        </View>
        <View style={styles.changeColumn}>
          <Text
            style={[
              styles.tokenChange,
              item.change >= 0 ? styles.positiveChange : styles.negativeChange,
            ]}
          >
            {item.change.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ));

  const renderToken = ({ item }: { item: SpotTokenData }) => (
    <RenderToken item={item} onPress={handleNavigateToDetails} />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading spot tokens...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.nameColumn]}>Name / Vol</Text>
        <Text style={[styles.headerText, styles.priceColumn]}>Last Price</Text>
        <Text style={[styles.headerText, styles.changeColumn]}>24h Chg%</Text>
      </View>
      <FlatList
        data={tokens}
        keyExtractor={(item) => item.id}
        renderItem={renderToken}
        initialNumToRender={10} // Renders the first 10 items initially
        getItemLayout={(data, index) => ({
          length: 60, // Estimated row height
          offset: 60 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: "#000",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginBottom: 5,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#aaa",
  },
  nameColumn: {
    flex: 2,
    textAlign: "left",
  },
  priceColumn: {
    flex: 1,
    textAlign: "center",
  },
  changeColumn: {
    flex: 1,
    textAlign: "right",
  },
  tokenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  tokenColumn: {
    flex: 2,
  },
  tokenName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  tokenVolume: {
    fontSize: 12,
    color: "#888",
  },
  tokenPrice: {
    fontSize: 14,
    color: "#fff",
    textAlign: "center",
  },
  tokenChange: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  positiveChange: {
    color: "green",
  },
  negativeChange: {
    color: "red",
  },
  loadingText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});

export default SpotInfoPage;
