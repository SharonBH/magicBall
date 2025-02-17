const express = require('express');
const fs = require('fs');
const csvParser = require('csv-parser');
const cors = require('cors');
const moment = require('moment');

const app = express();
const port = process.env.PORT || 10000;
app.use(cors());

let monthlyExpenses = [];
let monthlyRevenues = [];

// Load Monthly Expenses Data
fs.createReadStream('monthly_expenses_updated.csv')
  .pipe(csvParser())
  .on('data', (row) => monthlyExpenses.push(row))
  .on('end', () => console.log('Monthly Expenses Data Loaded'));

// Load Monthly Revenues Data
fs.createReadStream('monthly_revenues_updated.csv')
  .pipe(csvParser())
  .on('data', (row) => monthlyRevenues.push(row))
  .on('end', () => console.log('Monthly Revenues Data Loaded'));

// Helper function to get the current season start date
function getCurrentSeasonStart() {
  const today = moment();
  const currentYear = today.year();
  const seasonStartYear = today.month() >= 6 ? currentYear : currentYear - 1;
  return moment(`${seasonStartYear}-07-01`, 'YYYY-MM-DD');
}

// Helper function to get remaining months of the season
function getRemainingMonths() {
  const today = moment();
  const seasonEnd = moment().year(today.year()).month(5).endOf('month'); // End of June
  return monthlyExpenses.filter(entry => moment(entry.Month, 'YYYY-MM').isSameOrAfter(today) && moment(entry.Month, 'YYYY-MM').isSameOrBefore(seasonEnd));
}

// API Endpoint for healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Endpoint to fetch Monthly Expenses for current season
app.get('/api/monthly-expenses', (req, res) => {
  const seasonStart = getCurrentSeasonStart();
  const filteredExpenses = monthlyExpenses.filter(entry => 
    moment(entry.Month, 'YYYY-MM').isSameOrAfter(seasonStart)
  );
  res.json(filteredExpenses);
});

// API Endpoint to fetch Monthly Revenues for current season
app.get('/api/monthly-revenues', (req, res) => {
  const seasonStart = getCurrentSeasonStart();
  const filteredRevenues = monthlyRevenues.filter(entry => 
    moment(entry.Month, 'YYYY-MM').isSameOrAfter(seasonStart)
  );
  res.json(filteredRevenues);
});

// API Endpoint to predict expenses and revenues based on finishing position
app.get('/api/predicted-variable-financials', (req, res) => {
  const position = parseInt(req.query.position);
  if (!position || position < 1 || position > 20) {
    return res.status(400).json({ error: 'Invalid club position' });
  }

  const seasonStart = getCurrentSeasonStart();
  const seasonEnd = moment(seasonStart).add(1, 'year').subtract(1, 'day'); // June 30th

  let variableExpenses = {};
  let variableRevenues = {};
  let fixedExpenses = {};
  let fixedRevenues = {};
  let totalVariableExpenses = 0;
  let totalVariableRevenues = 0;

  // Process Fixed Expenses (All months in the current season)
  monthlyExpenses.forEach(entry => {
    if (moment(entry.Month, 'YYYY-MM').isBetween(seasonStart, seasonEnd, null, '[]')) {
      if (entry.Category === 'Fixed') {
        if (!fixedExpenses[entry.Type]) {
          fixedExpenses[entry.Type] = 0;
        }
        fixedExpenses[entry.Type] += parseFloat(entry.Amount);
      }
    }
  });

  // Process Fixed Revenues (All months in the current season)
  monthlyRevenues.forEach(entry => {
    if (moment(entry.Month, 'YYYY-MM').isBetween(seasonStart, seasonEnd, null, '[]')) {
      if (entry.Category === 'Fixed') {
        if (!fixedRevenues[entry.Type]) {
          fixedRevenues[entry.Type] = 0;
        }
        fixedRevenues[entry.Type] += parseFloat(entry.Amount);
      }
    }
  });

  // Process Variable Expenses (Only for remaining months in the season)
  monthlyExpenses.forEach(entry => {
    if (moment(entry.Month, 'YYYY-MM').isSameOrAfter(moment(), 'month')) {
      if (entry.Category === 'Variable') {
        if (!variableExpenses[entry.Type]) {
          variableExpenses[entry.Type] = 0;
        }
        variableExpenses[entry.Type] += parseFloat(entry.Amount);
        totalVariableExpenses += parseFloat(entry.Amount);
      }
    }
  });

  // Process Variable Revenues (Only for remaining months in the season)
  monthlyRevenues.forEach(entry => {
    if (moment(entry.Month, 'YYYY-MM').isSameOrAfter(moment(), 'month')) {
      if (entry.Category === 'Variable') {
        if (!variableRevenues[entry.Type]) {
          variableRevenues[entry.Type] = 0;
        }
        variableRevenues[entry.Type] += parseFloat(entry.Amount);
        totalVariableRevenues += parseFloat(entry.Amount);
      }
    }
  });

  // Apply position-based multiplier only to variable expenses and revenues
  const multiplier = 1 + ((21 - position) * 0.03);
  Object.keys(variableExpenses).forEach(key => {
    variableExpenses[key] *= multiplier;
  });
  Object.keys(variableRevenues).forEach(key => {
    variableRevenues[key] *= multiplier;
  });

  totalVariableExpenses *= multiplier;
  totalVariableRevenues *= multiplier;
  
  const totalIncome = (totalVariableRevenues + Object.values(fixedRevenues).reduce((a, b) => a + b, 0)) - (totalVariableExpenses + Object.values(fixedExpenses).reduce((a, b) => a + b, 0));

  res.json({
    position,
    variableExpenses,
    variableRevenues,
    fixedExpenses,
    fixedRevenues,
    totalVariableExpenses,
    totalVariableRevenues,
    totalIncome
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
