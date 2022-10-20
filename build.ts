import shell from "shelljs";
import appConfig from "./app.json";
// import { https } from "follow-redirects";
// import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";

const filesFolder = "./files";

async function processFile(file: string, destinationPath: string) {
  const sourcePath = path.join(filesFolder, file);

  // Copiando arquivos de uma pasta para outra
  await fs.copyFile(sourcePath, destinationPath);

  // Obtendo o tamanho e data de modificação dos arquivos
  const { size, atime } = await fs.stat(sourcePath);
  console.log(size, atime);
}

// Montando HTML no processo de build
(async function build() {
  console.log("Starting build process...");

  shell.rm("-rf", "public");
  shell.mkdir("public");
  shell.mkdir(path.join("public", "files"));

  console.log("Getting files...");
  const files = await fs.readdir(filesFolder);

  await Promise.all(files.map((file) => processFile(file, path.join("public", "files", `${file}`))));

  // Interpolando o conteúdo HTML
  const htmlFile = (await fs.readFile("index.html"))
    .toString()
    .replace("$TITLE", appConfig.title)
    .replace("$CONTENT", appConfig.content);

  // Salvando o HTML na pasta public
  await fs.writeFile("public/index.html", htmlFile);

  console.log("Success!");
})();
