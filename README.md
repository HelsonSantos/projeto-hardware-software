# Sistema de Controle de Acesso RFID

Sistema completo de controle de acesso usando RFID com back-end em Node.js e front-end em React.

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
npm run install:all
```

### 2. Configurar Banco de Dados
- Certifique-se de que o MySQL está rodando
- Crie o banco de dados `pj-hs`
- Execute o script `database_schema.sql`

### 3. Executar o Projeto
```bash
# Executar back-end e front-end simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:backend  # Back-end na porta 3001
npm run dev:frontend # Front-end na porta 8080
```

### 4. Testar Conexão
```bash
npm run test:connection
```

## 📁 Estrutura do Projeto

```
Projeto-Hardware-Software/
├── back-end/           # API Node.js/Express
├── front-end/          # Interface React/TypeScript
├── hardware/           # Código do hardware RFID
├── database_schema.sql # Schema do banco de dados
└── CONEXAO_BACKEND_FRONTEND.md # Documentação da conexão
```

## 🔧 Configuração

### Back-end (Porta 3001)
- **Framework**: Node.js com Express
- **Autenticação**: JWT
- **Banco**: MySQL
- **CORS**: Configurado para front-end

### Front-end (Porta 8080)
- **Framework**: React com TypeScript
- **Build**: Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Estado**: LocalStorage para tokens

## 🔐 Autenticação

O sistema usa JWT (JSON Web Tokens) para autenticação:

1. **Login**: Usuário faz login → recebe JWT
2. **Armazenamento**: Token salvo no localStorage
3. **Requisições**: Token enviado automaticamente em headers
4. **Validação**: Back-end valida token em rotas protegidas

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro de admin

### Usuários (Protegido)
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `PUT /api/usuarios/:id` - Atualizar usuário
- `DELETE /api/usuarios/:id` - Deletar usuário

### Dashboard (Protegido)
- `GET /api/dashboard/resumo` - Resumo de acessos
- `GET /api/dashboard/fluxo-por-hora` - Fluxo por hora
- `GET /api/dashboard/acessos-recentes` - Acessos recentes

### RFID
- `POST /api/rfid` - Receber dados do hardware

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                    # Executar back-end e front-end
npm run dev:backend           # Apenas back-end
npm run dev:frontend          # Apenas front-end

# Instalação
npm run install:all          # Instalar todas as dependências

# Testes
npm run test:connection       # Testar conexão back-end ↔ front-end

# Build
npm run build                # Build do front-end
npm run start:backend        # Iniciar back-end em produção
npm run start:frontend       # Preview do front-end
```

## 🔍 Troubleshooting

### Erro de CORS
- Verifique se back-end está na porta 3001
- Verifique se front-end está na porta 8080
- Verifique configuração CORS em `back-end/app.js`

### Erro de Autenticação
- Verifique se token está no localStorage
- Verifique se JWT_SECRET está configurado
- Verifique se token não expirou (1 hora)

### Erro de Banco de Dados
- Verifique se MySQL está rodando
- Verifique credenciais em `back-end/db.js`
- Verifique se banco `pj-hs` existe

## 📚 Documentação

- [Conexão Back-end ↔ Front-end](CONEXAO_BACKEND_FRONTEND.md)
- [Configuração do Banco de Dados](DATABASE_SETUP.md)

## 🚀 Deploy

### Back-end
```bash
cd back-end
npm install
npm start
```

### Front-end
```bash
cd front-end
npm install
npm run build
npm run preview
```

## 🔒 Segurança

- Tokens JWT expiram em 1 hora
- Senhas hasheadas com bcrypt
- CORS configurado para origens específicas
- Rotas protegidas com middleware de autenticação

## 📝 Próximos Passos

1. Implementar refresh tokens
2. Adicionar validação de dados
3. Implementar interceptors globais
4. Adicionar testes automatizados
5. Configurar ambiente de produção

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC.
