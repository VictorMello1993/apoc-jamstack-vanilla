import shell from "shelljs";
import appConfig from "./app.json";
import fs from "fs/promises";
import path from "path";

const filesFolder = "./files";

async function copyFiles(file: string, destinationPath: string) {
  const sourcePath = path.join(filesFolder, file);

  // Copiando arquivos de uma pasta para outra
  await fs.copyFile(sourcePath, destinationPath);
}

// Montando HTML no processo de build
(async function build() {
  console.log("Starting build process...");

  shell.rm("-rf", "public");
  shell.mkdir("public");
  shell.mkdir(path.join("public", "files"));

  const files = await fs.readdir(filesFolder);

  await Promise.all(files.map((file) => copyFiles(file, path.join("public", "files", `${file}`))));

  const tableRows = files.map(async (file, index) => {
    // const srcImageIcon = getIconFileExtension(file);
    // console.log(srcImageIcon);
    // const { atime, size } = await getFileInformations(file);
    // const fileRow = `
    //   <tr data-index=${index}>
    //     <td>
    //       <div class="image">
    //         <img src=${srcImageIcon} class="icon"/>
    //       </div>
    //     </td>
    //     <td>${atime}</td>
    //     <td>${size}</td>
    //   </tr>
    // `;
    // return fileRow;
  });

  const dataTable = `
      <table id="data-table">
        <thead>
        <tr>
          <th>Arquivo</th>
          <th>Data de modificação</th>
          <th>Tamanho</th>
        </tr>
        <tbody>
          ${tableRows}
        </tbody>
        </thead>
      </table>
  `;

  const containerFileList = `
      <section class="files-list">
        ${dataTable}
      </section>
  `;

  // Interpolando o conteúdo HTML
  const htmlFile = (await fs.readFile("index.html"))
    .toString()
    .replace("$TITLE", appConfig.title)
    .replace("$CONTENT", containerFileList);

  // Salvando o HTML na pasta public
  await fs.writeFile("public/index.html", htmlFile);

  console.log("Success!");
})();

// function getIconFileExtension(extension: string): string {
//   const IconFileExtension = {

//   };
// }

// async function getFileInformations(sourcePath: string): Promise<any> {
//   const { atime, size } = await fs.stat(sourcePath);
//   return { atime, size };
// }
