require('dotenv').config();
const multer = require('multer');
const upload = multer({ dest: './public/uploads/' }); // Папка для загрузки файлов
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const app = express();

const cors = require('cors');
app.use(cors());
app.use('/uploads', express.static('./public/uploads'));

app.use(express.json());
const secretKey = process.env.SECRET_KEY;


// Создание подключения к базе данных
const db = new sqlite3.Database('./auth.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
});


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS images (
                                                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                  url TEXT NOT NULL,
                                                  title TEXT NOT NULL,
                                                  user_id INTEGER NOT NULL,
                                                  upload_date TEXT NOT NULL,
                                                  theme TEXT NOT NULL,
                                                  likes INTEGER DEFAULT 0,
                                                  dislikes INTEGER DEFAULT 0,
                                                  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )`);
});



function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Извлекаем токен из заголовка

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = decoded; // Добавляем информацию о пользователе в req.user
        next();
    });
}

function authenticateAdminToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        // Поиск администратора в таблице admins
        const adminId = decoded.id;
        db.get('SELECT * FROM admins WHERE id = ?', [adminId], (err, admin) => {
            if (err || !admin) {
                return res.status(403).json({ error: 'Admin not found' });
            }

            req.admin = admin;  // Добавляем администратора в запрос
            next();
        });
    });
}




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

    // Проверяем сначала таблицу админов
    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, adminRow) => {
        if (adminRow) {
            // Если нашли администратора, проверяем пароль
            const isPasswordValid = await bcrypt.compare(password, adminRow.password);
            if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password for admin' });
            console.log('я сделал админа');

            // Генерация токена для администратора
            const token = jwt.sign({ id: adminRow.id, username: adminRow.username }, secretKey, { expiresIn: '1h' });
            return res.json({ token, role: 'admin' });  // Отправляем информацию о том, что это админ
        }

        // Если не нашли администратора, проверяем таблицу пользователей
        db.get('SELECT * FROM users WHERE username = ?', [username], async (err, userRow) => {
            if (!userRow) return res.status(400).json({ error: 'User not found' });

            const isPasswordValid = await bcrypt.compare(password, userRow.password);
            if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password for user' });
            console.log('я сделал юзера');

            // Генерация токена для пользователя
            const token = jwt.sign({ id: userRow.id, username: userRow.username }, secretKey, { expiresIn: '1h' });
            return res.json({ token, role: 'user' });  // Отправляем информацию о том, что это пользователь
        });
    });
});

app.post('/api/admin/register', async (req, res) => {
    const { username, password } = req.body;

    if (username.length < 3 || password.length < 6) {
        return res.status(400).json({ error: 'Username must be at least 3 characters, and password must be at least 6 characters' });
    }

    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            return res.status(400).json({ error: 'Admin already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO admins (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to register admin' });
            }
            res.status(201).json({ message: 'Admin created' });
        });
    });
});

app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM admins WHERE username = ?', [username], async (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) return res.status(400).json({ error: 'Admin not found' });

        const isPasswordValid = await bcrypt.compare(password, row.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid password' });

        const token = jwt.sign({ id: row.id, username: row.username }, secretKey, { expiresIn: '1h' });
        res.json({ token });
    });
});



app.get('/api/user', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, secretKey); // Decode token
        db.get('SELECT id, username FROM users WHERE username = ?', [decoded.username], (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Database error' });
            }
            if (!row) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(row); // Respond with user details
        });
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
});


/*app.get('/api/images', (req, res) => {
    db.all(
        `SELECT images.id, images.url, images.title, images.upload_date, images.theme, images.likes, images.dislikes,
                users.username AS user
         FROM images
                  JOIN users ON images.user_id = users.id`,
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch images' });
            }
            res.json(rows);
        }
    );
});*/

app.get('/api/images', (req, res) => {
    db.all(
        `SELECT images.id, images.url, images.title, images.upload_date, images.theme, images.likes, images.dislikes,
                users.username AS user
         FROM images
                  LEFT JOIN users ON images.user_id = users.id
         WHERE images.hidden = 0`, // Исключаем скрытые изображения
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch images' });
            }
            res.json(rows);
        }
    );
});

app.get('/api/admin/images', (req, res) => {
    db.all(
        `SELECT images.id, images.url, images.title, images.upload_date, images.theme, images.likes, images.dislikes, images.hidden,
                users.username AS user
         FROM images
                  LEFT JOIN users ON images.user_id = users.id`, // Исключаем скрытые изображения
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to fetch images' });
            }
            res.json(rows);
        }
    );
});


app.put('/api/admin/images/:id/hide', (req, res) => {
    const { id } = req.params;
    const { hidden } = req.body;
    console.log('ok 1')

    db.run('UPDATE images SET hidden = ? WHERE id = ?', [hidden, id], (err) => {
        console.log('ok 2')
        if (err) {
            console.log('ok 3')
            console.error(err);
            return res.status(500).json({ error: 'Failed to update image visibility' });
        }
        console.log('ok 4')
        res.json({ message: 'Image visibility updated' });
    });
});


app.put('/api/images/:id/like', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id; // Получаем ID пользователя из токена

    db.get('SELECT * FROM user_likes WHERE user_id = ? AND image_id = ?', [userId, id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'You have already liked this image' });
        }

        // Увеличиваем счетчик лайков
        db.run('UPDATE images SET likes = likes + 1 WHERE id = ?', [id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update likes' });
            }

            // Добавляем запись в таблицу user_likes
            db.run('INSERT INTO user_likes (user_id, image_id) VALUES (?, ?)', [userId, id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to record like' });
                }

                // Если пользователь ранее дизлайкал это изображение, уменьшаем дизлайк
                db.get('SELECT * FROM user_dislikes WHERE user_id = ? AND image_id = ?', [userId, id], (err, row) => {
                    if (err) {
                        console.error(err);
                    } else if (row) {
                        db.run('DELETE FROM user_dislikes WHERE user_id = ? AND image_id = ?', [userId, id], () => {
                            db.run('UPDATE images SET dislikes = dislikes - 1 WHERE id = ?', [id]);
                        });
                    }
                });

                res.json({ message: 'Like added' });
            });
        });
    });
});

// Дизлайк изображения
app.put('/api/images/:id/dislike', authenticateToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.get('SELECT * FROM user_dislikes WHERE user_id = ? AND image_id = ?', [userId, id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'You have already disliked this image' });
        }

        // Увеличиваем счетчик дизлайков
        db.run('UPDATE images SET dislikes = dislikes + 1 WHERE id = ?', [id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update dislikes' });
            }

            // Добавляем запись в таблицу user_dislikes
            db.run('INSERT INTO user_dislikes (user_id, image_id) VALUES (?, ?)', [userId, id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to record dislike' });
                }

                // Если пользователь ранее лайкнул это изображение, уменьшаем лайк
                db.get('SELECT * FROM user_likes WHERE user_id = ? AND image_id = ?', [userId, id], (err, row) => {
                    if (err) {
                        console.error(err);
                    } else if (row) {
                        db.run('DELETE FROM user_likes WHERE user_id = ? AND image_id = ?', [userId, id], () => {
                            db.run('UPDATE images SET likes = likes - 1 WHERE id = ?', [id]);
                        });
                    }
                });

                res.json({ message: 'Dislike added' });
            });
        });
    });
});

// Дизлайк изображения
app.post('/api/user/like-image', authenticateToken, (req, res) => {
    const { image_id } = req.body;
    const userId = req.user.id; // Теперь можно безопасно обращаться к req.user.id

    db.get('SELECT * FROM user_likes WHERE user_id = ? AND image_id = ?', [userId, image_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'You have already liked this image' });
        }

        // Увеличиваем счетчик лайков
        db.run('UPDATE images SET likes = likes + 1 WHERE id = ?', [image_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update likes' });
            }

            // Добавляем запись в таблицу user_likes
            db.run('INSERT INTO user_likes (user_id, image_id) VALUES (?, ?)', [userId, image_id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to record like' });
                }

                res.json({ message: 'Like added' });
            });
        });
    });
});

// Дизлайк изображения
app.post('/api/user/dislike-image', authenticateToken, (req, res) => {
    const { image_id } = req.body;
    const userId = req.user.id;

    db.get('SELECT * FROM user_dislikes WHERE user_id = ? AND image_id = ?', [userId, image_id], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
            return res.status(400).json({ error: 'You have already disliked this image' });
        }

        // Увеличиваем счетчик дизлайков
        db.run('UPDATE images SET dislikes = dislikes + 1 WHERE id = ?', [image_id], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update dislikes' });
            }

            // Добавляем запись в таблицу user_dislikes
            db.run('INSERT INTO user_dislikes (user_id, image_id) VALUES (?, ?)', [userId, image_id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to record dislike' });
                }

                res.json({ message: 'Dislike added' });
            });
        });
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
