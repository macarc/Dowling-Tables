class DowlingLatin {
  word = 0;
  case = 0;

  numWords = 0;
  numCases = 0;

  constructor(data, onFinish) {
    this.data = data;
    this.finish = onFinish;

    this.numWords = data.words.length;
    this.numCases = data.headings.length;

    this.input = document.createElement("input");
    this.input.setAttribute("spellcheck", false);
    this.input.setAttribute("autocorrect", "off");
    this.input.setAttribute("autocapitalize", "off");
    this.input.setAttribute("autocomplete", "off");
    this.input.addEventListener("input", this.onInput.bind(this));

    this.updateHeadings();
  }

  awaitEnter() {
    return new Promise((res) => {
      const el = (e) => {
        if (e.keyCode === 13) {
          this.input.removeEventListener("keyup", el);
          res();
        }
      };
      this.input.addEventListener("keyup", el);
    });
  }

  currentCase() {
    return this.data.words[this.word].cases[this.case];
  }

  onInput(e) {
    const ch = e.data;
    if ((ch > "z" || ch < "a") && ch !== " ") {
      this.input.value = this.input.value.slice(0, -1);
      if (ch === "A") this.input.value += "ā";
      if (ch === "E") this.input.value += "ē";
      if (ch === "I") this.input.value += "ī";
      if (ch === "O") this.input.value += "ō";
      if (ch === "U") this.input.value += "ū";
    }

    if (this.input.value === this.currentCase()) {
      this.input.classList = "right";

      this.awaitEnter().then(() => {
        // If they've changed the value and then pressed enter
        if (this.input.value != this.currentCase()) return;
        this.case++;
        this.input.value = "";
        this.updateHeadings();
      });
    } else if (
      this.input.value != this.currentCase().slice(0, this.input.value.length)
    ) {
      this.input.classList = "wrong";
    } else {
      this.input.classList = "";
    }
  }

  nextWord(button) {
    button.remove();
    if (this.word < this.numWords - 1) {
      this.case = 0;
      this.word++;
      this.updateHeadings();
    } else {
      this.finish();
    }
  }

  updateHeadings() {
    document.querySelector("h1").innerHTML = this.data.name;
    document.querySelector("h2").innerHTML = this.data.words[this.word].name;
    let table = document.createElement("table");
    const tableHolder = document.getElementById("table-holder");
    tableHolder.innerHTML = "";
    for (let i = 0; i < this.case; i++) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.innerText = this.data.headings[i];
      const td = document.createElement("td");
      td.innerText = this.data.words[this.word].cases[i];

      tr.appendChild(th);
      tr.appendChild(td);
      table.appendChild(tr);

      if ((i + 1) % this.data.split === 0) {
        tableHolder.appendChild(table);
        table = document.createElement("table");
      }
    }

    if (this.case < this.numCases) {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      const td = document.createElement("td");
      th.innerText = this.data.headings[this.case];
      td.appendChild(this.input);
      tr.appendChild(th);
      tr.appendChild(td);

      table.appendChild(tr);
      tableHolder.appendChild(table);
      this.input.focus();
    } else {
      const button = document.createElement("button");
      button.innerText = "Continue";
      button.addEventListener("click", () => this.nextWord(button));
      tableHolder.insertAdjacentElement("afterend", button);

      button.focus();
    }
  }
}

async function main() {
  const what = new URLSearchParams(window.location.search).get("what");
  if (what) {
    const resp = await fetch(`/data/${what}.json`);
    const data = await resp.json();

    new DowlingLatin(data, () =>
      window.location.replace(`/summary?what=${what}`)
    );
  } else {
    window.location.replace("/");
  }
}

document.addEventListener("DOMContentLoaded", main);
