const express = require('express');
const router = express.Router();
const db = require('../db');
const createUploadMiddleware  = require('../middlewares/upload');
const { deleteFileByPath } = require('../utils/deleteFiles');

// GET /users
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM funcionarios f left JOIN dados_profissionais dp on dp.funcionario_id = f.id_funcionario left join cargos c on c.id_cargo = dp.cargo_id left join cbo on cbo.id_cbo = c.cbo_id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* router.get(`/:id`, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM funcionarios where id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); */

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(`
      SELECT 
        f.*,
        dp.*,
        e.*,
        c.*,
        cg.*,
        dt.*,
        cbo.*
      FROM funcionarios f
      LEFT JOIN dados_profissionais dp ON dp.funcionario_id = f.id_funcionario
      LEFT JOIN enderecos_funcionarios e ON e.funcionario_id = f.id_funcionario
      LEFT JOIN contatos_funcionarios c ON c.funcionario_id = f.id_funcionario
      left join cargos cg on cg.id_cargo = dp.cargo_id
      left join departamentos dt on dt.id_departamento = cg.departamento_id
      left join cbo on cbo.id_cbo = cg.cbo_id
      WHERE f.id_funcionario = $1
      GROUP BY f.id_funcionario, dp.id_profissional, e.id_endereco, c.id_contato, dp.cargo_id, dp.departamento_id, dp.admissao, dp.salario,
               e.logradouro, e.numero, e.bairro, e.cidade, e.uf, e.cep,
               c.whatsapp, c.celular, c.email, c.outro, cg.id_cargo, dt.id_departamento, cbo.id_cbo
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// POST /users
router.post('/', async (req, res) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const {
      nome,
      nascimento,
      cpf,
      rg,
      genero,
      estadoCivil,
      dependentes,
      qtdDependentes,
      obs,
      ativo,
      treinamento,
      cargo,
      departamentoId,
      admissao,
      salario,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      cep,
      whatsapp,
      celular,
      email,
      outro
    } = req.body;

    // Inserir dados pessoais
    const resultFuncionario = await client.query(
      `INSERT INTO funcionarios 
        (nome, nascimento, cpf, rg, genero, obs, ativo, treinamento, estado_civil, dependentes, qtd_dependentes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id_funcionario`,
      [nome, nascimento, cpf, rg, genero, obs, ativo, treinamento, estadoCivil, dependentes, qtdDependentes]
    );

    const funcionarioId = resultFuncionario.rows[0].id_funcionario;
    console.log(resultFuncionario)

    // Inserir dados profissionais
    await client.query(
      `INSERT INTO dados_profissionais 
        (funcionario_id, cargo_id, departamento_id, admissao, salario) 
       VALUES ($1, $2, $3, $4, $5)`,
      [funcionarioId, cargo, departamentoId, admissao, salario]
    );

    // Inserir endereço
    await client.query(
      `INSERT INTO enderecos_funcionarios 
        (funcionario_id, logradouro, numero, bairro, cidade, uf, cep, complemento) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [funcionarioId, logradouro, numero, bairro, cidade, uf, cep, complemento]
    );

    // Inserir contatos
    await client.query(
      `INSERT INTO contatos_funcionarios 
        (funcionario_id, whatsapp, celular, email, outro) 
       VALUES ($1, $2, $3, $4, $5)`,
      [funcionarioId, whatsapp, celular, email, outro]
    );

    await client.query('COMMIT');

    res.status(201).json({ id: funcionarioId, message: 'Funcionário criado com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


// POST /users
/* router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, nascimento, cpf, rg, genero, obs, ativo, treinamento } = req.body;
  try {
    const query = ` UPDATE funcionarios SET nome = $1, nascimento = $2, cpf = $3, rg = $4, genero = $5, obs = $6, ativo = $7, treinamento = $8 WHERE id = $9 RETURNING *`;
    const values = [nome, nascimento, cpf, rg, genero, obs, ativo, treinamento, id];
    const result = await db.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}); */

router.put('/:id', async (req, res) => {
  const client = await db.connect();
  const { id } = req.params;

  try {
    await client.query('BEGIN');

    const {
      nome,
      nascimento,
      cpf,
      rg,
      genero,
      estadoCivil,
      dependentes,
      qtdDependentes,
      obs,
      ativo,
      treinamento,
      cargo,
      departamentoId,
      admissao,
      salario,
      logradouro,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      cep,
      whatsapp,
      celular,
      email,
      outro
    } = req.body;

    // Atualizar dados pessoais (já existe, apenas update)
    await client.query(
      `UPDATE funcionarios
       SET nome=$1, nascimento=$2, cpf=$3, rg=$4, genero=$5, obs=$6, ativo=$7, treinamento=$8, estado_civil=$9, dependentes=$10, qtd_dependentes=$11
       WHERE id_funcionario=$12`,
      [nome, nascimento, cpf, rg, genero, obs, ativo, treinamento, estadoCivil, dependentes, qtdDependentes, id]
    );

    // UPSERT dados profissionais
    await client.query(
      `INSERT INTO dados_profissionais (funcionario_id, cargo_id, departamento_id, admissao, salario)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (funcionario_id)
       DO UPDATE SET
         cargo_id = EXCLUDED.cargo_id,
         departamento_id = EXCLUDED.departamento_id,
         admissao = EXCLUDED.admissao,
         salario = EXCLUDED.salario`,
      [id, cargo, departamentoId, admissao, salario]
    );

    // UPSERT endereço
    await client.query(
      `INSERT INTO enderecos_funcionarios (funcionario_id, logradouro, numero, bairro, cidade, uf, cep, complemento)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (funcionario_id)
       DO UPDATE SET
         logradouro = EXCLUDED.logradouro,
         numero = EXCLUDED.numero,
         complemento = EXCLUDED.complemento,
         bairro = EXCLUDED.bairro,
         cidade = EXCLUDED.cidade,
         uf = EXCLUDED.uf,
         cep = EXCLUDED.cep`,
      [id, logradouro, numero, bairro, cidade, uf, cep, complemento]
    );

    // UPSERT contatos
    await client.query(
      `INSERT INTO contatos_funcionarios (funcionario_id, whatsapp, celular, email, outro)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (funcionario_id)
       DO UPDATE SET
         whatsapp = EXCLUDED.whatsapp,
         celular = EXCLUDED.celular,
         email = EXCLUDED.email,
         outro = EXCLUDED.outro`,
      [id, whatsapp, celular, email, outro]
    );

    await client.query('COMMIT');

    res.status(200).json({ id, message: 'Funcionário atualizado ou inserido com sucesso' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});


router.post('/foto/:id', async (req, res, next) => {
  const { id } = req.params;

  try {
    // 1. Busca a foto atual
    const resultado = await db.query(
      'SELECT foto FROM funcionarios WHERE id_funcionario = $1',
      [id]
    );

    const fotoAtual = resultado.rows[0]?.foto;
    console.log(fotoAtual)

    // 2. Deleta se já houver foto
    if (fotoAtual) {
      await deleteFileByPath(fotoAtual);
    }

    // 3. Cria o middleware de upload
    const upload = createUploadMiddleware('fotos', id, 'fotoPerfil');

    // 4. Aplica o middleware `.single()` manualmente
    upload.single('foto')(req, res, async function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const imagePath = req.file.path;

      try {
        // 5. Salva no banco de dados
        await db.query(
          'UPDATE funcionarios SET foto = $1 WHERE id_funcionario = $2',
          [imagePath, id]
        );

        res.status(201).json({ message: 'Foto salva com sucesso!', path: imagePath });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;