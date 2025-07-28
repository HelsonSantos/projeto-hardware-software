#!/usr/bin/env node

const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3001";

async function testRfidAlert() {
  console.log("🧪 Testando sistema de alertas RFID...\n");

  try {
    // Simular leitura de cartão não reconhecido
    const uidNaoReconhecido = `TEST_${Date.now()}`;

    console.log(`1️⃣ Simulando leitura de cartão não reconhecido...`);
    console.log(`   UID: ${uidNaoReconhecido}`);

    const response = await fetch(`${API_BASE_URL}/api/rfid/leitura`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uid: uidNaoReconhecido,
        tipo: "entrada",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Leitura registrada com sucesso!");
      console.log(`   Status: ${data.status}`);
      console.log(`   Novo usuário: ${data.novoUsuario}`);

      if (data.novoUsuario) {
        console.log("⚠️  Alerta de novo usuário emitido!");
        console.log(`   UID: ${data.uid}`);
        console.log(`   Mensagem: ${data.alerta}`);
        console.log("\n🎯 Verifique o painel de alertas no front-end!");
      } else {
        console.log("ℹ️  Usuário já cadastrado no sistema.");
      }
    } else {
      console.log("❌ Erro ao registrar leitura:", data.message);
    }

    console.log("\n📋 Instruções:");
    console.log("   1. Abra o front-end em http://localhost:8080");
    console.log("   2. Faça login como administrador");
    console.log(
      "   3. Verifique o painel de alertas no canto superior direito"
    );
    console.log("   4. O alerta deve aparecer automaticamente");
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    console.log("\n🔧 Verifique:");
    console.log("   1. Se o back-end está rodando (npm run dev:backend)");
    console.log("   2. Se a porta 3001 está livre");
    console.log("   3. Se o banco de dados está conectado");
  }
}

// Executar o teste
testRfidAlert();
