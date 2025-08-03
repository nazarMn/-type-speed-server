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
mongoose.connect('mongodb+srv://root:9ZxY2VeU0Eqp6Hxl@cluster0.mjxa3iv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(function () {
    console.log('Connected to MongoDB');
}).catch(function (err) {
    console.error('MongoDB connection error:', err);
});
app.use(cors());
app.use(express.json());
var textSchema = new mongoose.Schema({
    text: { type: String, required: true },
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
    var count, random, randomText, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, TextModel.countDocuments()];
            case 1:
                count = _a.sent();
                random = Math.floor(Math.random() * count);
                return [4 /*yield*/, TextModel.findOne().skip(random)];
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
    date: { type: Date, default: Date.now }
});
var User = mongoose.model('User', userSchema);
app.post('/api/register', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var _a, email, username, password, existingUser, salt, passwordHash, newUser, token, error_3;
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
                newUser = new User({ email: email, username: username, passwordHash: passwordHash });
                return [4 /*yield*/, newUser.save()];
            case 5:
                _b.sent();
                token = jwt.sign({ id: newUser._id }, 'SECRET_KEY', { expiresIn: '7d' });
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
                token = jwt.sign({ id: user._id }, 'SECRET_KEY', { expiresIn: '7d' });
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
    var _a;
    var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Немає токена' });
    }
    try {
        var decoded = jwt.verify(token, 'SECRET_KEY');
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Невірний токен' });
    }
};
app.get('/api/me', authMiddleware, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
    var user, error_5;
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
                res.json(user);
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                res.status(500).json({ message: 'Помилка сервера', error: error_5.message });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
app.get('/', function (req, res) {
    res.status(200).json({ message: 'Hello World!' });
});
app.listen(3000, function () {
    console.log('Server is running on http://localhost:3000');
});
