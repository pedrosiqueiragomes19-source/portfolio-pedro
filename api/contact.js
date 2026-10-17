// Função Serverless Vercel para envio de formulário de contato

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile();
  }
} catch {
  // Arquivo .env não encontrado ou variáveis já injetadas pelo runtime
}

const nodemailer = require('nodemailer');

// Armazenamento em memória para limite de requisições por IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_REQUESTS_PER_IP = 5;

// Mensagens em Português e Inglês
const MESSAGES = {
  pt: {
    success: 'Mensagem enviada com sucesso!',
    rateLimit: 'Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.',
    invalidName: 'O nome deve ter entre 2 e 100 caracteres.',
    invalidEmail: 'Por favor, informe um e-mail válido.',
    invalidMessage: 'A mensagem deve ter entre 10 e 2000 caracteres.',
    missingFields: 'Preencha todos os campos obrigatórios.',
    sendError: 'Erro ao enviar mensagem. Tente novamente mais tarde.',
    methodNotAllowed: 'Método não permitido.',
  },
  en: {
    success: 'Message sent successfully!',
    rateLimit: 'Too many attempts. Please wait 15 minutes before trying again.',
    invalidName: 'Name must be between 2 and 100 characters.',
    invalidEmail: 'Please provide a valid email address.',
    invalidMessage: 'Message must be between 10 and 2000 characters.',
    missingFields: 'Please fill in all required fields.',
    sendError: 'Error sending message. Please try again later.',
    methodNotAllowed: 'Method not allowed.',
  },
};

// Sanitização de string contra injeção de HTML
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Validação de formato de e-mail
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return typeof email === 'string' && email.length <= 100 && regex.test(email.trim());
}

// Verifica limite de requisições por IP
function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_IP) {
    return true;
  }

  entry.count += 1;
  return false;
}

module.exports = async function handler(req, res) {
  // Configuração de CORS restrito
  const origin = req.headers.origin || '';
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:4200')
    .split(',')
    .map((o) => o.trim());

  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Resposta rápida para preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Detecta idioma da resposta
  const langHeader = req.headers['accept-language'] || '';
  const isEn = req.body?.lang === 'en' || (langHeader.startsWith('en') && req.body?.lang !== 'pt');
  const t = isEn ? MESSAGES.en : MESSAGES.pt;

  // Permite apenas método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: t.methodNotAllowed });
  }

  // Limite por IP
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown-ip';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ success: false, message: t.rateLimit });
  }

  const { name, email, message, honeypot } = req.body || {};

  // Proteção Honeypot anti-spam
  if (honeypot) {
    return res.status(200).json({ success: true, message: t.success });
  }

  // Validação dos campos no backend
  if (!name || !email || !message) {
    return res.status(422).json({ success: false, message: t.missingFields });
  }

  const cleanName = sanitize(name);
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanMessage = sanitize(message);

  if (cleanName.length < 2 || cleanName.length > 100) {
    return res.status(422).json({ success: false, message: t.invalidName });
  }

  if (!isValidEmail(cleanEmail)) {
    return res.status(422).json({ success: false, message: t.invalidEmail });
  }

  if (cleanMessage.length < 10 || cleanMessage.length > 2000) {
    return res.status(422).json({ success: false, message: t.invalidMessage });
  }

  const targetEmail = process.env.EMAIL_TO || process.env.EMAIL_USER || 'pedrosiqueiragomes19@gmail.com';

  // 1. FORMSPREE PROVIDER
  const formspreeUrl =
    process.env.FORMSPREE_URL ||
    (process.env.FORMSPREE_ID ? `https://formspree.io/f/${process.env.FORMSPREE_ID}` : null);

  if (formspreeUrl) {
    try {
      const fsRes = await fetch(formspreeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          message: cleanMessage,
          _replyto: cleanEmail,
          _subject: `[Portfólio] Mensagem de ${cleanName}`,
        }),
      });

      if (!fsRes.ok) {
        const errorData = await fsRes.json().catch(() => ({}));
        throw new Error(errorData.error || `Formspree status ${fsRes.status}`);
      }

      return res.status(200).json({ success: true, message: t.success });
    } catch (err) {
      console.error('[API Contact - Formspree Error]:', err);
      return res.status(500).json({ success: false, message: t.sendError });
    }
  }

  // 2. RESEND PROVIDER
  if (process.env.RESEND_API_KEY) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'Portfólio <onboarding@resend.dev>',
          to: targetEmail,
          reply_to: cleanEmail,
          subject: `[Portfólio] Mensagem de ${cleanName}`,
          text: `Nome: ${cleanName}\nE-mail: ${cleanEmail}\n\nMensagem:\n${cleanMessage}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
              <h2>Nova mensagem do formulário de contato</h2>
              <p><strong>Nome:</strong> ${cleanName}</p>
              <p><strong>E-mail:</strong> ${cleanEmail}</p>
              <p><strong>Mensagem:</strong></p>
              <p style="white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 6px;">${cleanMessage}</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const errJson = await resendRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Resend status ${resendRes.status}`);
      }

      return res.status(200).json({ success: true, message: t.success });
    } catch (err) {
      console.error('[API Contact - Resend Error]:', err);
      return res.status(500).json({ success: false, message: t.sendError });
    }
  }

  // 3. NODEMAILER / SMTP PROVIDER
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: `"Portfólio Pedro Siqueira" <${process.env.EMAIL_USER}>`,
      to: targetEmail,
      replyTo: cleanEmail,
      subject: `[Portfólio] Mensagem de ${cleanName}`,
      text: `Nome: ${cleanName}\nE-mail: ${cleanEmail}\n\nMensagem:\n${cleanMessage}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px;">
          <h2>Nova mensagem do formulário de contato</h2>
          <p><strong>Nome:</strong> ${cleanName}</p>
          <p><strong>E-mail:</strong> ${cleanEmail}</p>
          <p><strong>Mensagem:</strong></p>
          <p style="white-space: pre-wrap; background: #f4f4f5; padding: 12px; border-radius: 6px;">${cleanMessage}</p>
        </div>
      `,
    };

    try {
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
      ]);

      return res.status(200).json({ success: true, message: t.success });
    } catch (error) {
      console.error('[API Contact - Nodemailer Error]:', error);
      return res.status(500).json({ success: false, message: t.sendError });
    }
  }

  // Se nenhuma chave estiver configurada no ambiente
  console.warn(
    '[API Contact] Nenhuma credencial configurada (defina FORMSPREE_ID, RESEND_API_KEY ou EMAIL_USER/EMAIL_PASS no painel da Vercel ou no .env).'
  );
  return res.status(503).json({
    success: false,
    message: isEn
      ? 'Contact service is not configured with email credentials. Please configure FORMSPREE_ID, RESEND_API_KEY or EMAIL_USER/EMAIL_PASS in environment variables.'
      : 'Serviço de contato não configurado com credenciais de e-mail. Por favor, configure FORMSPREE_ID, RESEND_API_KEY ou EMAIL_USER/EMAIL_PASS nas variáveis de ambiente.',
  });
};
