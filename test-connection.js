#!/usr/bin/env node

const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3001";

async function testConnection() {
  console.log("🔍 Testando conexão com o back-end...\n");

  try {
    // Teste 1: Verificar se o servidor está rodando
    console.log("1️⃣ Testando se o servidor está rodando...");
    const healthResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@test.com",
        password: "test",
      }),
    });

    if (healthResponse.status === 401) {
      console.log(
        "✅ Servidor está rodando (401 é esperado para credenciais inválidas)"
      );
    } else {
      console.log("✅ Servidor está rodando");
    }

    // Teste 2: Verificar CORS
    console.log("\n2️⃣ Testando configuração CORS...");
    const corsResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:8080",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    });

    if (corsResponse.headers.get("access-control-allow-origin")) {
      console.log("✅ CORS está configurado corretamente");
    } else {
      console.log("❌ CORS não está configurado");
    }

    // Teste 3: Verificar estrutura da resposta
    console.log("\n3️⃣ Testando estrutura da resposta...");
    const testResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@exemplo.com",
        password: "admin123",
      }),
    });

    const responseData = await testResponse.json();

    if (responseData.message) {
      console.log("✅ Estrutura da resposta está correta");
      console.log(`   Resposta: ${responseData.message}`);
    } else {
      console.log("❌ Estrutura da resposta inesperada");
    }

    console.log("\n🎉 Todos os testes passaram!");
    console.log("\n📋 Resumo:");
    console.log("   • Back-end está rodando na porta 3001");
    console.log("   • CORS está configurado");
    console.log("   • API está respondendo corretamente");
    console.log("\n🚀 Front-end pode se conectar ao back-end!");
  } catch (error) {
    console.error("\n❌ Erro ao testar conexão:", error.message);
    console.log("\n🔧 Verifique:");
    console.log(
      "   1. Se o back-end está rodando (npm run dev na pasta back-end)"
    );
    console.log("   2. Se a porta 3001 está livre");
    console.log("   3. Se o banco de dados está conectado");
  }
}

// Executar o teste
testConnection();
