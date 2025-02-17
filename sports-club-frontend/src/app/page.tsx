"use client";

import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
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
import Link from 'next/link';
import axios from "axios";
// import { motion } from "framer-motion";
// import { pre } from "framer-motion/client";

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
  interface FinancialData {
    Category: string;
    Type: string;
    Amount: string;
  }

  const [monthlyExpenses, setMonthlyExpenses] = useState<FinancialData[]>([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState<FinancialData[]>([]);
  const [position, setPosition] = useState(8);
  const [predictedFinancials, setPredictedFinancials] = useState({
    variableExpenses: {} as Record<string, number>,
    variableRevenues: {} as Record<string, number>,
    fixedExpenses: {} as Record<string, number>,
    fixedRevenues: {} as Record<string, number>,
    totalVariableExpenses: 0,
    totalVariableRevenues: 0,
    totalIncome: 0,
  });
  const apibase = "https://magicball-bhwh.onrender.com";

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

  useEffect(() => {
    axios.get(apibase+"/api/monthly-expenses").then((response) => {
      setMonthlyExpenses(response.data);
    });

    axios.get(apibase+"/api/monthly-revenues").then((response) => {
      setMonthlyRevenues(response.data);
    });

  }, []);

  useEffect(() => {
    axios.get(apibase+`/api/predicted-variable-financials?position=${position}`).then((response) => {
      setPredictedFinancials(response.data);
    });
  }, [position]);

  return (
    console.log(predictedFinancials),
    <div>
    <div className="grid grid-cols-3 gap-4 p-4">
      <div className="col-span-3 bg-slate-700 p-6 rounded-lg shadow flex justify-around text-align-center">
        <h2 className="text-2xl w-full p-2">Sport Club Season overview</h2>
        <h2 className="text-sm font-bold w-60 p-3">Finishing Position</h2>
        <input
          type="number"
          value={position}
          min="1"
          max="20"
          onChange={(e) => setPosition(Number(e.target.value))}
          className="border p-2 rounded mb-4 text-black"
        />
        <Link href="/prediction" prefetch={false}>Predictions Comparison</Link> 
      </div>
      <div className="bg-blue-500 p-4 rounded-lg shadow text-center">
        <h2 className="text-xl font-bold">Predicted end season:</h2>
          <p className="text-2xl font-bold">
          {predictedFinancials.totalIncome > 0 ? (
  <span className="text-green-500">${Math.round(predictedFinancials.totalIncome).toLocaleString()}</span>
) : (
  <span className="text-red-500">${Math.round(predictedFinancials.totalIncome).toLocaleString()}</span>
)}        </p>
      </div>
      <div className="bg-red-600 p-4 rounded-lg shadow text-center">
        <h2 className="text-xl font-bold">Total Variable Expenses</h2>
        <p className="text-2xl font-bold">${Math.round(predictedFinancials.totalVariableExpenses).toLocaleString()}</p>
      </div>
      
      <div className="bg-green-500 p-4 rounded-lg shadow text-center">
        <h2 className="text-xl font-bold">Total Variable Revenues</h2>
        <p className="text-2xl font-bold">${Math.round(predictedFinancials.totalVariableRevenues).toLocaleString()}</p>
      </div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-4">
        <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold text-black">Variable Expenses</h2>
              <Bar
                data={{
                  labels: variableExpenseTypes,
                  datasets: [
                    {
                      label: "Current",
                      data: currentVariableExpenses,
                      backgroundColor: "#4CAF50",
                    },
                    {
                      label: "Predicted",
                      data: predictedVariableExpenses,
                      backgroundColor: "#ff0000",
                    },
                  ],
                }}
              />
            </div>
        <div className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-bold text-black">Variable Revenues</h2>
                    <Bar
                      data={{
                        labels: variableRevenueTypes,
                        datasets: [
                          {
                            label: "Current",
                            data: currentVariableRevenues,
                            backgroundColor: "#4CAF50",
                          },
                          {
                            label: "Predicted",
                            data: predictedVariableRevenues,
                            backgroundColor: "#36A2EB",
                          },
                        ],
                      }}
                    />
                  </div>
        <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-black">Fixed Expenses</h2>
        <Bar
          data={{
            labels: Object.keys(predictedFinancials.fixedExpenses),
            datasets: [
              {
                label: "Fixed",
                data: Object.values(predictedFinancials.fixedExpenses),
                backgroundColor: "#FF9F40",
              },
            ],
          }}
        />
      </div>
        <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-black">Fixed Revenues</h2>
        <Bar
          data={{
            labels: Object.keys(predictedFinancials.fixedRevenues),
            datasets: [
              {
                label: "Fixed",
                data: Object.values(predictedFinancials.fixedRevenues),
                backgroundColor: "#4BC0C0",
              },
            ],
          }}
        />
      </div>
</div>
</div>
  );
}
