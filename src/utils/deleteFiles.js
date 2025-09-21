const fs = require('fs');
const path = require('path');

async function deleteFileByPattern(id, tipo, folder = 'uploads') {
  const directoryPath = path.join(__dirname, folder);

  try {
    const files = await fs.promises.readdir(directoryPath);

    const targetFile = files.find(file => file.startsWith(`${id}-${tipo}`));
    
    if (targetFile) {
      const filePath = path.join(directoryPath, targetFile);
      await fs.promises.unlink(filePath);
      console.log(`Arquivo ${targetFile} apagado com sucesso.`);
      return true;
    } else {
      console.log('Arquivo não encontrado.');
      return false;
    }
  } catch (err) {
    console.error('Erro ao apagar o arquivo:', err);
    throw err;
  }
}

async function deleteFileByPath(path) {

  try {
    
    if (path) {
      await fs.promises.unlink(path);
      console.log(`Arquivo ${path} apagado com sucesso.`);
      return true;
    } else {
      console.log('Arquivo não encontrado.');
      return false;
    }
  } catch (err) {
    console.error('Erro ao apagar o arquivo:', err);
    throw err;
  }
}

module.exports = { deleteFileByPattern, deleteFileByPath };