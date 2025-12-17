// AES Frontend System
class AESCryptoSystem {
    constructor() {
        this.baseURL = 'http://192.168.8.133:3000';
        this.init();
    }
    
    init() {
        // Привязка кнопок
        document.getElementById('encryptBtn').addEventListener('click', () => this.encrypt());
        document.getElementById('decryptBtn').addEventListener('click', () => this.decrypt());
        document.getElementById('genKeyBtn').addEventListener('click', () => this.generateKey());
        document.getElementById('genKey').addEventListener('click', () => this.generateKey());
        document.getElementById('copyKey').addEventListener('click', () => this.copyKey());
        
        this.updateStatus('System Ready', 'success');
    }
    
    async generateKey() {
        this.updateStatus('Generating 256-bit key...', 'processing');
        
        try {
            const response = await fetch(`${this.baseURL}/api/generate-key`);
            if (!response.ok) throw new Error('Server error');
            
            const data = await response.json();
            document.getElementById('aesKey').value = data.key;
            this.updateStatus('✓ Key generated!', 'success');
            
        } catch (error) {
            this.updateStatus('✗ Server not responding', 'error');
            // Запасной вариант - генерируем ключ локально
            const fallbackKey = this.generateFallbackKey();
            document.getElementById('aesKey').value = fallbackKey;
            this.updateStatus('✓ Local key generated', 'warning');
        }
    }
    
    generateFallbackKey() {
        // Локальная генерация ключа если сервер не работает
        let key = '';
        const chars = '0123456789abcdef';
        for (let i = 0; i < 64; i++) {
            key += chars[Math.floor(Math.random() * 16)];
        }
        return key;
    }
    
    async encrypt() {
        const text = document.getElementById('inputText').value;
        const key = document.getElementById('aesKey').value;
        
        if (!text.trim()) {
            this.updateStatus('Enter text to encrypt', 'warning');
            return;
        }
        
        if (!key || key.length !== 64) {
            this.updateStatus('Key must be 64 hex characters', 'error');
            return;
        }
        
        this.updateStatus('Encrypting with AES-256...', 'processing');
        
        try {
            const response = await fetch(`${this.baseURL}/api/encrypt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, key })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                document.getElementById('encryptedOutput').textContent = result.encrypted;
                document.getElementById('ivOutput').textContent = result.iv;
                this.updateStatus('✓ Encryption successful!', 'success');
            } else {
                this.updateStatus('✗ ' + result.error, 'error');
            }
        } catch (error) {
            this.updateStatus('✗ Network error', 'error');
        }
    }
    
    copyKey() {
        const keyInput = document.getElementById('aesKey');
        keyInput.select();
        document.execCommand('copy');
        this.updateStatus('✓ Key copied to clipboard', 'success');
    }
    
    updateStatus(message, type) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = message;
        
        // Цвет точки
        if (type === 'success') {
            statusDot.style.background = '#00ff00';
            statusText.style.color = '#00ff00';
        } else if (type === 'error') {
            statusDot.style.background = '#ff0000';
            statusText.style.color = '#ff0000';
        } else if (type === 'warning') {
            statusDot.style.background = '#ffff00';
            statusText.style.color = '#ffff00';
        } else if (type === 'processing') {
            statusDot.style.background = '#00a2ff';
            statusText.style.color = '#00a2ff';
        }
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.aesSystem = new AESCryptoSystem();
});