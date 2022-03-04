// Helpers
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

// Wrapper for input element with macrons and coloured feedback
class DowlingInput {
  constructor(word, next) {
    this.word = word;
    this.next = next;
    this.el = mk("input", {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      autocomplete: "off",
    });
    this.el.addEventListener("input", this.onInput.bind(this));
  }

  clear() {
    this.el.value = "";
  }

  async enterPress() {
    let e = {};
    while (e.keyCode !== 13) e = await ev(this.el, "keyup");
  }

  async onInput(e) {
    const ch = e.data;
    if ((ch > "z" || ch < "a") && ch !== " ") {
      function replace(oldCh, newCh) {
        if (ch === oldCh) {
          this.el.value = this.el.value.replace(oldCh, newCh);
          return false;
        }
        return true;
      }
      if (
        replace("A", "ā") &&
        replace("E", "ē") &&
        replace("I", "ī") &&
        replace("O", "ō") &&
        replace("U", "ū")
      )
        this.el.value = this.el.value.slice(0, -1);
    }

    if (this.el.value === this.word()) {
      this.el.classList = "right";

      await this.enterPress();
      // If they've changed the value and then pressed enter
      if (this.el.value === this.word()) this.next();
    } else if (this.el.value != this.word().slice(0, this.el.value.length)) {
      this.el.classList = "wrong";
    } else {
      this.el.classList = "";
    }
  }

  focus() {
    this.el.focus();
  }

  render() {
    return this.el;
  }
}

// Main class - controls application flow
class DowlingLatin {
  word = 0;
  case = 0;

  constructor(data) {
    this.data = data;

    this.numWords = data.words.length;
    this.numCases = data.headings.length;
    this.input = new DowlingInput(
      this.currentCase.bind(this),
      this.nextCase.bind(this)
    );

    this.render();
  }

  currentWord() {
    return this.data.words[this.word];
  }
  currentCase() {
    return this.currentWord().cases[this.case];
  }

  finish() {
    window.location.replace(`/summary?what=${what}`);
  }

  nextCase() {
    this.case++;
    this.input.clear();
    this.render();
  }
  nextWord() {
    if (this.word >= this.numWords) this.finish();
    this.case = 0;
    this.word++;
    this.input.clear();
    this.render();
  }

  renderInput(table, tableHolder) {
    const th = mk("th", this.data.headings[this.case]);
    const td = mk("td", [this.input.render()]);
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
