const express = require('express');
const router = express.Router();
const db = require('../db');
const createUploadMiddleware  = require('../middlewares/upload');
const { deleteFileByPath } = require('../utils/deleteFiles');

// Criar empresa
router.post("/", async (req, res) => {
  try {
    const {
      cliente_id,
      razao_social,
      nome_fantasia,
      cnpj,
      inscricao_estadual,
      inscricao_municipal,
      cnae,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      cep,
      telefone,
      email,
      site,
      responsavel_id,
      ativo,
    } = req.body;

    const result = await db.query(
      `INSERT INTO empresas (
        cliente_id, razao_social, nome_fantasia, cnpj, inscricao_estadual, 
        inscricao_municipal, cnae, endereco, numero, complemento, bairro, cidade, 
        uf, cep, telefone, email, site, responsavel_id, ativo
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19
      ) RETURNING *`,
      [
        cliente_id,
        razao_social,
        nome_fantasia,
        cnpj,
        inscricao_estadual,
        inscricao_municipal,
        cnae,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        telefone,
        email,
        site,
        responsavel_id,
        ativo,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar todas as empresas
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM empresas ORDER BY id_empresa DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar empresa por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM empresas WHERE id_empresa = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar empresa
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cliente_id,
      razao_social,
      nome_fantasia,
      cnpj,
      inscricao_estadual,
      inscricao_municipal,
      cnae,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      cep,
      telefone,
      email,
      site,
      responsavel_id,
      ativo,
    } = req.body;

    const result = await db.query(
      `UPDATE empresas SET 
        cliente_id = $1, razao_social = $2, nome_fantasia = $3, cnpj = $4, inscricao_estadual = $5,
        inscricao_municipal = $6, cnae = $7, endereco = $8, numero = $9, complemento = $10,
        bairro = $11, cidade = $12, uf = $13, cep = $14, telefone = $15, email = $16,
        site = $17, responsavel_id = $18, ativo = $19
      WHERE id_empresa = $20 RETURNING *`,
      [
        cliente_id,
        razao_social,
        nome_fantasia,
        cnpj,
        inscricao_estadual,
        inscricao_municipal,
        cnae,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep,
        telefone,
        email,
        site,
        responsavel_id,
        ativo,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Excluir empresa
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query("DELETE FROM empresas WHERE id_empresa = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Empresa não encontrada" });
    }
    res.json({ message: "Empresa excluída com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
