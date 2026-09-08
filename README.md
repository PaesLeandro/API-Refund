# Refund API

API REST para cadastro e consulta de solicitações de reembolso, com autenticação por JWT e upload de comprovantes. Desenvolvida com Node.js e TypeScript.

Funcionários podem enviar comprovantes e criar solicitações. Gestores podem listar os reembolsos com paginação e filtro pelo nome do solicitante. Ambos os perfis podem consultar um reembolso pelo ID.

## Tecnologias

- **Node.js e TypeScript**: execução e desenvolvimento da API.
- **Express**: rotas e middlewares HTTP.
- **Prisma e SQLite**: acesso e armazenamento dos dados.
- **Zod**: validação dos dados recebidos.
- **JSON Web Token e bcrypt**: autenticação e hash de senhas.
- **Multer**: recebimento de arquivos.
- **tsx**: execução em desenvolvimento com reinicialização automática.

## Como executar

Com Node.js e npm instalados, abra um terminal na raiz do projeto. O ambiente de desenvolvimento utilizado é Node.js 24.

```bash
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

A API fica disponível em `http://localhost:3333`. O banco SQLite é configurado em `prisma/schema.prisma`, no arquivo `prisma/dev.db`.

Execute o servidor a partir da raiz do projeto: os caminhos dos uploads são calculados a partir do diretório de execução.

A configuração atual não exige um arquivo `.env`: o banco está definido no schema do Prisma e as opções do JWT estão em `src/configs/auth.ts`. O token tem validade de um dia.

Para verificar os tipos:

```bash
npx tsc --noEmit
```

## Rotas

| Método | Rota | Descrição | Acesso |
| --- | --- | --- | --- |
| POST | `/users` | Cadastrar usuário | Público |
| POST | `/sessions` | Autenticar e obter token JWT | Público |
| POST | `/refunds` | Criar solicitação de reembolso | `employee` |
| GET | `/refunds` | Listar reembolsos | `manager` |
| GET | `/refunds/:id` | Consultar reembolso por UUID | `employee` ou `manager` |
| POST | `/uploads` | Enviar comprovante | `employee` |
| GET | `/uploads/:filename` | Visualizar arquivo salvo | Público |

Nas rotas privadas, envie o token obtido no login:

```http
Authorization: Bearer SEU_TOKEN
```

## Testando no Insomnia

### 1. Cadastrar um usuário

Envie um **POST** para `/users`, com corpo JSON:

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha123",
  "role": "employee"
}
```

O nome precisa ter pelo menos dois caracteres e a senha, seis. O e-mail deve ser único. O perfil padrão é `employee`; a implementação atual também aceita `manager` no cadastro.

### 2. Fazer login

Envie um **POST** para `/sessions`:

```json
{
  "email": "maria@example.com",
  "password": "senha123"
}
```

Copie o campo `token` da resposta e configure-o em **Auth → Bearer Token** nas requisições privadas.

### 3. Enviar um comprovante

Envie um **POST** para `/uploads`, usando **Multipart Form**. Adicione um campo chamado `file`, do tipo arquivo, e selecione uma imagem JPEG ou PNG de até **3 MB**.

A resposta contém o nome gerado para o arquivo:

```json
{
  "filename": "84fe6655b5375a83b3de-comprovante.png"
}
```

Os arquivos são recebidos em `tmp` e, após a validação, movidos para `tmp/uploads`. A pasta de destino é criada automaticamente ao salvar um arquivo válido.

### 4. Criar um reembolso

Envie um **POST** para `/refunds`, utilizando o `filename` retornado pelo upload:

```json
{
  "name": "Almoço durante viagem",
  "category": "food",
  "amount": 45.90,
  "filename": "84fe6655b5375a83b3de-comprovante.png"
}
```

O valor deve ser um número positivo. A solicitação é vinculada ao usuário autenticado e retorna status **201** quando criada.

Categorias aceitas: `food`, `others`, `services`, `transport` e `accomodation`. Use exatamente essa grafia, conforme o enum atual do projeto.

### 5. Consultar os reembolsos

Com o token de um gestor, faça um **GET** para:

```text
http://localhost:3333/refunds?name=Maria&page=1&perPage=10
```

O parâmetro `name` filtra pelo nome do solicitante. A paginação usa, por padrão, página `1` e `10` registros por página. A resposta contém `refunds` e `pagination`, com os totais de registros e páginas. Os resultados são ordenados do mais recente para o mais antigo.

Para consultar uma solicitação, use **GET** em `/refunds/UUID_DO_REEMBOLSO`, substituindo o último trecho pelo `id` retornado na criação ou listagem.

Para visualizar o comprovante, use **GET** em `/uploads/NOME_DO_ARQUIVO`, com o `filename` completo, incluindo a extensão.

## Organização do projeto

```text
prisma/
  migrations/     Histórico das alterações no banco
  schema.prisma   Modelos e configuração do banco
src/
  configs/        Configurações de autenticação e uploads
  controllers/    Tratamento das requisições
  database/       Instância do Prisma Client
  middlewares/    Autenticação, autorização e tratamento de erros
  providers/      Armazenamento de arquivos em disco
  routes/         Definição das rotas
  types/          Tipos adicionais do Express
  utils/          Utilitários e erros da aplicação
  app.ts          Configuração do Express
  server.ts       Inicialização do servidor
tmp/uploads/      Comprovantes salvos localmente
```

## Autor

Leandro Martins Paes.

Licença declarada no `package.json`: ISC.
