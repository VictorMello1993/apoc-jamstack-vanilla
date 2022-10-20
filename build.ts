import shell from "shelljs";
import appConfig from "./app.json";
// import { https } from "follow-redirects";
// import { createWriteStream } from "fs";
import fs from "fs/promises";
import path from "path";

// const filesFolder = "./files";

// async function processFile(sourcePath: string, destinationPath: string) {
//   const fileStream = createWriteStream(destinationPath);
//   console.log(fileStream);
//   https.get(sourcePath, (request) => {
//     request.pipe(fileStream);
//     fileStream.on("finish", () => {
//       fileStream.close();
//     });
//   });
// }

// Montando HTML no processo de build
(async function build() {
  console.log("Starting build process...");

  shell.rm("-rf", "public");
  shell.mkdir("public");
  shell.mkdir(path.join("public", "files"));

  // console.log("Getting files...");
  // const files = await fs.readdir(filesFolder);

  // await Promise.all(files.map((file, index) => processFile(file, path.join("public", "files", `${file}`))));

  // Interpolando o conteúdo HTML
  const htmlFile = (await fs.readFile("index.html"))
    .toString()
    .replace("$TITLE", appConfig.title)
    .replace("$CONTENT", appConfig.content);

  // Salvando o HTML na pasta public
  await fs.writeFile("public/index.html", htmlFile);

  console.log("Success!");
})();
