import React, { useEffect, useState } from "react";
import { StyleSheet, View, Dimensions, ActivityIndicator,  } from "react-native";
import {Picker} from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";

const CandleChart = () => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [interval, setInterval] = useState("15m"); // Default interval

  // Helper function to calculate startTime dynamically
  const calculateStartTime = (interval) => {
    const now = Date.now();
    const intervals = {
      "1m": 200 * 1 * 60 * 1000,
      "5m": 200 * 5 * 60 * 1000,
      "15m": 200 * 15 * 60 * 1000,
      "1h": 200 * 60 * 60 * 1000,
      "4h": 200 * 4 * 60 * 60 * 1000,
      "1d": 200 * 24 * 60 * 60 * 1000,
      "2d": 200 * 2 * 24 * 60 * 60 * 1000,
    };

    return now - (intervals[interval] || intervals["15m"]); // Default to 15m
  };

  const fetchChartData = async () => {
    try {
      setIsLoading(true);
      const startTime = calculateStartTime(interval);
      const response = await axios.post("https://api.hyperliquid.xyz/info", {
        type: "candleSnapshot",
        req: {
          coin: "BTC",
          interval,
          startTime,
          endTime: Date.now(),
        },
      });

      const data = response.data.map((item) => parseFloat(item.c)); // Closing prices
      setChartData(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [interval]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={interval}
        style={styles.picker}
        onValueChange={(itemValue) => setInterval(itemValue)}
      >
        <Picker.Item label="1 Minute" value="1m" />
        <Picker.Item label="5 Minutes" value="5m" />
        <Picker.Item label="15 Minutes" value="15m" />
        <Picker.Item label="1 Hour" value="1h" />
        <Picker.Item label="4 Hours" value="4h" />
        <Picker.Item label="1 Day" value="1d" />
        <Picker.Item label="2 Days" value="2d" />
      </Picker>
      <LineChart
        data={{
          labels: Array.from({ length: chartData.length }, (_, i) => `${i}`), // Simple labels
          datasets: [{ data: chartData }],
        }}
        width={Dimensions.get("window").width - 16}
        height={250}
        yAxisLabel="$"
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: "#000",
          backgroundGradientFrom: "#1E2923",
          backgroundGradientTo: "#08130D",
          color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default CandleChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  picker: {
    height: 50,
    width: "80%",
    color: "#FFF",
    backgroundColor: "#333",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
});
