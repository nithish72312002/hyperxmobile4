import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const DummyTradingViewChart = () => {
  const chartHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <script src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"></script>
        <style>
          body {
            margin: 0;
            padding: 0;
          }
          #container {
            width: 100%;
            height: 100%;
          }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script>
          const container = document.getElementById('container');
          const chart = LightweightCharts.createChart(container, {
            width: window.innerWidth,
            height: window.innerHeight,
            layout: {
              backgroundColor: '#ffffff',
              textColor: '#000',
            },
            grid: {
              vertLines: { color: '#eee' },
              horzLines: { color: '#eee' },
            },
          });

          const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
          });

          // Dummy data
          const data = [
            { time: '2023-01-01', open: 100, high: 110, low: 90, close: 105 },
            { time: '2023-01-02', open: 105, high: 115, low: 95, close: 100 },
            { time: '2023-01-03', open: 100, high: 120, low: 80, close: 110 },
            { time: '2023-01-04', open: 110, high: 130, low: 100, close: 120 },
            { time: '2023-01-05', open: 120, high: 140, low: 110, close: 130 },
          ];

          candleSeries.setData(data);
          chart.timeScale().fitContent();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: chartHTML }}
        style={{ flex: 1 }}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});

export default DummyTradingViewChart;
