const express = require('express');
const router = express.Router();
const nodemailer = require("nodemailer");



// rota para receber respostas do DISC
router.post("/", async (req, res) => {
  try {
    const { nome, vaga, email, respostas } = req.body;

    // Monta corpo do email
    const htmlRespostas = Object.entries(respostas)
      .map(([pergunta, resposta]) => `<p><b>${pergunta}:</b> ${resposta}</p>`)
      .join("");

    const totalD = Object.entries(respostas).filter((resposta) => resposta[1] === "D")
    const totalI= Object.entries(respostas).filter((resposta) => resposta[1] === "I")
    const totalS = Object.entries(respostas).filter((resposta) => resposta[1] === "S")
    const totalC = Object.entries(respostas).filter((resposta) => resposta[1] === "C")

    const maiorLetra = [totalD, totalI, totalS, totalC].reduce((prev, curr) => {
      if (curr.length > prev.length) prev = curr
      return prev
    })[0] || ""

    const messageHtml = `
      <h2>Resultado do Teste DISC</h2>
      <p><b>Nome:</b> ${nome}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Vaga:</b> ${vaga}</p>
      <br>
      <hr>
      <p><b>Total letra D:</b> ${totalD}</p>
      <p><b>Total letra I:</b> ${totalI}</p>
      <p><b>Total letra S:</b> ${totalS}</p>
      <p><b>Total letra C:</b> ${totalC}</p>
      <hr>
      <br>
      <p><b>Letra com mais respostas:</b> ${maiorLetra[1]}</p>
      <br>
      <h3>Respostas:</h3>
      ${htmlRespostas}
    `;

    // Configura transporte de e-mail (exemplo com Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "consultoriaaxiaworkforce@gmail.com", // seu email
        pass: "reepnpkaaeqhbbba", // senha ou App Password
      },
    });

    // Envia e-mail
    await transporter.sendMail({
      from: `"Sistema DISC - "${email}`,
      to: "consultoriaaxiaworkforce@gmail.com", // pode ser dinâmico
      subject: `Novo Teste DISC - ${nome}`,
      html: messageHtml,
    });

    res.status(200).json({ message: "Respostas enviadas com sucesso!" });
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    res.status(500).json({ error: "Erro ao enviar respostas" });
  }
});

module.exports = router;
