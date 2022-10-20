import shell from "shelljs";
import appConfig from "./app.json";
import fs from "fs/promises";

// Montando HTML no processo de build
(async function build() {
  console.log("Starting build process...");

  shell.rm("-rf", "public");
  shell.mkdir("public");

  // Interpolando o conteúdo HTML
  const htmlFile = (await fs.readFile("index.html"))
    .toString()
    .replace("$TITLE", appConfig.title)
    .replace("$CONTENT", appConfig.content);

  // Salvando o HTML na pasta public
  await fs.writeFile("public/index.html", htmlFile);

  console.log("Success!");
})();
