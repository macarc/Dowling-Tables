async function main() {

  const what = new URLSearchParams(window.location.search).get('what');
  if (what) {
    const resp = await fetch(`/${what}.json`)
    const data = await resp.json();

    document.querySelector('h1').innerText = `Summary of ${data.name}`;

    const main = document.querySelector('main');

    for (const word of data.words) {
      const table = document.createElement('table');
      for (const i in word.cases) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.innerText = data.headings[i];
        const td = document.createElement('td');
        td.innerText = word.cases[i];
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
      }

      const heading = document.createElement('h2');
      heading.innerText = word.name;

      main.appendChild(heading);
      main.appendChild(table);
    }
  } else {
    window.location.replace('/');
  }
}
document.addEventListener('DOMContentLoaded', main)
