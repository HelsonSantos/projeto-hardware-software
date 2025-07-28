# Conexão Back-end ↔ Front-end

## Visão Geral

Este documento explica como a conexão entre o back-end (Node.js/Express) e front-end (React/Vite) está configurada e como usá-la.

## Estrutura da Conexão

### Back-end (Porta 3001)

- **Framework**: Node.js com Express
- **Autenticação**: JWT (JSON Web Tokens)
- **CORS**: Configurado para aceitar requisições do front-end
- **Banco de Dados**: MySQL

### Front-end (Porta 8080)

- **Framework**: React com TypeScript
- **Build Tool**: Vite
- **Estado**: LocalStorage para tokens
- **Roteamento**: React Router

## Configuração da API

### Arquivo de Configuração: `front-end/src/config/api.ts`

Este arquivo centraliza toda a configuração da comunicação com o back-end:

```typescript
// Configuração centralizada
export const API_CONFIG = {
  BASE_URL: "http://localhost:3001",
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/api/auth/login",
      REGISTER: "/api/auth/register",
    },
    USERS: "/api/usuarios",
    DASHBOARD: {
      RESUMO: "/api/dashboard/resumo",
      FLUXO_POR_HORA: "/api/dashboard/fluxo-por-hora",
      ACESSOS_RECENTES: "/api/dashboard/acessos-recentes",
    },
  },
  TIMEOUT: 10000, // 10 segundos
};
```

### Funções da API

```typescript
// Autenticação
api.auth.login({ email, password });

// Usuários
api.users.getAll();
api.users.create(userData);
api.users.update(id, userData);
api.users.delete(id);

// Dashboard
api.dashboard.getResumo();
api.dashboard.getFluxoPorHora();
api.dashboard.getAcessosRecentes();
```

## Como Usar

### 1. Autenticação

```typescript
import { api } from "@/config/api";

// Login
const handleLogin = async (email: string, password: string) => {
  try {
    const data = await api.auth.login({ email, password });
    localStorage.setItem("adminToken", data.token);
    // Redirecionar para dashboard
  } catch (error) {
    // Tratar erro
  }
};
```

### 2. Requisições Autenticadas

Todas as requisições que precisam de autenticação automaticamente incluem o token:

```typescript
// Buscar usuários (requer autenticação)
const fetchUsers = async () => {
  try {
    const users = await api.users.getAll();
    setUsers(users);
  } catch (error) {
    // Se token expirado, será redirecionado para login
  }
};
```

### 3. Tratamento de Erros

A API automaticamente trata:

- Tokens expirados
- Erros de rede
- Timeouts
- Respostas de erro do servidor

## Configuração do CORS

O back-end está configurado para aceitar requisições dos seguintes domínios:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:8080", // Front-end Vite
      "http://localhost:3000", // Front-end alternativo
      "http://127.0.0.1:8080",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);
```

## Variáveis de Ambiente

### Front-end

Crie um arquivo `.env` na pasta `front-end/`:

```env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=LabAccess
VITE_APP_VERSION=1.0.0
```

### Back-end

Crie um arquivo `.env` na pasta `back-end/`:

```env
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin
DB_NAME=pj-hs
```

## Como Executar

### 1. Back-end

```bash
cd back-end
npm install
npm run dev
```

### 2. Front-end

```bash
cd front-end
npm install
npm run dev
```

### 3. Verificar Conexão

- Back-end deve estar rodando em: `http://localhost:3001`
- Front-end deve estar rodando em: `http://localhost:8080`
- Acesse: `http://localhost:8080/login`

## Fluxo de Autenticação

1. **Login**: Usuário faz login → recebe JWT → token salvo no localStorage
2. **Requisições**: Todas as requisições incluem automaticamente o token
3. **Validação**: Back-end valida token em cada requisição protegida
4. **Expiração**: Se token expirar, usuário é redirecionado para login

## Endpoints Disponíveis

### Autenticação

- `POST /api/auth/login` - Login de administrador
- `POST /api/auth/register` - Registro de administrador

### Usuários (Protegido)

- `GET /api/usuarios` - Listar todos os usuários
- `POST /api/usuarios` - Criar novo usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### Dashboard (Protegido)

- `GET /api/dashboard/resumo` - Resumo de acessos
- `GET /api/dashboard/fluxo-por-hora` - Fluxo por hora
- `GET /api/dashboard/acessos-recentes` - Acessos recentes

### RFID

- `POST /api/rfid` - Receber dados do hardware RFID

## Troubleshooting

### Erro de CORS

- Verifique se o back-end está rodando na porta 3001
- Verifique se o front-end está rodando na porta 8080
- Verifique se as origens estão configuradas corretamente no CORS

### Erro de Autenticação

- Verifique se o token está sendo salvo no localStorage
- Verifique se o token não expirou
- Verifique se o JWT_SECRET está configurado

### Erro de Conexão com Banco

- Verifique se o MySQL está rodando
- Verifique as credenciais do banco em `back-end/db.js`
- Verifique se o banco `pj-hs` existe

## Segurança

- Tokens JWT expiram em 1 hora
- Senhas são hasheadas com bcrypt
- CORS configurado apenas para origens permitidas
- Headers de autorização obrigatórios para rotas protegidas

## Próximos Passos

1. Implementar refresh tokens
2. Adicionar validação de dados no front-end
3. Implementar interceptors para tratamento global de erros
4. Adicionar testes automatizados
5. Configurar ambiente de produção
