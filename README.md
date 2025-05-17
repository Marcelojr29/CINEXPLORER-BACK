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
## 1. Cadastro e Gestão (Admin)
- [x] O sistema deve permitir cadastrar e atualizar cinemas (incluindo endereço, tipos de sala, preços base).
- [ ] O sistema deve permitir que administradores cadastrem, atualizem e removam cinemas, incluindo nome, endereço, tipos de sala e preço base.
- [x] O sistema deve permitir cadastrar e atualizar filmes (título, sinopse, classificação, trailer, duração).
- [ ] O sistema deve permitir o gerenciamento de filmes com dados como título, sinopse, classificação indicativa, trailer e duração.
- [x] O sistema deve permitir cadastrar e atualizar sessões (horário, sala, tipo de exibição, preços dinâmicos).
- [ ] O sistema deve permitir o cadastro e atualização de sessões, incluindo cinema, sala, horário, tipo de exibição e preço.
- [x] O sistema deve conter um painel administrativo (CRUD de cinemas, filmes, sessões, promoções).
- [ ] O sistema deve disponibilizar um painel administrativo com operações CRUD para cinemas, filmes, sessões e promoções.
- [x] O sistema deve permitir definir regras de meia-entrada (estudante, idoso, PCD, professor, etc.).
- [ ] O sistema deve permitir a definição de regras para meia-entrada (estudantes, idosos, PCDs, professores, etc.).
- [x] O sistema deve conter um sistema de login para administrador.
- [ ] O sistema deve possuir autenticação por login e senha para acesso administrativo com autenticação via JWT.
## 2. Busca e Visualização (Usuário)
- [x] O sistema deve captar a localização do usuário (com permissão) para sugerir cinemas próximos.
- [ ] O sistema deve captar a localização do usuário (com permissão_ para sugerir cinemas próximos.
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
- [ ] O sistema deve permitir busca por:
      - Nome do cinema, shopping ou filme.
      - Cidade/região (manual ou por geolocalização).
- [ ] O sistema deve exibir comparação de preços entre cinemas em tempo real.
- [ ] O sistema deve filtrar sessões por:
      - Horário, tipo de sala (3D, IMAX), legendado/dublado.
      - Preço (mais barato primeiro, promoções).
- [ ] O sistema deve mostrar mapa de assentos interativo (disponíveis/reservados).

 ##3. Compra de Ingressos (Usuário).
 - [ ] O sistema deve permitir seleção de:
       - Quantitdade de ingressos.
       - Tipo de ingresso (interia, meia-entrada com subcategorias).
       - Assentos específicos.
- [ ] O sistema deve oferecer checkout:
      - Opção de continuar sem cadastro (apenas com CPF/e-mail).
      - Cadastro rápido (salvar dados para próximas compras).
      - Métodos de pagamento: cartão (crédito/débito), PIX, Google Pay.
- [ ] O sistema deve emitir comprovante (PDF com QR Code) por e-mail.

##4. Pós-Compra (Usuário e Admin)
- [ ] O sistema deve permitir cancelamento/reembolso (se política do cinema permitir).
- [ ] O sistema deve coletar avaliações do usuário (cinema/filme).

## RNFs - Requisitos Não Funcionais
##1. Performance e Escalabilidade
- [ ] Tempo de resposta da API < 500ms para consultas comuns.
- [ ] Tempo de carregamento das páginas < 2 segundos.
- [ ] Alta disponibilidade (99.9% uptime).

##2. Segurança e Conformidade
- [ ] Proteção de dados conforme LGPD:
      - Criptografia de CPF, e-mail e dados de pagamento.
      - Opção de exclusão de conta/dados.
- [ ] Ambiente seguro para pagamentos (HTTPS, PCI DSS para cartões) (Mock de dados).
- [ ] Autenticação JWT para APIs administrativas

##3. Usuabilidade e Compatibilidade
- [ ] Sistema 100% responsivo (mobile, tablet, desktop).
- [ ] Compatibilidade com Chrome, Firefox, Safari, Edge.
- [ ] Interface intuitiva (UX similar a apps de streaming como Netflix).

##4. Infraestrutura e DevOps
- [ ] Banco de dados PostgreSQL (PrismaORM) com backups diários.
- [ ] Testes automatizados (Jest para back-end, cypress para front-end).
- [ ] Monitoramento contínuo (Uptime Robot, New Relic).
- [ ] CI/CD para deploys automáticos.

##5. Diferenciais (Opcionais mas Recomendados).
- [ ] Programas de fidelidade (descontos após X ingressos comprados).
- [ ] Alertas personalizados (ex: "Filme X chegou no cinema Y perto de você").
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
- **Testes**: Vitest.
- **Frontend**: Next.js, TailwindCSS.


## Dependências
```bash
npm i fastify fastify-type-provider-zod zod @fastify/auth @fastify/autoload @fastify/cors @fastify/jwt @fastify/swagger @fastify/swagger-ui @prisma/client bcryptjs dotenv typescript @types/node tsx
