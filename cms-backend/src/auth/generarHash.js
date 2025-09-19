// generate-hash.js
const bcrypt = require("bcrypt");

async function generarHash(password = "123456") {
  try {
    const saltRounds = 12; // más seguro que 10
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`🔑 Password: ${password}`);
    console.log(`📌 Hash: ${hash}`);
  } catch (err) {
    console.error("❌ Error generando hash:", err);
  }
}

// Permitir pasar la contraseña como argumento en CLI
const inputPassword = process.argv[2] || "123456";
generarHash(inputPassword);
