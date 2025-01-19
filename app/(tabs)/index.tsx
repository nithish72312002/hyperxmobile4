import React from "react";
import { View, StyleSheet } from "react-native";
import CandleChart from "@/components/CandleChart"; // Adjust the path accordingly
import OrderBook from "@/components/HelloWave";
import OrderBookMarket from "@/components/OrderBookMarket";
import LightweightChart from "@/components/lightweightchart";
import CandleChartWithRangeSwitcher from "@/components/lightweightchart";
import DummyTradingViewChart from "@/components/lightweightchart";

const HomeScreen = () => {
  return (
    <View style={styles.container}>
              <DummyTradingViewChart />

    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
