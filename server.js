const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Шифрование AES-256
function encryptAES(text, keyHex) {
    const key = Buffer.from(keyHex, 'hex');
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
        encrypted: encrypted,
        iv: iv.toString('hex'),
        key: keyHex,
        algorithm: 'AES-256-CBC'
    };
}

// Расшифрование
function decryptAES(encryptedHex, keyHex, ivHex) {
    try {
        const key = Buffer.from(keyHex, 'hex');
        const iv = Buffer.from(ivHex, 'hex');
        
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return {
            decrypted: decrypted,
            success: true
        };
    } catch (error) {
        return {
            decrypted: null,
            success: false,
            error: 'Wrong key or corrupted data'
        };
    }
}

// 1. Генерация ключа
app.get('/api/generate-key', (req, res) => {
    const key = crypto.randomBytes(32).toString('hex');
    res.json({ 
        key: key,
        keyLength: '256-bit'
    });
});

// 2. Шифрование
app.post('/api/encrypt', (req, res) => {
    const { text, key } = req.body;
    
    if (!text || !key) {
        return res.status(400).json({ error: 'Need text and key' });
    }
    
    if (key.length !== 64) {
        return res.status(400).json({ error: 'Key must be 64 hex characters' });
    }
    
    try {
        const result = encryptAES(text, key);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Encryption failed' });
    }
});

// 3. Расшифрование
app.post('/api/decrypt', (req, res) => {
    const { encrypted, key, iv } = req.body;
    
    if (!encrypted || !key || !iv) {
        return res.status(400).json({ error: 'Need all data' });
    }
    
    try {
        const result = decryptAES(encrypted, key, iv);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Decryption failed' });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('');
    console.log('    ╔═══════════════════════════════════════╗');
    console.log('    ║   🔐 AES CRYPTO SYSTEM АКТИВЕН!      ║');
    console.log('    ║   🌐 Открой в браузере:              ║');
    console.log('    ║   🔗 http://localhost:' + PORT + '         ║');
    console.log('    ╚═══════════════════════════════════════╝');
    console.log('');
});