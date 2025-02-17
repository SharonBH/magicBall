"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);
import ChartDataLabels from "chartjs-plugin-datalabels";
ChartJS.register(ChartDataLabels);


export default function PredictionComparisonPage() {
  const [predictions, setPredictions] = useState({});
  const apibase = "https://magicball-bhwh.onrender.com";
  const positions = [4, 8, 12];

  const chartOptions = {
    indexAxis: "y",
    plugins: {
      datalabels: {
        anchor: "center",
        align: "center",
        formatter: (value) => value.toLocaleString(),
        color: "#ffffff", // White text inside bars
        font: {
          weight: "bold",
          size: 12,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        ticks: {
          color: "#FF5733", // Change Y-axis label color (e.g., orange-red)
          font: {
            weight: "bold",
            size: 14,
          },
        },
      },
    },
  };  
  
  

  useEffect(() => {
    const fetchPredictions = async () => {
      const results = {};
      try {
        for (const pos of positions) {
          const response = await axios.get(apibase+`/api/predicted-variable-financials?position=${pos}`);
          console.log(`Fetched Position ${pos} Data:`, response.data); // Debugging
          results[pos] = response.data;
        }
        console.log("Final Processed Predictions:", results);
        setPredictions({ ...results }); // Force state update
      } catch (error) {
        console.error("Error fetching predictions:", error);
      }
    };
  
    fetchPredictions();
  }, []);
  
  
  
  const generateChartData = (type) => {
    console.log("Chart Data Input:", predictions); // Debugging
  
    // Extract all unique categories from the predictions
    const categories = new Set();
    positions.forEach((pos) => {
      const data = predictions[pos]?.[`${type}Expenses`] || {};
      Object.keys(data).forEach((key) => categories.add(key));
    });
  
    positions.forEach((pos) => {
      const data = predictions[pos]?.[`${type}Revenues`] || {};
      Object.keys(data).forEach((key) => categories.add(key));
    });
  
    const categoryList = Array.from(categories); // Convert set to an array
  
    return {
      labels: categoryList, // All unique expense/revenue categories
      datasets: positions.map((pos) => ({
        label: `Position ${pos}`,
        data: categoryList.map(
          (category) =>
            Math.round(
              predictions[pos]?.[`${type}Expenses`]?.[category] ??
              predictions[pos]?.[`${type}Revenues`]?.[category] ??
              0
            )
        ),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"][positions.indexOf(pos) % 4], // Different colors
      })),
    };
  };
  
  
  
  

  useEffect(() => {
    console.log("Updated Predictions State:", predictions);
  }, [predictions]);
  
  

  return (
    console.log("Chart Data Input:", predictions),
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Prediction Comparison</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold text-black">Variable Finances Comparison</h2>
        <Bar
          data={generateChartData("variable")}
          options={chartOptions}
        />
      </div>
      
      {/* <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Fixed Finances Comparison</h2>
        <Bar
          data={generateChartData("fixed")}
          options={{ indexAxis: "y" }}
        />
      </div> */}
    </div>
  );
}
