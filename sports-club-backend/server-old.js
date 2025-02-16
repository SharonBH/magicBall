const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;
app.use(cors());

const financialData = [];
const expenseBreakdown = [];

// Load Financial Data from CSV
fs.createReadStream('sports_club_financials.csv')
  .pipe(csvParser())
  .on('data', (row) => financialData.push(row))
  .on('end', () => console.log('Financial Data Loaded'));

// Load Expense Breakdown Data from CSV
fs.createReadStream('expense_breakdown.csv')
  .pipe(csvParser())
  .on('data', (row) => expenseBreakdown.push(row))
  .on('end', () => console.log('Expense Breakdown Data Loaded'));

// API Endpoints
app.get('/api/financials', (req, res) => {
  res.json(financialData);
});

app.get('/api/expenses', (req, res) => {
  res.json(expenseBreakdown);
});

app.get('/api/predicted-end-season', (req, res) => {
  const position = parseInt(req.query.position);
  if (!position || position < 1 || position > 20) {
    return res.status(400).json({ error: 'Invalid club position' });
  }

  const baseExpense = 40000000;
  const bonusMultiplier = 1 + ((21 - position) * 0.02);
  const predictedExpense = baseExpense * bonusMultiplier;

  res.json({ position, predictedExpense });
});

app.get('/api/predicted-expenses', (req, res) => {
  const position = parseInt(req.query.position);
  if (!position || position < 1 || position > 20) {
    return res.status(400).json({ error: 'Invalid club position' });
  }

  const baseExpense = 40000000;
  const bonusMultiplier = 1 + ((21 - position) * 0.02);
  const predictedExpense = baseExpense * bonusMultiplier;

  res.json({ position, predictedExpense });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
