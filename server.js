const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.use((req, res, next) => {
  const userRole = req.headers['x-user-role'];

  if (userRole) {
    req.userRole = userRole;
  }

  next();
});

mongoose.connect('mongodb://localhost:27017/TollGateData', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

const tollGateDataSchema = new mongoose.Schema({
  expressway: String,
  entry: String,
  exit: String,
  vehicle: String,
  vehicleClass: String,
  price: String,
  userId: String, 
});

const TollGateData = mongoose.model('TollGateData', tollGateDataSchema);

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.json({ success: true, message: 'Account created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/addTollGateData', async (req, res) => {
  try {
    const newData = req.body;
    const tollGateData = new TollGateData(newData);
    await tollGateData.save();
    res.json({ success: true, message: 'Data added successfully', data: tollGateData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/getAllTollGateData', async (req, res) => {
  try {
    const data = await TollGateData.find();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/updateTollGateData/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedData } = req.body;

    const result = await TollGateData.findByIdAndUpdate(id, updatedData, { new: true });

    if (!result) {
      return res.status(404).json({ success: false, message: 'Data not found for update' });
    }

    res.json({ success: true, message: 'Data updated successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/deleteTollGateData/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await TollGateData.findByIdAndDelete(id);

    res.json({ success: true, message: 'Data deleted successfully', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/getUserTollGateData', async (req, res) => {
  try {
    const userId = req.user.id; // Ensure you retrieve the user ID correctly
    const userTollGateData = await TollGateData.find({ userId });
    const adminPageData = await AdminPageData.find(); // Fetch admin page data as well
    res.json({ userTollGateData, adminPageData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Example server route to get all data
app.get('/getAllData', async (req, res) => {
  try {
    const userTollGateData = await UserTollGateData.find(); // Replace with your actual model
    const adminPageData = await AdminPageData.find(); // Replace with your actual model

    res.json({ userTollGateData, adminPageData });
  } catch (error) {
    console.error('Error fetching all data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const server = http.createServer({ maxHttpHeaderSize: 16384 }, app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
