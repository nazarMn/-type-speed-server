const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cryptos = require('crypto');


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
require('dotenv').config();



const textSchema = new mongoose.Schema({
    text: { type: String, required: true },
    lang: { type: String, required: true },
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
        const lang = req.query.lang || 'uk';
        const count = await TextModel.countDocuments({ lang });
        if (count === 0) {
            return res.status(404).json({ message: `No text found for lang: ${lang}` });
        }
        const random = Math.floor(Math.random() * count);
        const randomText = await TextModel.findOne({ lang }).skip(random);
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
    encryptedPassword: { type: String, required: true },
    date: { type: Date, default: Date.now },

    // Нове поле - історія тестів (масив об'єктів)
    testHistory: [
      {
        cpm: Number,
        accuracy: Number,
        errors: Number,
        date: { type: Date, default: Date.now }
      }
    ],

    // Збережені середні значення за всі тести (агрегати)
    averageCPM: { type: Number, default: 0 },
    averageAccuracy: { type: Number, default: 0 },
    averageErrors: { type: Number, default: 0 },

    totalTests: { type: Number, default: 0 }
});


const algorithm = 'aes-256-cbc';
const key = Buffer.from(process.env.ENCRYPTION_KEY!);
const iv = Buffer.from(process.env.ENCRYPTION_IV!);


function encrypt(text) {
    const cipher = cryptos.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

function decrypt(encryptedText) {
    const decipher = cryptos.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


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
        const encryptedPassword = encrypt(password); // Зашифрувати пароль

        const newUser = new User({ email, username, passwordHash, encryptedPassword });
        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

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
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

        let decryptedPassword = "";
        try {
            decryptedPassword = decrypt(user.encryptedPassword);
        } catch (e) {
            console.error("Помилка розшифрування пароля:", e.message);
        }

        res.json({
      email: user.email,
      username: user.username,
      language: user.language || "uk",
      theme: user.theme || "light",
      password: decryptedPassword,
      averageCPM: user.averageCPM || 0,
      averageAccuracy: user.averageAccuracy || 0,
      averageErrors: user.averageErrors || 0,
      totalTests: user.totalTests || 0,
      testHistory: user.testHistory || []
    });
    } catch (error) {
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});

app.patch('/api/me', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Імʼя користувача обовʼязкове' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Користувача не знайдено' });
    }

    user.username = username;
    await user.save();

    res.json({
      message: 'Імʼя успішно оновлено',
      username: user.username
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});



const dailyLeaderSchema = new mongoose.Schema({
  username: { type: String, required: true },
  cpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  errors: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

const DailyLeader = mongoose.model("DailyLeader", dailyLeaderSchema);




app.post('/api/me/test-result', authMiddleware, async (req, res) => {
  try {
    const { cpm, accuracy, errors } = req.body;

    if (typeof cpm !== 'number' || typeof accuracy !== 'number' || typeof errors !== 'number') {
      return res.status(400).json({ message: 'Невірні дані тесту' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    user.testHistory.unshift({ cpm, accuracy, errors, date: new Date() });
    if (user.testHistory.length > 5) {
      user.testHistory = user.testHistory.slice(0, 5);
    }

    const oldTotal = user.totalTests || 0;
    const oldAvgCPM = user.averageCPM || 0;
    const oldAvgAccuracy = user.averageAccuracy || 0;
    const oldAvgErrors = user.averageErrors || 0;
    const newTotal = oldTotal + 1;

    user.averageCPM = (oldAvgCPM * oldTotal + cpm) / newTotal;
    user.averageAccuracy = (oldAvgAccuracy * oldTotal + accuracy) / newTotal;
    user.averageErrors = (oldAvgErrors * oldTotal + errors) / newTotal;
    user.totalTests = newTotal;

    await user.save();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newLeader = new DailyLeader({
      username: user.username,
      cpm,
      accuracy,
      errors,
      date: new Date()
    });
    await newLeader.save();

    const leadersToday = await DailyLeader.find({
      date: { $gte: today }
    }).sort({ cpm: -1, accuracy: -1 });

    if (leadersToday.length > 5) {
      const toDelete = leadersToday.slice(5); 
      const deleteIds = toDelete.map(l => l._id);
      await DailyLeader.deleteMany({ _id: { $in: deleteIds } });
    }

    res.json({
      message: 'Результат тесту збережено',
      testHistory: user.testHistory,
      averageCPM: user.averageCPM,
      averageAccuracy: user.averageAccuracy,
      averageErrors: user.averageErrors,
      totalTests: user.totalTests
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});


app.get("/api/leaders/today", async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const leaders = await DailyLeader.find({
    date: { $gte: today }
  }).sort({ cpm: -1, accuracy: -1 }).limit(5);

  res.json(leaders);
});




const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nazarmn2008@gmail.com',
        pass: 'hgwo vvsi tipt gldm '
    }
});

app.post('/api/magic-link', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Користувача не знайдено' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const link = `http://localhost:5173/magic-login?token=${token}`;

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



const resetCodes = new Map(); 

function generateCode(length = 6) {
  return Math.floor(10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)).toString();
}

app.post('/api/send-reset-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email потрібен' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });

    const code = generateCode(6);
    resetCodes.set(email, code);

    await transporter.sendMail({
      from: 'TypeSpeed <yourEmail@gmail.com>',
      to: email,
      subject: 'Код підтвердження для зміни пароля',
      html: `<p>Ваш код підтвердження: <b>${code}</b></p><small>Код дійсний 15 хвилин.</small>`
    });

    setTimeout(() => resetCodes.delete(email), 15 * 60 * 1000);

    res.json({ message: 'Код підтвердження відправлено на email' });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера', error: error.message });
  }
});

app.post('/api/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Відсутні необхідні дані' });
  }

  try {
    const savedCode = resetCodes.get(email);
    if (savedCode !== code) {
      return res.status(400).json({ message: 'Невірний код підтвердження' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    const encryptedPassword = encrypt(newPassword);

    await User.updateOne(
      { email },
      { $set: { passwordHash, encryptedPassword } }
    );

    resetCodes.delete(email);

    res.json({ message: 'Пароль успішно змінено' });
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
