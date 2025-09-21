const express = require('express');
const router = express.Router();
const createUploadMiddleware = require('../middlewares/upload');
const db = require('../db');
const path = require('path');
const { deleteFileByPath } = require('../utils/deleteFiles');

router.post('/funcionario/:id_funcionario', (req, res) => {
  const { id_funcionario } = req.params;

  const upload = createUploadMiddleware(`documentos/funcionarios/${id_funcionario}`, id_funcionario);

  upload.array('documentos', 10)(req, res, async function (err) {
    if (err) {
      console.error('Erro no upload:', err);
      return res.status(500).json({ error: err.message });
    }

    const files = req.files;
    const nomesCustomizados = req.body.nomes;
    const tiposCustomizados = req.body.tipos;
    const nomes = Array.isArray(nomesCustomizados) ? nomesCustomizados : [nomesCustomizados];
    const tipos = Array.isArray(tiposCustomizados) ? tiposCustomizados : [tiposCustomizados];
    console.log(nomesCustomizados)

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    try {
      const inserts = files.map((file, index) => {
        const filePath = file.path.replace(/\\/g, '/'); // corrige em Windows
        const nome = nomes[index] || file.originalname;
        const data = new Date();
        const tipo = tipos[index] || null;

        return db.query(
          `INSERT INTO documentos (id_funcionario, "path", tipo, nome, "data")
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [id_funcionario, filePath, tipo, nome, data]
        );
      });

      const resultados = await Promise.all(inserts);

      res.status(201).json({
        message: 'Documentos enviados com sucesso!',
        documentos: resultados.map(r => r.rows[0])
      });
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      res.status(500).json({ error: 'Erro ao salvar documentos.' });
    }
  });
});

router.get('/funcionario/:id_funcionario', async (req, res) => {
  const { id_funcionario } = req.params;

  try {
    const result = await db.query(
      `SELECT id, id_funcionario, "path", tipo, nome, "data"
        FROM documentos
        WHERE id_funcionario = $1
        ORDER BY "data" DESC`,
      [id_funcionario]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
});

router.delete('/funcionario/:id_funcionario/:id', async (req, res) => {
  const { id_funcionario, id } = req.params;

  try {
    const result = await db.query(
      `SELECT "path"
        FROM documentos
        WHERE id_funcionario = $1 and id = $2`,
      [id_funcionario, id]
    );

    const doc = result.rows[0]?.path;
    console.log(doc)

    // 2. Deleta se já houver foto
    if (doc) {
      await deleteFileByPath(doc);
      await db.query(
        `DELETE
          FROM documentos
          WHERE id_funcionario = $1 and id = $2`,
        [id_funcionario, id]
      );
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
});

router.post('/empresa/:id_empresa', (req, res) => {
  const { id_empresa } = req.params;

  const upload = createUploadMiddleware(`documentos/empresas/${id_empresa}`, id_empresa);

  upload.array('documentos', 10)(req, res, async function (err) {
    if (err) {
      console.error('Erro no upload:', err);
      return res.status(500).json({ error: err.message });
    }

    const files = req.files;
    const nomesCustomizados = req.body.nomes;
    const tiposCustomizados = req.body.tipos;
    const nomes = Array.isArray(nomesCustomizados) ? nomesCustomizados : [nomesCustomizados];
    const tipos = Array.isArray(tiposCustomizados) ? tiposCustomizados : [tiposCustomizados];
    console.log(nomesCustomizados)

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    try {
      const inserts = files.map((file, index) => {
        const filePath = file.path.replace(/\\/g, '/'); // corrige em Windows
        const nome = nomes[index] || file.originalname;
        const data = new Date();
        const tipo = tipos[index] || null;

        return db.query(
          `INSERT INTO documentos_empresas (id_empresa, "path", tipo, nome, "data")
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [id_empresa, filePath, tipo, nome, data]
        );
      });

      const resultados = await Promise.all(inserts);

      res.status(201).json({
        message: 'Documentos enviados com sucesso!',
        documentos: resultados.map(r => r.rows[0])
      });
    } catch (error) {
      console.error('Erro ao salvar no banco:', error);
      res.status(500).json({ error: 'Erro ao salvar documentos.' });
    }
  });
});

router.get('/empresa/:id_empresa', async (req, res) => {
  const { id_empresa } = req.params;

  try {
    const result = await db.query(
      `SELECT id, id_empresa, "path", tipo, nome, "data"
        FROM documentos_empresas
        WHERE id_empresa = $1
        ORDER BY "data" DESC`,
      [id_empresa]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
});

router.delete('/empresa/:id_empresa/:id', async (req, res) => {
  const { id_empresa, id } = req.params;

  try {
    const result = await db.query(
      `SELECT "path"
        FROM documentos_empresas
        WHERE id_empresa = $1 and id = $2`,
      [id_empresa, id]
    );

    const doc = result.rows[0]?.path;
    console.log(doc)

    // 2. Deleta se já houver foto
    if (doc) {
      await deleteFileByPath(doc);
      await db.query(
        `DELETE
          FROM documentos_empresas
          WHERE id_empresa = $1 and id = $2`,
        [id_empresa, id]
      );
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar documentos:', error);
    res.status(500).json({ error: 'Erro ao buscar documentos.' });
  }
});

module.exports = router;
