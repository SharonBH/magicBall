"use client";

import React, { useEffect, useState } from "react";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancialDashboard() {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState([]);
  const [totalIncome, setTotalIncome] = useState(null);
  const [position, setPosition] = useState(1);
  const [predictedFinancials, setPredictedFinancials] = useState(null);
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
    axios.get(apibase+`/api/predicted-financials?position=${position}`).then((response) => {
      setPredictedFinancials(response.data);
    });
  }, [position]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="col-span-2 bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">Total Income: ${totalIncome?.totalIncome?.toLocaleString()}</h2>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Expenses Breakdown</h2>
        <Pie
          data={{
            labels: ["Fixed", "Variable"],
            datasets: [
              {
                data: [
                  monthlyExpenses.filter(e => e.Category === "Fixed").reduce((sum, e) => sum + parseFloat(e.Amount), 0),
                  monthlyExpenses.filter(e => e.Category === "Variable").reduce((sum, e) => sum + parseFloat(e.Amount), 0),
                ],
                backgroundColor: ["#FF6384", "#36A2EB"],
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Revenue Breakdown</h2>
        <Pie
          data={{
            labels: ["Fixed", "Variable"],
            datasets: [
              {
                data: [
                  monthlyRevenues.filter(r => r.Category === "Fixed").reduce((sum, r) => sum + parseFloat(r.Amount), 0),
                  monthlyRevenues.filter(r => r.Category === "Variable").reduce((sum, r) => sum + parseFloat(r.Amount), 0),
                ],
                backgroundColor: ["#FFCE56", "#4CAF50"],
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow col-span-2">
        <h2 className="text-xl font-bold">Variable Expenses & Revenue by Position</h2>
        <input
          type="number"
          value={position}
          min="1"
          max="20"
          onChange={(e) => setPosition(e.target.value)}
          className="border p-2 rounded w-full mb-4"
        />
        <Line
          data={{
            labels: ["Predicted Revenue", "Predicted Expense"],
            datasets: [
              {
                label: "Predicted Amount",
                data: [
                  predictedFinancials?.predictedRevenue || 0,
                  predictedFinancials?.predictedExpense || 0,
                ],
                borderColor: "#FF5722",
                backgroundColor: "rgba(255, 87, 34, 0.5)",
                fill: true,
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
