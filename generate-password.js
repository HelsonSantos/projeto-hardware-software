#!/usr/bin/env node

const bcrypt = require("bcryptjs");

const password = "Helson@123";

async function generateHash() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("🔧 Gerando hash da senha...\n");
    console.log(`📧 Email: helson@gmail.com`);
    console.log(`🔑 Senha original: ${password}`);
    console.log(`🔐 Senha hasheada: ${hashedPassword}\n`);

    console.log("📋 Comando SQL para inserir no banco:");
    console.log(
      `INSERT INTO admins (email, password) VALUES ('helson@gmail.com', '${hashedPassword}');\n`
    );

    console.log("✅ Hash gerado com sucesso!");
    console.log(
      "💡 Use o comando SQL acima para inserir diretamente no banco de dados."
    );
  } catch (error) {
    console.error("❌ Erro ao gerar hash:", error.message);
  }
}

generateHash();
