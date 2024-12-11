require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const cors = require('cors');
app.use(cors());

app.use(express.json());
const secretKey = process.env.SECRET_KEY;

// Создание подключения к базе данных
const db = new sqlite3.Database('./auth.db');

// Регистрация
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (username.length < 3 || password.length < 6) {
        return res.status(400).json({ error: 'Username must be at least 3 characters, and password must be at least 6 characters' });
    }

    // Проверка, существует ли уже пользователь с таким именем
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Вставка нового пользователя в базу данных
        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to register user' });
            }
            res.status(201).json({ message: 'User created' });
        });
    });
});

// Логин
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // Поиск пользователя в базе данных
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) return res.status(400).json({ error: 'User not found' });

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, row.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' });

        // Генерация токена
        const token = jwt.sign({ username: row.username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    });
});

// Закрытие базы данных при завершении работы сервера
process.on('SIGINT', () => {
    db.close();
    console.log('Database connection closed');
    process.exit();
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
