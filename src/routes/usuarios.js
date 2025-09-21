const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db'); // ajuste o caminho

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';
const JWT_EXPIRES_IN = '1h'; // tempo de expiração do token

// CREATE - Inserir usuário
router.post('/', async (req, res) => {
  const { nome_usuario, login, senha } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);

    const result = await db.query(
      `INSERT INTO usuarios (nome_usuario, login, senha)
       VALUES ($1, $2, $3)
       RETURNING id_usuario`,
      [nome_usuario, login, hashedPassword]
    );

    res.status(201).json({
      id_usuario: result.rows[0].id_usuario,
      message: 'Usuário criado com sucesso'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Listar todos usuários (sem senha)
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id_usuario, nome_usuario, login FROM usuarios`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ - Obter um usuário por ID (sem senha)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT id_usuario, nome_usuario, login FROM usuarios WHERE id_usuario = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE - Atualizar usuário
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_usuario, login, senha } = req.body;

  try {
    let query;
    let values;

    if (senha) {
      const hashedPassword = await bcrypt.hash(senha, SALT_ROUNDS);
      query = `UPDATE usuarios
               SET nome_usuario=$1, login=$2, senha=$3
               WHERE id_usuario=$4
               RETURNING id_usuario`;
      values = [nome_usuario, login, hashedPassword, id];
    } else {
      query = `UPDATE usuarios
               SET nome_usuario=$1, login=$2
               WHERE id_usuario=$3
               RETURNING id_usuario`;
      values = [nome_usuario, login, id];
    }

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ id_usuario: result.rows[0].id_usuario, message: 'Usuário atualizado com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Excluir usuário
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ id_usuario: result.rows[0].id_usuario, message: 'Usuário excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN - Gera token JWT
router.post('/login', async (req, res) => {
  const { login, senha } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM usuarios WHERE login = $1`,
      [login]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Login ou senha inválidos' });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: 'Login ou senha inválidos' });
    }

    // Gera token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, login: usuario.login },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome_usuario: usuario.nome_usuario,
        login: usuario.login
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
