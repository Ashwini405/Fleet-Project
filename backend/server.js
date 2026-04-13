require('dotenv').config();
const express = require('express');
const cors = require('cors');

const vehicleRoutes = require('./routes/vehicleRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vehicles', vehicleRoutes);

// Default Route
app.get('/', (req, res) => {
  res.send('Fleet Management Backend is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
