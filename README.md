# FOCUS Multi-Cloud — Frontend

> Interface web para enviar CSVs de custos de nuvem, explorar os dados no padrão FOCUS e conversar com a assistente Ada.

Este repositório é o **frontend** do FOCUS Multi-Cloud. A API (conversão, indicadores e assistente) fica em outro repositório: [tcc-finops-focus](https://github.com/giiov/tcc-finops-focus).

---

## ✦ Sobre o projeto

O **FOCUS Multi-Cloud** é uma aplicação desenvolvida como Trabalho de Conclusão de Curso (TCC), com foco em FinOps (*Financial Operations*).

O usuário envia um arquivo CSV de custos de **AWS, Microsoft Azure, Google Cloud ou Oracle Cloud**. A aplicação identifica o provedor, converte os dados para o padrão **FOCUS (FinOps Open Cost and Usage Specification)**, mantido pela FinOps Foundation, e apresenta o resultado em tabela e gráficos.

> **Projeto em desenvolvimento.** As regras de conversão cobrem o escopo definido pelo projeto e podem não contemplar toda a especificação FOCUS.

---

## ✦ Páginas

Todas as páginas, exceto o login, exigem que o usuário esteja autenticado.

| Página | O que faz |
|---|---|
| **Login** | Cadastro e entrada com e-mail e senha. |
| **Início** | Envio do CSV (até 50 MB) e acompanhamento da conversão. |
| **Dados** | Tabela com a amostra dos dados convertidos (primeiras 100 linhas) e botão para baixar essa amostra em CSV. |
| **Gráficos** | Indicadores de custo calculados sobre o arquivo inteiro. |
| **Histórico** | Conversões anteriores. Em desenvolvimento, ainda não está ligado ao banco. |
| **Assistente** | Chat com a Ada, com várias conversas que podem ser renomeadas e apagadas. |
| **Perfil** | Cargo e provedores usados, que a Ada considera ao responder. |
| **Sobre** | Apresentação do projeto, do padrão FOCUS e da equipe. |

### Gráficos

Custo por serviço, por dia, por categoria de serviço e por tipo de cobrança; do preço de lista ao valor efetivo; custo por tipo de recurso, top 5 recursos mais caros e custo por tag. Um gráfico só aparece quando o arquivo tem os dados necessários, já que cada provedor preenche colunas diferentes.

### Assistente Ada

A Ada ajuda com conceitos de FinOps, do padrão FOCUS e de dados de custos em nuvem. Ela pode ser informada sobre seu contexto de trabalho na aba do perfil. Futuramente ela terá acesso às conversões feitas no site.

---

## ✦ Tecnologias

- **React 19** e **Vite**
- **React Router**: navegação e rotas protegidas
- **Supabase JS**: autenticação
- **Recharts**: gráficos
- **react-markdown**: respostas da Ada
- **lucide-react**: ícones

---

## ✦ Configuração

O frontend está publicado na **Vercel** e usa estas variáveis de ambiente, definidas no painel da Vercel ou em um `.env.local` (veja o `.env.example`):

| Variável | Descrição |
|---|---|
| `VITE_SUPABASE_URL` | URL do projeto no Supabase. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave publishable do Supabase. |
| `VITE_API_URL` | Endereço da API (Render). Padrão: `http://localhost:8000`. |

As variáveis `VITE_*` entram no código durante o build, então depois de alterar uma é preciso fazer um novo deploy.

Para rodar na sua máquina:

```bash
npm install
npm run dev
```

---

## ✦ Estrutura do projeto

```text
tcc-focus-frontend/
├── index.html
├── vercel.json            # redireciona todas as rotas para o index.html
├── .env.example
└── src/
    ├── App.jsx            # define a página de cada rota
    ├── assets/            # logo, fonte e imagens da Ada
    ├── componentes/       # layout, sidebar, rota protegida e peças visuais
    ├── contexto/          # sessão do usuário
    ├── estilos/           # CSS por área da interface
    ├── lib/               # cliente da API e do Supabase
    ├── paginas/           # uma página por arquivo
    └── servicos/          # histórico (ainda sem banco)
```

---

## ✦ Escopo e limitações atuais

- A entrada de dados é feita por arquivos **CSV**, com limite de 50 MB.
- A tabela e o CSV baixado na página Dados contêm só a amostra das primeiras 100 linhas. Os gráficos usam o arquivo inteiro.
- O resultado da conversão fica apenas na sessão do navegador: ao recarregar a página, é preciso enviar o arquivo de novo.
- O Histórico ainda não está conectado ao banco.
- A Ada não analisa o arquivo enviado nem os dados processados.

---

## ✦ Equipe

| Integrante | Redes |
|---|---|
| Giovana Cipulo | [GitHub](https://github.com/giiov) · [LinkedIn](https://www.linkedin.com/in/giocipulo) |
| Antonella Cobianchi | [GitHub](https://github.com/antonellapruc31) · [LinkedIn](https://www.linkedin.com/in/antonella-cobianchi-505710370/) |
| Bruno Holanda | [GitHub](https://github.com/brunohlnd) · [LinkedIn](https://www.linkedin.com/in/bhb-holanda) |