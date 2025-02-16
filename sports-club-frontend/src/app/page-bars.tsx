"use client";

import React, { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import { motion } from "framer-motion";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function FinancialDashboard() {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState([]);
  const [totalIncome, setTotalIncome] = useState(null);
  const [position, setPosition] = useState(1);
  const [predictedFinancials, setPredictedFinancials] = useState({ variableExpenses: {}, variableRevenues: {} });
  const apibase = "http://localhost:5000";
  useEffect(() => {
    axios.get(apibase+"/api/monthly-expenses").then((response) => {
      setMonthlyExpenses(response.data);
    });

    axios.get(apibase+"/api/monthly-revenues").then((response) => {
      setMonthlyRevenues(response.data);
    });

    axios.get(apibase+"/api/total-income").then((response) => {
      setTotalIncome(response.data);
    });
  }, []);

  useEffect(() => {
    axios.get(apibase+`/api/predicted-variable-financials?position=${position}`).then((response) => {
      setPredictedFinancials(response.data);
    });
  }, [position]);

  const variableExpenseTypes = [...new Set(monthlyExpenses.filter(e => e.Category === "Variable").map(e => e.Type))];
  const currentVariableExpenses = variableExpenseTypes.map(type => 
    monthlyExpenses.filter(e => e.Type === type).reduce((sum, e) => sum + parseFloat(e.Amount), 0)
  );
  const predictedVariableExpenses = variableExpenseTypes.map(type => 
    predictedFinancials.variableExpenses?.[type] ?? 0
  );

  const variableRevenueTypes = [...new Set(monthlyRevenues.filter(r => r.Category === "Variable").map(r => r.Type))];
  const currentVariableRevenues = variableRevenueTypes.map(type => 
    monthlyRevenues.filter(r => r.Type === type).reduce((sum, r) => sum + parseFloat(r.Amount), 0)
  );
  const predictedVariableRevenues = variableRevenueTypes.map(type => 
    predictedFinancials.variableRevenues?.[type] ?? 0
  );

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="col-span-2 bg-gray-100 p-6 rounded-lg shadow flex justify-around">
        <motion.h2 
          className="text-2xl font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5 }}
        >
          Total Income: ${totalIncome?.totalIncome?.toLocaleString()}
        </motion.h2>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Variable Expenses</h2>
        <Bar
          data={{
            labels: variableExpenseTypes,
            datasets: [
              {
                label: "Current",
                data: currentVariableExpenses,
                backgroundColor: "#FF6384",
              },
              {
                label: "Predicted",
                data: predictedVariableExpenses,
                backgroundColor: "#FFCE56",
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Variable Revenues</h2>
        <Bar
          data={{
            labels: variableRevenueTypes,
            datasets: [
              {
                label: "Current",
                data: currentVariableRevenues,
                backgroundColor: "#36A2EB",
              },
              {
                label: "Predicted",
                data: predictedVariableRevenues,
                backgroundColor: "#4CAF50",
              },
            ],
          }}
        />
      </div>
      
      <div className="col-span-2 bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Select Finishing Position</h2>
        <input
          type="number"
          value={position}
          min="1"
          max="20"
          onChange={(e) => setPosition(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
      </div>
    </div>
  );
}