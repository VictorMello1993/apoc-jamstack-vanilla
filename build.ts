import shell from "shelljs";
import appConfig from "./app.json";
import fs from "fs/promises";
import path from "path";

const filesFolder = "./files";
const assetsFolder = "./assets";

async function copyFiles(file: string, destinationPath: string) {
  let sourcePath = "";

  if (!file.includes(".svg")) sourcePath = path.join(filesFolder, file);
  else sourcePath = path.join(assetsFolder, file);

  await fs.copyFile(sourcePath, destinationPath);
}

// Montando HTML no processo de build
(async function build() {
  console.log("Starting build process...");

  shell.rm("-rf", "public");
  shell.mkdir("public");
  shell.mkdir(path.join("public", "files"));
  shell.mkdir(path.join("public", "assets"));

  const files = await fs.readdir(filesFolder);
  const icons = await fs.readdir(assetsFolder);

  icons.map((icon) => copyFiles(icon, path.join("public", "assets", `${icon}`)));

  const tableRows = await Promise.all(
    files
      .map(async (file, index) => {
        copyFiles(file, path.join("public", "files", `${file}`));

        const indexFileExtension = file.indexOf(".", -1);

        const srcImageIcon = getIconFileExtension(file.substring(indexFileExtension));
        const { updatedAtISOString, size } = await getFileInformations(path.join(filesFolder, file));

        return templateFileIntoHTML(file, index, srcImageIcon, updatedAtISOString, size);
      })
      .map((tableRow) => tableRow.then((item) => item)),
  );

  const dataTable = `
          <table id="data-table">
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Data de modificação</th>
                <th>Tamanho (em bytes)</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.join("")}
            </tbody>            
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

function getIconFileExtension(extension: string): string {
  const IconFileExtension = {
    ".pdf": "/assets/file-pdf.svg",
    ".doc": "/assets/file-doc.svg",
    ".docx": "/assets/file-doc.svg",
    ".csv": "/assets/file-csv.svg",
    ".xls": "/assets/file-xls.svg",
    ".xlsx": "/assets/file-xls.svg",
    ".jpg": "/assets/file-image.svg",
    ".jpeg": "/assets/file-image.svg",
    ".png": "/assets/file-image.svg",
    ".txt": "/assets/file-text.svg",
    ".wav": "/assets/file-audio.svg",
    ".mp3": "/assets/file-audio.svg",
  };

  return IconFileExtension[extension.toLowerCase()] ?? "File uknown";
}

async function getFileInformations(sourcePath: string): Promise<{ updatedAtISOString: string; size: number }> {
  const { atime, size } = await fs.stat(sourcePath);
  const updatedAtISOString = atime.toISOString();

  return { updatedAtISOString, size };
}

function templateFileIntoHTML(
  fileName: string,
  index: number,
  srcImageIcon: string,
  atime: string,
  size: number,
): string {
  return `
            <tr data-index=${index}>
              <td>
                <div class="image">
                  <img src=${srcImageIcon} class="icon"/>
                  <i>${fileName}</i>
                </div>
              </td>
              <td>${atime}</td>
              <td>${size}</td>
            </tr>
`;
}
