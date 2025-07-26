const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://root:9ZxY2VeU0Eqp6Hxl@cluster0.mjxa3iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

app.use(cors());
app.use(express.json());


const textSchema = new mongoose.Schema({
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const TextModel = mongoose.model('Text', textSchema);

app.post('/api/texts', async (req, res) => {
    const { text } = req.body;
    const newText = new TextModel({ text });
    try {
        await newText.save();
        res.status(201).json(newText); 
    } catch (error) {
        res.status(500).json({ message: 'Error saving text', error: error.message });
    }
});


app.get('/api/random-text', async (req, res) => {
    try {
        const count = await TextModel.countDocuments();
        const random = Math.floor(Math.random() * count);
        const randomText = await TextModel.findOne().skip(random);
        if (!randomText) {
            return res.status(404).json({ message: 'No text found' });
        }
        res.status(200).json(randomText);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching random text', error: error.message });
    }
});


app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
