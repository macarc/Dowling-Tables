/*** HELPER ***/
async function ev(element, event) {
  return new Promise((res) => {
    function eventListener(e) {
      element.removeEventListener(event, eventListener);
      res(e);
    }
    element.addEventListener(event, eventListener);
  });
}
function mk(tagName, inner = null) {
  const el = document.createElement(tagName);
  if (Array.isArray(inner)) {
    inner.forEach((child) => el.appendChild(child));
  } else if (typeof inner === "string") {
    el.innerHTML = inner;
  } else if (typeof inner === "object") {
    for (const attr in inner) {
      if (
        inner[attr] !== false &&
        inner[attr] !== undefined &&
        inner[attr] !== null
      )
        el.setAttribute(attr, inner[attr]);
    }
  }
  return el;
}

/*** DOWLING ***/
class DowlingLatin {
  word = 0;
  case = 0;

  numWords = 0;
  numCases = 0;

  constructor(data) {
    this.data = data;

    this.numWords = data.words.length;
    this.numCases = data.headings.length;

    this.input = mk("input", {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      autocomplete: "off",
    });
    this.input.addEventListener("input", this.onInput.bind(this));

    this.render();
  }

  async enterPress() {
    let e = {};
    while (e.keyCode !== 13) e = await ev(this.input, "keyup");
  }

  currentWord() {
    return this.data.words[this.word];
  }
  currentCase() {
    return this.currentWord().cases[this.case];
  }

  async onInput(e) {
    const ch = e.data;
    if ((ch > "z" || ch < "a") && ch !== " ") {
      const rep = (oldCh, newCh) => {
        if (ch === oldCh) {
          this.input.value = this.input.value.replace(oldCh, newCh);
          return false;
        }
        return true;
      };
      if (
        rep("A", "ā") &&
        rep("E", "ē") &&
        rep("I", "ī") &&
        rep("O", "ō") &&
        rep("U", "ū")
      )
        this.input.value = this.input.value.slice(0, -1);
    }

    if (this.input.value === this.currentCase()) {
      this.input.classList = "right";

      await this.enterPress();
      // If they've changed the value and then pressed enter
      if (this.input.value === this.currentCase()) this.nextCase();
    } else if (
      this.input.value != this.currentCase().slice(0, this.input.value.length)
    ) {
      this.input.classList = "wrong";
    } else {
      this.input.classList = "";
    }
  }

  finish() {
    window.location.replace(`/summary?what=${what}`);
  }

  nextCase() {
    this.case++;
    this.input.value = "";
    this.render();
  }
  nextWord() {
    if (this.word < this.numWords - 1) {
      this.case = 0;
      this.word++;
      this.render();
    } else {
      this.finish();
    }
  }

  renderInput(table, tableHolder) {
    const th = mk("th", this.data.headings[this.case]);
    const td = mk("td", [this.input]);
    const tr = mk("tr", [th, td]);

    table.appendChild(tr);
    tableHolder.appendChild(table);
    this.input.focus();
  }

  async renderNextButton(tableHolder) {
    const button = mk("button", "Continue");
    tableHolder.insertAdjacentElement("afterend", button);
    button.focus();

    await ev(button, "click");
    button.remove();
    this.nextWord();
  }

  render() {
    document.querySelector("h1").innerHTML = this.data.name;
    document.querySelector("h2").innerHTML = this.currentWord().name;
    let table = mk("table");
    const tableHolder = document.getElementById("table-holder");
    tableHolder.innerHTML = "";
    for (let i = 0; i < this.case; i++) {
      const th = mk("th", this.data.headings[i]);
      const td = mk("td", this.currentWord().cases[i]);
      const tr = mk("tr", [th, td]);

      table.appendChild(tr);

      if ((i + 1) % this.data.split === 0) {
        tableHolder.appendChild(table);
        table = mk("table");
      }
    }

    if (this.case < this.numCases) {
      this.renderInput(table, tableHolder);
    } else {
      this.renderNextButton(tableHolder);
    }
  }
}

async function main() {
  const what = new URLSearchParams(window.location.search).get("what");
  if (what) {
    const resp = await fetch(`/data/${what}.json`);
    const data = await resp.json();

    new DowlingLatin(data);
  } else {
    window.location.replace("/");
  }
}

document.addEventListener("DOMContentLoaded", main);
