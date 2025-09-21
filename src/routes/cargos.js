const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /cargos - listar todos os cargos
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT cg.*, dp.descricao_departamento, cbo.cbo , cbo.nome_profissao
      FROM cargos cg
      LEFT JOIN departamentos dp ON dp.id_departamento = cg.departamento_id
      LEFT JOIN cbo ON cbo.id_cbo = cg.cbo_id
      ORDER BY cg.id_cargo
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /cargos/:id - buscar cargo por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT cg.*, dp.descricao_departamento, cbo.cbo , cbo.nome_profissao
      FROM cargos cg
      LEFT JOIN departamentos dp ON dp.id_departamento = cg.departamento_id
      LEFT JOIN cbo ON cbo.id_cbo = cg.cbo_id
      WHERE cg.id_cargo = $1
    `, [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Cargo não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /cargos - criar novo cargo
router.post('/', async (req, res) => {
  const {
    descricao_cargo,
    departamento_id,
    salario_base,
    jornada_semanal,
    cbo_id,
    nivel_hierarquico,
    tipo_contratacao,
    adicional_periculosidade,
    adicional_insalubridade,
    vale_transporte,
    vale_refeicao,
    outros_beneficios,
    ativo
  } = req.body;

  try {
    const result = await db.query(`
      INSERT INTO cargos (
        descricao_cargo, departamento_id, salario_base, jornada_semanal, cbo_id,
        nivel_hierarquico, tipo_contratacao, adicional_periculosidade, adicional_insalubridade,
        vale_transporte, vale_refeicao, outros_beneficios, ativo
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      ) RETURNING *
    `, [
      descricao_cargo,
      departamento_id || null,
      salario_base,
      jornada_semanal || null,
      cbo_id || null,
      nivel_hierarquico || null,
      tipo_contratacao || 'CLT',
      adicional_periculosidade || 0,
      adicional_insalubridade || 0,
      vale_transporte !== undefined ? vale_transporte : true,
      vale_refeicao !== undefined ? vale_refeicao : true,
      outros_beneficios || null,
      ativo !== undefined ? ativo : true
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /cargos/:id - atualizar cargo
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    descricao_cargo,
    departamento_id,
    salario_base,
    jornada_semanal,
    cbo_id,
    nivel_hierarquico,
    tipo_contratacao,
    adicional_periculosidade,
    adicional_insalubridade,
    vale_transporte,
    vale_refeicao,
    outros_beneficios,
    ativo
  } = req.body;

  try {
    const result = await db.query(`
      UPDATE cargos
      SET descricao_cargo=$1,
          departamento_id=$2,
          salario_base=$3,
          jornada_semanal=$4,
          cbo_id=$5,
          nivel_hierarquico=$6,
          tipo_contratacao=$7,
          adicional_periculosidade=$8,
          adicional_insalubridade=$9,
          vale_transporte=$10,
          vale_refeicao=$11,
          outros_beneficios=$12,
          ativo=$13
      WHERE id_cargo=$14
      RETURNING *
    `, [
      descricao_cargo,
      departamento_id || null,
      salario_base,
      jornada_semanal || null,
      cbo_id || null,
      nivel_hierarquico || null,
      tipo_contratacao || 'CLT',
      adicional_periculosidade || 0,
      adicional_insalubridade || 0,
      vale_transporte !== undefined ? vale_transporte : true,
      vale_refeicao !== undefined ? vale_refeicao : true,
      outros_beneficios || null,
      ativo !== undefined ? ativo : true,
      id
    ]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Cargo não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
