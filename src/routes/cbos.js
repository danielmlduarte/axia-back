const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /cbo - listar todos os CBOs
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id_cbo, cbo, nome_profissao
      FROM cbo
      ORDER BY nome_profissao
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /cbo/:id - buscar CBO por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT id_cbo, cbo, nome_profissao
      FROM cbo
      WHERE id_cbo = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CBO não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
