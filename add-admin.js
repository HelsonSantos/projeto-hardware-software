#!/usr/bin/env node

const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3001";
const ADMIN_CREDENTIALS = {
  email: "helson@gmail.com",
  password: "Helson@123",
};

async function addAdmin() {
  console.log("🔧 Adicionando administrador...\n");
  console.log(`📧 Email: ${ADMIN_CREDENTIALS.email}`);
  console.log(`🔑 Senha: ${ADMIN_CREDENTIALS.password}\n`);

  try {
    // Verificar se o servidor está rodando
    console.log("1️⃣ Verificando se o servidor está rodando...");
    const healthCheck = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "test", password: "test" }),
    });

    if (healthCheck.status !== 401) {
      throw new Error("Servidor não está respondendo corretamente");
    }
    console.log("✅ Servidor está rodando");

    // Registrar o administrador
    console.log("\n2️⃣ Registrando administrador...");
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Administrador registrado com sucesso!");
      console.log(`   ID do administrador: ${data.adminId}`);
    } else {
      if (response.status === 409) {
        console.log("⚠️  Administrador já existe!");
      } else {
        throw new Error(data.message || "Erro ao registrar administrador");
      }
    }

    // Testar login
    console.log("\n3️⃣ Testando login...");
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ADMIN_CREDENTIALS),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.ok) {
      console.log("✅ Login testado com sucesso!");
      console.log("   Token recebido:", loginData.token ? "Sim" : "Não");
    } else {
      throw new Error(loginData.message || "Erro ao fazer login");
    }

    console.log("\n🎉 Administrador configurado com sucesso!");
    console.log("\n📋 Resumo:");
    console.log(`   • Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`   • Senha: ${ADMIN_CREDENTIALS.password}`);
    console.log("   • Status: Pronto para uso");
    console.log("\n🚀 Você pode agora fazer login no sistema!");
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    console.log("\n🔧 Verifique:");
    console.log("   1. Se o back-end está rodando (npm run dev:backend)");
    console.log("   2. Se o banco de dados está conectado");
    console.log("   3. Se a porta 3001 está livre");
  }
}

// Executar o script
addAdmin();
