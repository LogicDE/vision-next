import * as bcrypt from 'bcrypt';

async function generarHash() {
  const hash = await bcrypt.hash('123456', 10); // contraseña de ejemplo
  console.log(hash);
}

generarHash();
