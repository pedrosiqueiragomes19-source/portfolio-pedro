# Portfólio — Pedro Siqueira

Portfólio moderno e responsivo desenvolvido com Angular 22, TypeScript e Tailwind CSS, preparado para deploy na Vercel com função serverless de contato.

## Como rodar o projeto localmente

1. Instale as dependências:
```bash
npm install
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
```
Acesse a aplicação em `http://localhost:4200/`.

3. Para gerar a versão de produção:
```bash
npm run build
```

## Como configurar o .env

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Preencha as variáveis de ambiente com as credenciais do seu serviço de e-mail (ex: Gmail App Password):
- `EMAIL_USER`: seu endereço de e-mail remetente
- `EMAIL_PASS`: senha de app gerada no Google
- `EMAIL_TO`: e-mail que receberá as mensagens do formulário
- `ALLOWED_ORIGINS`: domínios autorizados pelo CORS (ex: `http://localhost:4200,https://seu-portfolio.vercel.app`)

Na Vercel, configure essas mesmas variáveis no painel em **Settings > Environment Variables**.

## Como trocar os links dos projetos

Os dados dos projetos estão centralizados em um único arquivo:
- Caminho: `src/app/data/projects.ts`

Basta editar a lista `PROJECTS` com `name`, `description`, `image` e `link` de cada projeto.
