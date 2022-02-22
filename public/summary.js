async function main() {
  const what = new URLSearchParams(window.location.search).get("what");
  if (what) {
    const resp = await fetch(`/data/${what}.json`);
    const data = await resp.json();

    document.querySelector("h1").innerText = `Summary of ${data.name}`;

    const main = document.querySelector("main");

    for (const word of data.words) {
      const heading = document.createElement("h2");
      heading.innerText = word.name;
      main.appendChild(heading);

      let table = document.createElement("table");
      for (let i = 0; i < word.cases.length; i++) {
        const tr = document.createElement("tr");
        const th = document.createElement("th");
        th.innerText = data.headings[i];
        const td = document.createElement("td");
        td.innerText = word.cases[i];
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
        if ((i + 1) % data.split === 0) {
          main.appendChild(table);
          table = document.createElement("table");
        }
      }
    }
  } else {
    window.location.replace("/");
  }
}
document.addEventListener("DOMContentLoaded", main);
