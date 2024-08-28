const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const trousseauxRoutes = require('./routes/trousseaux');
const elementRoutes = require('./routes/element');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes de l'API
app.use('/api/users', userRoutes);
app.use('/api/trousseaux', trousseauxRoutes);
app.use('/api/elements', elementRoutes);


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
