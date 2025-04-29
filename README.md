# CineXplorer 🎬

**CineXplorer** — Seu cinema favorito em um clique.  
Encontre sessões, compare preços e compre ingressos de forma rápida e segura.

## Status do Projeto

![Build Status](https://img.shields.io/github/workflow/status/usuario/cineXplorer/CI?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge)
![License](https://img.shields.io/github/license/usuario/cineXplorer?style=for-the-badge)

## Visão Geral

**CineXplorer** é uma plataforma para compra de ingressos de cinema. O usuário pode procurar cinemas e filmes, comprar ingressos, e visualizar detalhes das sessões. Para os administradores, há um painel para gerenciar cinemas, filmes e sessões.

## Funcionalidades

## RFs - Requisitos Funcionais
- [x] O sistema deve permitir cadastrar e atualizar cinemas.
- [x] O sistema deve permitir cadastrar e atualizar filmes.
- [x] O sistema deve permitir cadastrar e atualizar sessões de cinema.
- [x] O sistema deve captar a localização do usuário (com permissão) para sugerir cinemas próximos.
- [x] O sistema deve permitir a visualização de filmes e sessões disponíveis para um cinema.
- [x] O sistema deve permitir a busca manual de cidades.
- [x] O sistema deve listar todos os cinemas da cidade/região selecionada.
- [x] O sistema deve exibir para cada cinema: nome, endereço, tipos de sala, lista de filmes em cartaz, horários e preços.
- [x] O sistema deve permitir a compra de ingressos de forma segura.
- [x] O sistema deve permitir a filtragem de sessões por horário, tipo de sala e preço.
- [x] O sistema deve permitir a compra de ingressos:
  - Escolha de sessão
  - Definição de quantidade
  - Validação de disponibilidade
  - Processamento do pagamento (mock no início, integração real depois)
- [x] O sistema deve permitir a emissão de comprovante de compra (resumo da sessão, número de ingressos, preço total).
- [x] O sistema deve enviar confirmação da compra para o usuário (por e-mail ou outro meio, integração futura com serviço SMTP).
- [x] O sistema deve conter um sistema de login para administrador.
- [x] O sistema deve conter um painel administrativo básico (CRUD de Cinemas, Filmes e Sessões).

## RNFs - Requisitos Não Funcionais
- [x] Sistema responsivo (deve funcionar bem em dispositivos móveis e desktops).
- [x] Tempo de resposta da API < 500ms para consultas comuns (cinemas, sessões).
- [x] Banco de dados relacional normalizado (PostgreSQL via PrismaORM).
- [x] Uso de Docker para orquestração de ambientes de desenvolvimento, staging e produção.
- [x] Backup automático do banco de dados a cada 24 horas.
- [x] Testes unitários e integração no back-end (usando Jest ou outra framework).
- [x] Versionamento do código via Git.
- [x] Escalabilidade horizontal via containers.
- [x] Monitoramento básico de uptime e erros (ex.: usar uptime robot ou similar).
- [x] Proteção de APIs sensíveis via autenticação JWT para admins.
- [x] Código Back-End seguindo padrões de Clean Architecture ou organização modular
- [x] O site deve ter alta disponibilidade (mínimo 99% uptime).
- [x] O site deve ser responsivo (adaptado para desktop, tablet e celular).
- [x] O tempo de carregamento das páginas deve ser inferior a 3 segundos.
- [x] O site deve proteger os dados dos usuários conforme LGPD (Lei Geral de Proteção de Dados).
- [x] As transações de compra devem ser feitas em ambiente seguro (HTTPS + criptografia).
- [x] O sistema deve ser compatível com os navegadores mais populares (Chrome, Firefox, Safari, Edge).

## Tecnologias Usadas

- **Backend**: Node.js, Fastify, Prisma ORM, Docker, JWT, Bcrypt, Fastify Swagger.
- **Banco de Dados**: PostgreSQL (versão 12).
- **Infraestrutura**: Docker para orquestração.
- **Testes**: Jest.
- **Frontend**: Next.js, TailwindCSS.


## Dependências
```bash
npm i fastify fastify-type-provider-zod zod @fastify/auth @fastify/autoload @fastify/cors @fastify/jwt @fastify/swagger @fastify/swagger-ui @prisma/client bcryptjs dotenv typescript @types/node tsx