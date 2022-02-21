class DowlingLatin {
  word = 0;
  case = 0;

  numWords = 0;
  numCases = 0;

  constructor(data) {
    this.data = data;

    this.numWords = data.words.length;
    this.numCases = data.headings.length;

    this.input = document.createElement('input');
    this.input.setAttribute('spellcheck', false);
    this.input.addEventListener('input', this.onInput.bind(this));

    this.updateHeadings();
  }

  awaitEnter() {
    return new Promise(res => {
      const el = e => {
        if (e.keyCode === 13) {
          this.input.removeEventListener('keyup', el);
          res();
        }
      }
      this.input.addEventListener('keyup', el)
    })
  }

  currentCase() {
    return this.data.words[this.word].cases[this.case];
  }

  onInput(e) {
    const ch = e.data;
    if (ch > 'z' || ch < 'a') {
      this.input.value = this.input.value.slice(0, -1);
      if (ch === 'A') this.input.value += 'ā'
      if (ch === 'E') this.input.value += 'ē'
      if (ch === 'I') this.input.value += 'ī'
      if (ch === 'O') this.input.value += 'ō'
      if (ch === 'U') this.input.value += 'ū'
    }

    if (this.input.value === this.currentCase()) {
      this.input.classList = 'right';

      this.awaitEnter().then(() => {
        this.case++;
        this.input.value = "";
        this.updateHeadings();
      })
    } else if (this.input.value != this.currentCase().slice(0, this.input.value.length)) {
      this.input.classList = 'wrong';
    } else {
      this.input.classList = '';
    }
  }

  nextWord(button) {
    button.remove();
    if (this.word < this.numWords - 1) {
      this.case = 0;
      this.word++;
      this.updateHeadings();
    } else {
      window.location.replace('/')
    }
  }

  updateHeadings() {
    document.querySelector('h1').innerHTML = this.data.name;
    document.querySelector('h2').innerHTML = this.data.words[this.word].name;
    const table = document.querySelector('table');
    table.innerHTML = '';
    for (let i = 0; i < this.case; i++) {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.innerText = this.data.headings[i];
      const td = document.createElement('td');
      td.innerText = this.data.words[this.word].cases[i];

      tr.appendChild(th)
      tr.appendChild(td)
      table.appendChild(tr);
    }

    if (this.case < this.numCases) {
      const tr = document.createElement('tr');
      const th = document.createElement('th');
      th.innerText = this.data.headings[this.case];
      tr.appendChild(th);
      tr.appendChild(this.input);

      table.appendChild(tr);
      this.input.focus();
    } else {
      const button = document.createElement('button');
      button.innerText = 'Continue'
      button.addEventListener('click', () => this.nextWord(button));
      table.insertAdjacentElement('afterend', button);

      button.focus();
    }
  }

  redraw() {

  }
}

async function main() {
  const what = new URLSearchParams(window.location.search).get('what');
  if (what) {
    const resp = await fetch(`/${what}.json`)
    const data = await resp.json();

    new DowlingLatin(data);
  } else {
    window.location.replace('/');
  }
}

document.addEventListener('DOMContentLoaded', main);
