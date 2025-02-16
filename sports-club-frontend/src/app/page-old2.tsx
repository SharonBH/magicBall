"use client";

import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function FinancialDashboard() {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState([]);
  const [totalIncome, setTotalIncome] = useState(null);
  const [position, setPosition] = useState(6);
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

  const fixedExpenses = monthlyExpenses.filter(e => e.Category === "Fixed").reduce((sum, e) => sum + parseFloat(e.Amount), 0);
  const variableExpenses = predictedFinancials?.predictedExpense || monthlyExpenses.filter(e => e.Category === "Variable").reduce((sum, e) => sum + parseFloat(e.Amount), 0);
  
  const fixedRevenues = monthlyRevenues.filter(r => r.Category === "Fixed").reduce((sum, r) => sum + parseFloat(r.Amount), 0);
  const variableRevenues = predictedFinancials?.predictedRevenue || monthlyRevenues.filter(r => r.Category === "Variable").reduce((sum, r) => sum + parseFloat(r.Amount), 0);

  const predictedTotalIncome = (predictedFinancials?.predictedRevenue || fixedRevenues + variableRevenues) - (predictedFinancials?.predictedExpense || fixedExpenses + variableExpenses);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <div className="col-span-2 bg-slate-700 p-6 rounded-lg shadow flex justify-around">
        <h2 className="text-2xl w-full">Sport Club Season overview</h2>
        <h2 className="text-sm font-bold w-20">Finishing Position</h2>
        <input
          type="number"
          value={position}
          min="1"
          max="20"
          onChange={(e) => setPosition(e.target.value)}
          className="border p-2 rounded mb-4 text-black"
        />
      </div>
      <div className="bg-slate-500 p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold">Total Income: ${totalIncome?.totalIncome?.toLocaleString()}</h2>
      </div>
      <div className="bg-slate-400 p-4 rounded-lg shadow">
      <h2 className="text-2xl font-bold">Predicted Total Income: ${predictedTotalIncome.toLocaleString()}</h2>
      </div>
      <div className="bg-red-400 p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Variable Expenses</h2>
        <p className="text-2xl font-bold text-center">${variableExpenses.toLocaleString()}</p>
      </div>

      <div className="bg-green-600 p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">Variable Revenues</h2>
        <p className="text-2xl font-bold text-center">${variableRevenues.toLocaleString()}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-red-600">Expenses Breakdown</h2>
        <Pie
          data={{
            labels: ["Fixed", "Variable"],
            datasets: [
              {
                data: [fixedExpenses, variableExpenses],
                backgroundColor: ["#36A2EB", "#FF6384"],
              },
            ],
          }}
        />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold text-green-600">Revenue Breakdown</h2>
        <Pie
          data={{
            labels: ["Fixed", "Variable"],
            datasets: [
              {
                data: [fixedRevenues, variableRevenues],
                backgroundColor: ["#FFCE56", "#4CAF50"],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
