require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => {
        console.error('MongoDB bağlantı hatası:', err.message);
        process.exit(1); // Bağlantı başarısız olursa uygulamayı sonlandır
    });

// User modeli
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'İsim alanı zorunludur']
    },
    email: {
        type: String,
        required: [true, 'Email alanı zorunludur'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Şifre alanı zorunludur'],
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/register', async (req, res) => {
    try {
        console.log('Kayıt isteği alındı:', req.body);
        const { name, email, password } = req.body;

        // Email kontrolü
        const existingUser = await User.findOne({ email });
        console.log('Mevcut kullanıcı kontrolü:', existingUser);
        if (existingUser) {
            return res.status(400).json({ 
                error: 'Bu email adresi zaten kullanılıyor' 
            });
        }

        // Şifre hashleme
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Yeni kullanıcı oluşturma
        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        console.log('Yeni kullanıcı oluşturuldu:', user);
        await user.save();
        console.log('Kullanıcı kaydedildi');

        // Token oluşturma
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ 
            error: 'Kayıt işlemi sırasında bir hata oluştu' 
        });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kullanıcı kontrolü
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                error: 'Bu email adresiyle kayıtlı kullanıcı bulunamadı' 
            });
        }

        // Şifre kontrolü
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ 
                error: 'Geçersiz şifre' 
            });
        }

        // Token oluşturma
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ 
            error: 'Giriş işlemi sırasında bir hata oluştu' 
        });
    }
});

// Kullanıcı bilgilerini getirme endpoint'i
app.get('/api/user', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Geçersiz token' });
    }
});

// Tüm kullanıcıları listeleme endpoint'i (sadece geliştirme aşamasında kullanın)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Şifreleri hariç tut
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Kullanıcılar getirilemedi' });
    }
});

const ActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: String,
    ip: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Token doğrulama endpoint'i
app.get('/api/verify-token', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        // Kullanıcı bilgilerini ve avatar URL'sini döndür
        res.json({ 
            valid: true, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar || 'default-avatar.png'
            } 
        });
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        res.status(401).json({ error: 'Geçersiz token' });
    }
});

// Profil güncelleme endpoint'i
app.post('/api/update-profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, newPassword } = req.body;
        const updateData = { name };

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: 'Profil güncellenirken bir hata oluştu' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
}); 