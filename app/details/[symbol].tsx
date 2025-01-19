import React, { useEffect } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import OrderBookMarket from "@/components/OrderBookMarket";
import CandleChartWithRangeSwitcher from "@/components/lightweightchart";
import DummyTradingViewChart from "@/components/lightweightchart";

const DetailsPage: React.FC = () => {
  const { symbol } = useLocalSearchParams();
  const navigation = useNavigation();

  useEffect(() => {
    if (symbol) {
      navigation.setOptions({
        title: `${symbol.toUpperCase()} Details`,
      });
    }
  }, [symbol, navigation]);

  const renderContent = () => (
    <View>
      <View style={styles.chartContainer}>
        <DummyTradingViewChart />
      </View>
      <View style={styles.orderBookContainer}>
        <OrderBookMarket symbol={symbol || "ETH"} />
      </View>
    </View>
  );

  return (
    <FlatList
      data={[{ key: "content" }]} // Fake data to render one item (your content)
      renderItem={renderContent}
      keyExtractor={(item) => item.key}
    />
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    height: 400, // Adjust height
    marginBottom: 16,
  },
  orderBookContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
});

export default DetailsPage;
