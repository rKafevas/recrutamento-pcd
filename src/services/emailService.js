const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: { rejectUnauthorized: false }
});

async function enviarConfirmacaoCadastro(destinatario, nome, token) {
  await transporter.sendMail({
    from: `"Inclui+ 🤝" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Confirme seu cadastro — Inclui+',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f4f6fb;padding:32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#1558c0;font-size:26px;margin:0">Inclui+</h1>
          <p style="color:#666;font-size:13px;margin:4px 0 0">Plataforma inclusiva de recrutamento PcD</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:28px">
          <h2 style="color:#0d3b8e;font-size:20px;margin-bottom:12px">Olá, ${nome}!</h2>
          <p style="color:#444;line-height:1.6;margin-bottom:20px">Seu cadastro foi criado com sucesso. Use o código abaixo para confirmar seu e-mail:</p>
          <div style="text-align:center;margin:24px 0">
            <span style="display:inline-block;background:#1558c0;color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 32px;border-radius:10px">${token}</span>
          </div>
          <p style="color:#888;font-size:13px;text-align:center">Este código expira em <strong>15 minutos</strong>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#aaa;font-size:12px;text-align:center">Se você não criou esta conta, ignore este e-mail.</p>
        </div>
      </div>
    `
  });
}

async function enviarRecuperacaoSenha(destinatario, nome, token) {
  await transporter.sendMail({
    from: `"Inclui+ 🤝" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: 'Recuperação de senha — Inclui+',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#f4f6fb;padding:32px;border-radius:12px">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#1558c0;font-size:26px;margin:0">Inclui+</h1>
          <p style="color:#666;font-size:13px;margin:4px 0 0">Plataforma inclusiva de recrutamento PcD</p>
        </div>
        <div style="background:#fff;border-radius:10px;padding:28px">
          <h2 style="color:#0d3b8e;font-size:20px;margin-bottom:12px">Olá, ${nome}!</h2>
          <p style="color:#444;line-height:1.6;margin-bottom:20px">Recebemos uma solicitação para redefinir sua senha. Use o código abaixo:</p>
          <div style="text-align:center;margin:24px 0">
            <span style="display:inline-block;background:#f47c20;color:#fff;font-size:32px;font-weight:700;letter-spacing:8px;padding:16px 32px;border-radius:10px">${token}</span>
          </div>
          <p style="color:#888;font-size:13px;text-align:center">Este código expira em <strong>15 minutos</strong>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
          <p style="color:#aaa;font-size:12px;text-align:center">Se você não solicitou a recuperação, ignore este e-mail.</p>
        </div>
      </div>
    `
  });
}

module.exports = { enviarConfirmacaoCadastro, enviarRecuperacaoSenha };
