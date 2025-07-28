#!/usr/bin/env node

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const API_BASE_URL = "http://localhost:3001";

async function testHistorico() {
  console.log("📊 Testando sistema de histórico de acessos...\n");

  try {
    // Teste 1: Buscar histórico geral
    console.log("1️⃣ Testando busca de histórico geral...");
    const response = await fetch(`${API_BASE_URL}/api/rfid/historico`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Histórico carregado com sucesso!");
      console.log(`   Total de registros: ${data.paginacao.total}`);
      console.log(`   Registros por página: ${data.paginacao.limite}`);
      console.log(`   Total de páginas: ${data.paginacao.totalPaginas}`);
    } else {
      console.log("❌ Erro ao carregar histórico:", response.status);
    }

    // Teste 2: Buscar com filtros
    console.log("\n2️⃣ Testando filtros...");
    const filtros = {
      tipo: "entrada",
      pagina: 1,
      limite: 10,
    };

    const params = new URLSearchParams(filtros);
    const responseFiltros = await fetch(
      `${API_BASE_URL}/api/rfid/historico?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    if (responseFiltros.ok) {
      const dataFiltros = await responseFiltros.json();
      console.log("✅ Filtros aplicados com sucesso!");
      console.log(
        `   Filtros aplicados: ${JSON.stringify(dataFiltros.filtros)}`
      );
      console.log(`   Registros encontrados: ${dataFiltros.leituras.length}`);
    } else {
      console.log("❌ Erro ao aplicar filtros:", responseFiltros.status);
    }

    // Teste 3: Buscar estatísticas
    console.log("\n3️⃣ Testando estatísticas...");
    const responseStats = await fetch(
      `${API_BASE_URL}/api/rfid/estatisticas?periodo=hoje`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      }
    );

    if (responseStats.ok) {
      const dataStats = await responseStats.json();
      console.log("✅ Estatísticas carregadas com sucesso!");
      console.log(`   Total de acessos hoje: ${dataStats.totalAcessos}`);
      console.log(`   Novos usuários: ${dataStats.novosUsuarios}`);
      console.log(
        `   Acessos por tipo: ${JSON.stringify(dataStats.acessosPorTipo)}`
      );
    } else {
      console.log("❌ Erro ao carregar estatísticas:", responseStats.status);
    }

    console.log("\n🎉 Testes de histórico concluídos!");
    console.log("\n📋 Instruções:");
    console.log("   1. Abra o front-end em http://localhost:8080");
    console.log("   2. Faça login como administrador");
    console.log('   3. Acesse a página "Histórico" no menu lateral');
    console.log("   4. Teste os filtros e funcionalidades");
  } catch (error) {
    console.error("\n❌ Erro:", error.message);
    console.log("\n🔧 Verifique:");
    console.log("   1. Se o back-end está rodando (npm run dev:backend)");
    console.log("   2. Se a porta 3001 está livre");
    console.log("   3. Se o banco de dados está conectado");
  }
}

// Executar o teste
testHistorico();
