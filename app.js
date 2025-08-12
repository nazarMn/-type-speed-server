var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var express = require('express');
var app = express();
var cors = require('cors');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var cryptos = require('crypto');
mongoose.connect('mongodb+srv://root:9ZxY2VeU0Eqp6Hxl@cluster0.mjxa3iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(function () {
    console.log('Connected to MongoDB');
})
    .catch(function (err) {
    console.error('MongoDB connection error:', err);
});
app.use(cors());
app.use(express.json());
require('dotenv').config();
var textSchema = new mongoose.Schema({
    text: { type: String, required: true },
    lang: { type: String, required: true },
    date: { type: Date, default: Date.now }
});
var TextModel = mongoose.model('Text', textSchema);
app.post('/api/texts', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var text, newText, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                text = req.body.text;
                newText = new TextModel({ text: text });
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, newText.save()];
            case 2:
                _a.sent();
                res.status(201).json(newText);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                res.status(500).json({ message: 'Error saving text', error: error_1.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.get('/api/random-text', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var lang, count, random, randomText, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                lang = req.query.lang || 'uk';
                return [4 /*yield*/, TextModel.countDocuments({ lang: lang })];
            case 1:
                count = _a.sent();
                if (count === 0) {
                    return [2 /*return*/, res.status(404).json({ message: "No text found for lang: ".concat(lang) })];
                }
                random = Math.floor(Math.random() * count);
                return [4 /*yield*/, TextModel.findOne({ lang: lang }).skip(random)];
            case 2:
                randomText = _a.sent();
                if (!randomText) {
                    return [2 /*return*/, res.status(404).json({ message: 'No text found' })];
                }
                res.status(200).json(randomText);
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                res.status(500).json({ message: 'Error fetching random text', error: error_2.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var userSchema = new mongoose.Schema({
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
var algorithm = 'aes-256-cbc';
var key = Buffer.from(process.env.ENCRYPTION_KEY);
var iv = Buffer.from(process.env.ENCRYPTION_IV);
function encrypt(text) {
    var cipher = cryptos.createCipheriv(algorithm, key, iv);
    var encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function decrypt(encryptedText) {
    var decipher = cryptos.createDecipheriv(algorithm, key, iv);
    var decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
var User = mongoose.model('User', userSchema);
app.post('/api/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, email, username, password, existingUser, salt, passwordHash, encryptedPassword, newUser, token, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, username = _a.username, password = _a.password;
                if (!email || !username || !password) {
                    return [2 /*return*/, res.status(400).json({ message: 'Всі поля обовʼязкові!' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 6, , 7]);
                return [4 /*yield*/, User.findOne({ email: email })];
            case 2:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({ message: 'Користувач з таким email вже існує!' })];
                }
                return [4 /*yield*/, bcrypt.genSalt(10)];
            case 3:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt.hash(password, salt)];
            case 4:
                passwordHash = _b.sent();
                encryptedPassword = encrypt(password);
                newUser = new User({ email: email, username: username, passwordHash: passwordHash, encryptedPassword: encryptedPassword });
                return [4 /*yield*/, newUser.save()];
            case 5:
                _b.sent();
                token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                res.status(201).json({
                    message: 'Користувача створено!',
                    token: token,
                    user: { id: newUser._id, email: newUser.email, username: newUser.username }
                });
                return [3 /*break*/, 7];
            case 6:
                error_3 = _b.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_3.message });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.post('/api/login', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, email, password, user, isPasswordValid, token, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({ message: 'Всі поля обовʼязкові!' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, User.findOne({ email: email })];
            case 2:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(400).json({ message: 'Користувача не знайдено' })];
                }
                return [4 /*yield*/, bcrypt.compare(password, user.passwordHash)];
            case 3:
                isPasswordValid = _b.sent();
                if (!isPasswordValid) {
                    return [2 /*return*/, res.status(400).json({ message: 'Невірний пароль' })];
                }
                token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
                res.status(200).json({
                    message: 'Успішний вхід!',
                    token: token,
                    user: { id: user._id, email: user.email, username: user.username }
                });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _b.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_4.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var authMiddleware = function (req, res, next) {
    try {
        var authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Немає токена" });
        }
        var token = authHeader.split(" ")[1];
        var decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        console.error("Auth error:", error);
        return res.status(401).json({ message: "Невірний токен" });
    }
};
app.get('/api/me', authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var user, decryptedPassword, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, User.findById(req.userId).select('-passwordHash')];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'Користувача не знайдено' })];
                }
                decryptedPassword = "";
                try {
                    decryptedPassword = decrypt(user.encryptedPassword);
                }
                catch (e) {
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
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.patch('/api/me', authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var username, user, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                username = req.body.username;
                if (!username) {
                    return [2 /*return*/, res.status(400).json({ message: 'Імʼя користувача обовʼязкове' })];
                }
                return [4 /*yield*/, User.findById(req.userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'Користувача не знайдено' })];
                }
                user.username = username;
                return [4 /*yield*/, user.save()];
            case 2:
                _a.sent();
                res.json({
                    message: 'Імʼя успішно оновлено',
                    username: user.username
                });
                return [3 /*break*/, 4];
            case 3:
                error_6 = _a.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_6.message });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var dailyLeaderSchema = new mongoose.Schema({
    username: { type: String, required: true },
    cpm: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    errors: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});
var DailyLeader = mongoose.model("DailyLeader", dailyLeaderSchema);
app.post('/api/me/test-result', authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, cpm, accuracy, errors, user, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, cpm = _a.cpm, accuracy = _a.accuracy, errors = _a.errors;
                if (cpm === undefined || accuracy === undefined || errors === undefined) {
                    return [2 /*return*/, res.status(400).json({ message: 'Всі поля обовʼязкові' })];
                }
                return [4 /*yield*/, User.findById(req.userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'Користувача не знайдено' })];
                }
                user.testHistory.push({ cpm: cpm, accuracy: accuracy, errors: errors });
                user.totalTests += 1;
                user.averageCPM =
                    (user.averageCPM * (user.totalTests - 1) + cpm) / user.totalTests;
                user.averageAccuracy =
                    (user.averageAccuracy * (user.totalTests - 1) + accuracy) /
                        user.totalTests;
                user.averageErrors =
                    (user.averageErrors * (user.totalTests - 1) + errors) /
                        user.totalTests;
                return [4 /*yield*/, user.save()];
            case 2:
                _b.sent();
                return [4 /*yield*/, DailyLeader.create({
                        username: user.username,
                        cpm: cpm,
                        accuracy: accuracy,
                        errors: errors,
                    })];
            case 3:
                _b.sent();
                res.status(200).json({ message: 'Результат успішно збережено' });
                return [3 /*break*/, 5];
            case 4:
                error_7 = _b.sent();
                console.error('❌ Помилка при збереженні результату:', error_7);
                res.status(500).json({ message: 'Помилка сервера' });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.delete('/api/leaders/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var id, deleted, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                if (!mongoose.Types.ObjectId.isValid(id)) {
                    return [2 /*return*/, res.status(400).json({ message: 'Невірний ID лідера' })];
                }
                return [4 /*yield*/, DailyLeader.findByIdAndDelete(id)];
            case 1:
                deleted = _a.sent();
                if (!deleted) {
                    return [2 /*return*/, res.status(404).json({ message: 'Лідер не знайдений' })];
                }
                res.status(200).json({ message: 'Лідер успішно видалений' });
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('Помилка при видаленні лідера:', error_8);
                res.status(500).json({ message: 'Помилка сервера' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get("/api/leaders/today", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var today, leaders;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                today = new Date();
                today.setHours(0, 0, 0, 0);
                return [4 /*yield*/, DailyLeader.find({
                        date: { $gte: today }
                    }).sort({ cpm: -1, accuracy: -1 }).limit(5)];
            case 1:
                leaders = _a.sent();
                res.json(leaders);
                return [2 /*return*/];
        }
    });
}); });
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nazarmn2008@gmail.com',
        pass: 'hgwo vvsi tipt gldm '
    }
});
app.post('/api/magic-link', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var email, user, token, link, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, User.findOne({ email: email })];
            case 2:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(404).json({ message: 'Користувача не знайдено' })];
                }
                token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
                link = "http://localhost:5173/magic-login?token=".concat(token);
                return [4 /*yield*/, transporter.sendMail({
                        from: 'TypeSpeed <yourEmail@gmail.com>',
                        to: email,
                        subject: 'Magic Link для входу',
                        html: "<p>\u041D\u0430\u0442\u0438\u0441\u043D\u0438 \u043D\u0430 \u043F\u043E\u0441\u0438\u043B\u0430\u043D\u043D\u044F \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0443 \u0431\u0435\u0437 \u043F\u0430\u0440\u043E\u043B\u044F:</p>\n                   <a href=\"".concat(link, "\">\u0423\u0432\u0456\u0439\u0442\u0438</a><br><small>\u041B\u0456\u043D\u043A \u0434\u0456\u0439\u0441\u043D\u0438\u0439 15 \u0445\u0432</small>")
                    })];
            case 3:
                _a.sent();
                res.status(200).json({ message: 'Magic link відправлено на email' });
                return [3 /*break*/, 5];
            case 4:
                error_9 = _a.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_9.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var resetCodes = new Map();
function generateCode(length) {
    if (length === void 0) { length = 6; }
    return Math.floor(Math.pow(10, (length - 1)) + Math.random() * 9 * Math.pow(10, (length - 1))).toString();
}
app.post('/api/send-reset-code', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var email, user, code, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                if (!email)
                    return [2 /*return*/, res.status(400).json({ message: 'Email потрібен' })];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, User.findOne({ email: email })];
            case 2:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, res.status(404).json({ message: 'Користувача не знайдено' })];
                code = generateCode(6);
                resetCodes.set(email, code);
                return [4 /*yield*/, transporter.sendMail({
                        from: 'TypeSpeed <yourEmail@gmail.com>',
                        to: email,
                        subject: 'Код підтвердження для зміни пароля',
                        html: "<p>\u0412\u0430\u0448 \u043A\u043E\u0434 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0435\u043D\u043D\u044F: <b>".concat(code, "</b></p><small>\u041A\u043E\u0434 \u0434\u0456\u0439\u0441\u043D\u0438\u0439 15 \u0445\u0432\u0438\u043B\u0438\u043D.</small>")
                    })];
            case 3:
                _a.sent();
                setTimeout(function () { return resetCodes.delete(email); }, 15 * 60 * 1000);
                res.json({ message: 'Код підтвердження відправлено на email' });
                return [3 /*break*/, 5];
            case 4:
                error_10 = _a.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_10.message });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
app.post('/api/reset-password', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, email, code, newPassword, savedCode, salt, passwordHash, encryptedPassword, error_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, code = _a.code, newPassword = _a.newPassword;
                if (!email || !code || !newPassword) {
                    return [2 /*return*/, res.status(400).json({ message: 'Відсутні необхідні дані' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 5, , 6]);
                savedCode = resetCodes.get(email);
                if (savedCode !== code) {
                    return [2 /*return*/, res.status(400).json({ message: 'Невірний код підтвердження' })];
                }
                return [4 /*yield*/, bcrypt.genSalt(10)];
            case 2:
                salt = _b.sent();
                return [4 /*yield*/, bcrypt.hash(newPassword, salt)];
            case 3:
                passwordHash = _b.sent();
                encryptedPassword = encrypt(newPassword);
                return [4 /*yield*/, User.updateOne({ email: email }, { $set: { passwordHash: passwordHash, encryptedPassword: encryptedPassword } })];
            case 4:
                _b.sent();
                resetCodes.delete(email);
                res.json({ message: 'Пароль успішно змінено' });
                return [3 /*break*/, 6];
            case 5:
                error_11 = _b.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_11.message });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) {
    res.status(200).json({ message: 'Hello World!' });
});
app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});
