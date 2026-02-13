const db = require('../../lib/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-me';

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { action } = req.query;

        // --- REGISTER ---
        if (req.method === 'POST' && action === 'register') {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'Preencha todos os campos.' });
            }

            const userCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userCheck.rows.length > 0) {
                return res.status(409).json({ error: 'E-mail já cadastrado.' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const result = await db.query(
                'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
                [name, email, hashedPassword]
            );

            return res.status(201).json({
                message: 'Usuário criado com sucesso!',
                user: result.rows[0]
            });
        }

        // --- LOGIN ---
        if (req.method === 'POST' && action === 'login') {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
            }

            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const validPassword = await bcrypt.compare(password, user.password);
            if (!validPassword) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, name: user.name },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Login realizado com sucesso!',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        }

        // --- LOGOUT (Stateless but useful endpoint stub) ---
        if (req.method === 'POST' && action === 'logout') {
            return res.status(200).json({ message: 'Logout realizado' });
        }

        // --- USER INFO (ME) ---
        if (req.method === 'GET' && action === 'me') {
            // Usually we'd verify token here, but for now... logic similar to checks
            // This is just a placeholder if needed.
            return res.status(400).json({ error: 'Endpoint requer autenticação (TODO)' });
        }

        return res.status(400).json({ error: 'Ação inválida ou método incorreto' });

    } catch (error) {
        console.error('Auth API Error:', error);
        res.status(500).json({ error: 'Erro interno no servidor.' });
    }
};
