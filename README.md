# 💬 ONLINE-CHAT-TS

**Aplicativo de chat em tempo real com autenticação, desenvolvido em TypeScript usando Next.js, Prisma e NextAuth.**

Projeto criado para permitir que usuários se registrem, façam login e conversem entre si em um ambiente seguro e moderno.  
A aplicação utiliza autenticação via **NextAuth**, banco de dados com **Prisma** e interface estilizada com **Tailwind CSS**.

👉 **Disponível em produção:**  
📎 [https://online-chat-ts.vercel.app/](https://online-chat-ts.vercel.app/)

---

## 🚀 Tecnologias

<p align="left">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img alt="NextAuth" src="https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=auth0&logoColor=white"/>
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white"/>
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
  <img alt="bcrypt" src="https://img.shields.io/badge/bcrypt-003B57?style=for-the-badge"/>
</p>

---

## 📌 Funcionalidades

- [x] Cadastro de usuários  
- [x] Autenticação com **NextAuth**  
- [x] Criptografia de senhas com **bcrypt**  
- [x] Chat em tempo real  
- [x] Interface responsiva com **Tailwind CSS**  

---

## 📂 Estrutura do Projeto

```bash
├── prisma/             # Esquema do banco de dados (Prisma)
├── src/
│   ├── app/            # Rotas do Next.js (App Router)
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/            # Configurações auxiliares (auth, db, etc.)
│   ├── pages/          # Páginas adicionais (se houver)
│   └── styles/         # Estilos globais
├── .env.example        # Variáveis de ambiente
├── package.json
└── tsconfig.json
