const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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


const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Всі поля обовʼязкові!' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує!' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({ email, username, passwordHash });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, 'SECRET_KEY', { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'Користувача створено!',
            token,
            user: { id: newUser._id, email: newUser.email, username: newUser.username }
        });

    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Всі поля обовʼязкові!' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Користувача не знайдено' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Невірний пароль' }); 
        }

        const token = jwt.sign({ id: user._id }, 'SECRET_KEY', { expiresIn: '7d' });

        res.status(200).json({ 
            message: 'Успішний вхід!',
            token,
            user: { id: user._id, email: user.email, username: user.username }
        });

    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Немає токена' });
    }

    try {
        const decoded = jwt.verify(token, 'SECRET_KEY');
        req.userId = decoded.id;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Невірний токен' });
    }
};

app.get('/api/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});


const nodemailer = require('nodemailer');

// 👉 для відправки email (тестова SMTP-пошта)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nazarmn2008@gmail.com',       // ❗️твій email
        pass: 'hgwo vvsi tipt gldm '            // ❗️пароль застосунку (не твій email-пароль!)
    }
});

// 👉 magic-link endpoint
app.post('/api/magic-link', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        const token = jwt.sign({ id: user._id }, 'SECRET_KEY', { expiresIn: '15m' });

        const link = `http://localhost:5173/magic-login?token=${token}`; // 🔁 зміни на свій фронтенд URL

        await transporter.sendMail({
            from: 'TypeSpeed <yourEmail@gmail.com>',
            to: email,
            subject: 'Magic Link для входу',
            html: `<p>Натисни на посилання для входу без пароля:</p>
                   <a href="${link}">Увійти</a><br><small>Лінк дійсний 15 хв</small>`
        });

        res.status(200).json({ message: 'Magic link відправлено на email' });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});



app.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World!' });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
