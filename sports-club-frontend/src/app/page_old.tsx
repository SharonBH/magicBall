"use client";

import React, { useEffect, useState } from "react";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [financialData, setFinancialData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [predictedExpense, setPredictedExpense] = useState(null);
  const [position, setPosition] = useState(1);

  useEffect(() => {
    axios.get("http://localhost:5000/api/financials").then((response) => {
      setFinancialData(response.data);
    });

    axios.get("http://localhost:5000/api/expenses").then((response) => {
      setExpenseData(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/predicted-expenses?position=${position}`)
      .then((response) => {
        setPredictedExpense(response.data.predictedExpense);
      });
  }, [position]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Total Revenue vs. Expenses</h2>
          <div className="h-80">
            <Line
              options={{ responsive: true, maintainAspectRatio: false }}
              data={{
                labels: financialData.map((d) => d.Season),
                datasets: [
                  {
                    label: "Total Revenue",
                    data: financialData.map((d) => parseFloat(d.Revenue)),
                    borderColor: "#36A2EB",
                    fill: false,
                  },
                  {
                    label: "Total Expenses",
                    data: financialData.map((d) => parseFloat(d.Expenses)),
                    borderColor: "#FF6384",
                    fill: false,
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Net Profit per Season</h2>
          <div className="h-80">
            <Bar
              options={{ responsive: true, maintainAspectRatio: false }}
              data={{
                labels: financialData.map((d) => d.Season),
                datasets: [
                  {
                    label: "Net Profit",
                    data: financialData.map((d) => parseFloat(d["Net Profit"])),
                    backgroundColor: "#4CAF50",
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Expense Breakdown</h2>
          <div className="h-80">
            <Pie
              options={{ responsive: true, maintainAspectRatio: false }}
              data={{
                labels: [...new Set(expenseData.map((d) => d.Category))],
                datasets: [
                  {
                    data: expenseData.map((d) => parseFloat(d.Amount)),
                    backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4CAF50", "#9966FF"],
                  },
                ],
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-xl font-bold">Predicted Expenses</h2>
          <input
            type="number"
            value={position}
            min="1"
            max="20"
            onChange={(e) => setPosition(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <p className="text-lg mt-2">Predicted Expense: ${predictedExpense?.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Card({ children }) {
  return <div className="border rounded-lg shadow p-4 bg-white">{children}</div>;
}

function CardContent({ children }) {
  return <div className="mt-2">{children}</div>;
}
