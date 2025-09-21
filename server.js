const express = require('express');
const cors = require('cors');

const usersRouter = require('./src/routes/usuarios'); // rota de usuários com JWT
const funcionarioRouter = require('./src/routes/funcionarios');
const uploadDocumentosRouter = require('./src/routes/documentos');
const cargoRouter = require('./src/routes/cargos');
const cboRouter = require('./src/routes/cbos');
const empresaRouter = require('./src/routes/empresas');
const discRouter = require('./src/routes/disc')
const autenticarToken = require('./src/middlewares/auth'); // middleware JWT

const app = express();
const PORT = 3001;

// Configuração do CORS
app.use(cors({
  origin: '*', // ou seu domínio
}));

app.use(express.json());

// Rotas públicas
app.use('/usuarios', usersRouter); // inclui login e cadastro
app.use('/documentos', uploadDocumentosRouter);
app.use('/uploads', express.static('uploads'));
app.use("/disc", discRouter);

// Rotas protegidas (exemplo)
app.use('/funcionarios', autenticarToken, funcionarioRouter);
app.use('/cargos', autenticarToken, cargoRouter);
app.use('/cbos', autenticarToken, cboRouter);
app.use('/empresas', autenticarToken, empresaRouter);

// Exemplo de rota protegida adicional
app.get('/perfil', autenticarToken, (req, res) => {
  res.json({ message: `Bem-vindo, usuário ${req.usuario.login}` });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
