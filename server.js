const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const http = require('http');
const fs = require('fs');
const multer = require('multer');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- FREE-TIER GIT REPOSITORY STORAGE ENGINE ---
const dbDir = path.join(__dirname, 'database');
const uploadDir = path.join(__dirname, 'public', 'uploads');
const audioDir = path.join(__dirname, 'public', 'audio');

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const DB_FILE = path.join(dbDir, 'phantom_fury.json');
if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
        users: [], 
        messages: [], 
        announcements: [], 
        posts: [], 
        comments: [],
        system_settings: { general_chat_open: "true", showoff_upload_open: "true" }
    }, null, 2));
}

const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'showoff-' + Date.now() + path.extname(file.originalname))
});
const uploadGallery = multer({ storage: galleryStorage, limits: { fileSize: 100 * 1024 * 1024 } });

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, 'avatar-' + req.session.userId + path.extname(file.originalname))
});
const uploadAvatar = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));
app.use('/audio', express.static(audioDir));

app.use(session({
    secret: 'phantom_fury_master_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

const requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/login');
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.userId || !req.session.role || req.session.role.toLowerCase() !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
    }
    next();
};

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'views', 'register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'views', 'login.html')));
app.get('/', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'portal.html')));
app.get('/hub-view', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'home.html')));
app.get('/chatroom-view', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'chatroom.html')));
app.get('/showoff-view', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'showoff.html')));
app.get('/customizer-view', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'views', 'customizer.html')));

app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });
    let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (data.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ error: 'Username taken' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    const role = (data.users.length === 0 || username.toLowerCase() === 'obed') ? 'admin' : 'user';
    const newUser = { id: Date.now(), username, password: hashedPassword, role, profile_pic: '/uploads/default.png' };
    data.users.push(newUser); fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    req.session.userId = newUser.id; req.session.username = newUser.username; req.session.role = newUser.role; req.session.profile_pic = newUser.profile_pic;
    res.json({ success: true, redirect: '/' });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid login' });
    req.session.userId = user.id; req.session.username = user.username; req.session.role = user.role; req.session.profile_pic = user.profile_pic || '/uploads/default.png';
    res.json({ success: true, redirect: '/' });
});

app.get('/api/me', requireAuth, (req, res) => {
    let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const user = data.users.find(u => u.id === req.session.userId);
    if (!user) return res.status(404).json({ error: 'Missing profile' });
    res.json({ id: user.id, username: user.username, profile_pic: user.profile_pic || '/uploads/default.png', role: user.role });
});

app.get('/api/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

app.get('/api/music/playlist', requireAuth, (req, res) => {
    let playlist = []; if (!fs.existsSync(audioDir)) return res.json(playlist);
    const files = fs.readdirSync(audioDir);
    files.forEach(file => {
        if (file.toLowerCase().endsWith('.mp3')) {
            playlist.push({ title: "🎵 " + file.toUpperCase().replace('.MP3', '').replace(/[-_]/g, ' '), file: '/audio/' + file });
        }
    });
    if (playlist.length === 0) playlist.push({ title: "📡 STORAGE ACTIVE: DROP MP3 FILES INTO PERSISTENT DISK", file: "" });
    res.json(playlist);
});

app.get('/api/users/discover', requireAuth, (req, res) => {
    let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json(data.users.filter(u => u.id !== parseInt(req.session.userId)).map(u => ({ id: u.id, username: u.username, profile_pic: u.profile_pic || '/uploads/default.png', status: activeSockets.has(u.id) ? 'online' : 'offline' })));
});
app.post('/api/profile/upload-avatar', requireAuth, uploadAvatar.single('avatarFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const user = database.users.find(u => u.id === req.session.userId);
    if (user) { user.profile_pic = '/uploads/' + req.file.filename; fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); return res.json({ success: true, profile_pic: user.profile_pic }); }
    res.status(404).json({ error: 'Not found' });
});

app.get('/api/chatroom/history', requireAuth, (req, res) => {
    let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    res.json(database.messages.map(m => { let u = database.users.find(user => user.id === m.sender_id) || {}; return { id: m.id, message: m.message, sender_id: m.sender_id, username: u.username || 'Teammate', profile_pic: u.profile_pic || '/uploads/default.png' }; }));
});

app.post('/api/admin/toggle-chat', requireAuth, requireAdmin, (req, res) => {
    let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const currentState = data.system_settings.general_chat_open;
    const newState = (currentState === "true") ? "false" : "true"; data.system_settings.general_chat_open = newState;
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    io.emit('force_kick_locked', { statusState: newState, message: '🔒 General Chatroom locked by Admin.' });
    res.json({ success: true, open: newState === "true" });
});

app.post('/api/admin/clear-chat', requireAuth, requireAdmin, (req, res) => {
    let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); data.messages = [];
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); io.emit('general_chat_cleared'); res.json({ success: true });
});

app.get('/api/system/chat-status', requireAuth, (req, res) => { let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); res.json({ open: data.system_settings.general_chat_open === "true" }); });
app.post('/api/admin/announce', requireAuth, requireAdmin, (req, res) => { let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const newAnn = { id: Date.now(), message: req.body.message }; data.announcements.push(newAnn); fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); io.emit('new_announcement', newAnn); res.json({ success: true }); });
app.delete('/api/admin/announcement/:id', requireAuth, requireAdmin, (req, res) => { let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); data.announcements = data.announcements.filter(a => a.id !== parseInt(req.params.id)); fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2)); io.emit('announcement_deleted', parseInt(req.params.id)); res.json({ success: true }); });
app.get('/api/notifications', requireAuth, (req, res) => { let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); res.json({ announcements: data.announcements.slice(-15).reverse() }); });
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => { let data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); res.json(data.users.map(u => ({ id: u.id, username: u.username, role: u.role, profile_pic: u.profile_pic || '/uploads/default.png' }))); });
app.delete('/api/admin/user/:id', requireAuth, requireAdmin, (req, res) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const targetUserId = parseInt(req.params.id); if (targetUserId === req.session.userId) return res.status(400).json({ error: "Blocked" }); database.users = database.users.filter(u => u.id !== targetUserId); database.messages = database.messages.filter(m => m.sender_id !== targetUserId); fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); io.emit('status_change'); res.json({ success: true }); });

// GALLERY COMPILING PIPELINES
app.post('/api/showoff/upload', requireAuth, uploadGallery.single('mediaFile'), (req, res) => { if (!req.file) return res.status(400).json({ error: 'File empty' }); let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const ext = path.extname(req.file.originalname).toLowerCase(); const type = (ext === '.mp4' || ext === '.mkv' || ext === '.mov' || ext === '.3gp') ? 'video' : 'image'; const newPost = { id: Date.now(), user_id: req.session.userId, file_path: '/uploads/' + req.file.filename, file_type: type, likes: 0, views: 0, timestamp: new Date().toISOString() }; database.posts.push(newPost); fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); res.json({ success: true }); });
app.get('/api/showoff/posts', requireAuth, (req, res) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); res.json(database.posts.map(p => { let u = database.users.find(user => user.id === p.user_id) || {}; return { ...p, username: u.username || 'Squad Member', profile_pic: u.profile_pic || '/uploads/default.png' }; })); });
app.post('/api/showoff/view/:id', requireAuth, (req, res) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); let post = database.posts.find(p => p.id === parseInt(req.params.id)); if (post) post.views++; fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); res.json({ success: true }); });
app.post('/api/showoff/like/:id', requireAuth, (req, res) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); let post = database.posts.find(p => p.id === parseInt(req.params.id)); if (post) post.likes++; fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); res.json({ success: true }); });
app.get('/api/showoff/comments/:postId', requireAuth, (req, res) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); res.json(database.comments.filter(c => c.post_id === parseInt(req.params.postId)).map(c => { let u = database.users.find(user => user.id === c.user_id) || {}; return { username: u.username || 'Player', comment_text: c.comment_text }; })); });
app.post('/api/showoff/comment', requireAuth, (req, res) => { const { postId, text } = req.body; if (!postId || !text) return res.status(400).json({ error: 'Missing parameters' }); let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const newComment = { id: Date.now(), post_id: parseInt(postId), user_id: req.session.userId, comment_text: text, timestamp: new Date().toISOString() }; database.comments.push(newComment); fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); const commentator = database.users.find(u => u.id === req.session.userId) || {}; const originalPost = database.posts.find(p => p.id === parseInt(postId)) || {}; io.emit('receive_comment_notification', { postId: parseInt(postId), postOwnerId: originalPost.user_id, commentatorName: commentator.username || 'A Teammate', commentText: text.length > 30 ? text.substring(0, 30) + '...' : text }); res.json({ success: true }); });
app.delete('/api/showoff/post/:id', requireAuth, (req, res) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const targetPostId = parseInt(req.params.id); const post = database.posts.find(p => p.id === targetPostId); if (!post) return res.status(404).json({ error: 'Post missing' }); if (post.file_path && post.file_path.startsWith('/uploads/')) { const fullLocalPath = path.join(uploadDir, path.basename(post.file_path)); if (fs.existsSync(fullLocalPath)) fs.unlinkSync(fullLocalPath); } database.posts = database.posts.filter(p => p.id !== targetPostId); database.comments = database.comments.filter(c => c.post_id !== targetPostId); fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); io.emit('showoff_post_deleted', targetPostId); res.json({ success: true }); });

const activeSockets = new Map();
io.on('connection', (socket) => {
    let currentSessionUser = null; let currentUsername = "";
    socket.on('user_connected', (userId) => { currentSessionUser = parseInt(userId); activeSockets.set(currentSessionUser, socket.id); let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); let match = database.users.find(u => u.id === currentSessionUser); if (match) currentUsername = match.username; io.emit('status_change', { userId: currentSessionUser, status: 'online' }); });
    socket.on('admin_broadcast_media_state', (payload) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); const executingUser = database.users.find(u => u.id === currentSessionUser) || {}; if (executingUser.role && executingUser.role.toLowerCase() === 'admin') { socket.broadcast.emit('receive_synchronized_media_state', { action: payload.action, trackIndex: parseInt(payload.trackIndex) }); } });
    socket.on('send_public_msg', (data) => { let database = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); if (database.system_settings.general_chat_open === "false" && (!data.role || data.role.toLowerCase() !== 'admin')) return; const msgLog = { id: Date.now(), sender_id: parseInt(data.senderId), room_type: 'general', message: data.message, timestamp: new Date().toISOString() }; database.messages.push(msgLog); fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2)); io.emit('receive_public_msg', { id: msgLog.id, sender_id: msgLog.sender_id, username: data.username, profile_pic: data.profilePic || '/uploads/default.png', message: data.message }); });
    socket.on('disconnect', () => { if (currentSessionUser) { activeSockets.delete(currentSessionUser); io.emit('status_change', { userId: currentSessionUser, status: 'offline' }); } });
});

// DEFAULT FALLBACK ENVIRONMENT PORT ALLOCATION FOR CLOUD DEPLOYMENTS [INDEX]
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {});
