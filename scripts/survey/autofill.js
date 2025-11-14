// Utility: Random integer between 0 and max-1
const randIndex = max => Math.floor(Math.random() * max);

// Utility: Shuffle an array (Fisher–Yates)
const shuffle = arr => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Utility: Trigger an event
const trigger = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

// === MAIN SCRIPT ===
document.querySelectorAll('.field[topic]').forEach(field => {
  const type = field.getAttribute('type');

  // --- Type 3: Single-choice (radio buttons) ---
  if (type === '3') {
    const radios = [...field.querySelectorAll('input[type="radio"]')];
    if (!radios.length) return;

    const randomRadio = radios[randIndex(radios.length)];

    radios.forEach(r => {
      r.checked = false;
      r.closest('.jqradiowrapper')?.querySelector('.jqradio')?.classList.remove('jqchecked');
    });

    randomRadio.checked = true;
    randomRadio.closest('.jqradiowrapper')?.querySelector('.jqradio')?.classList.add('jqchecked');
    trigger(randomRadio, 'change');
  }

  // --- Type 4: Multi-choice (checkboxes) ---
  else if (type === '4') {
    const checkboxes = [...field.querySelectorAll('input[type="checkbox"]')];
    if (!checkboxes.length) return;

    const count = Math.floor(Math.random() * Math.min(checkboxes.length, 3)) + 1;
    const selected = shuffle(checkboxes).slice(0, count);

    checkboxes.forEach(c => {
      c.checked = false;
      c.closest('.jqcheckwrapper')?.querySelector('.jqcheck')?.classList.remove('jqchecked');
    });

    selected.forEach(c => {
      c.checked = true;
      c.closest('.jqcheckwrapper')?.querySelector('.jqcheck')?.classList.add('jqchecked');
      trigger(c, 'change');
    });
  }

  // --- Type 6: Matrix / Rating scale ---
  else if (type === '6') {
    field.querySelectorAll('tr[tp="d"]').forEach(row => {
      const choices = [...row.querySelectorAll('a[dval]')];
      if (!choices.length) return;

      const randomChoice = choices[randIndex(choices.length)];
      const fid = row.getAttribute('fid');
      const input = field.querySelector(`input#${fid}`);

      choices.forEach(a => {
        a.classList.remove('rate-on', 'rate-onlarge');
        a.classList.add('rate-off', 'rate-offlarge');
      });

      randomChoice.classList.remove('rate-off', 'rate-offlarge');
      randomChoice.classList.add('rate-on', 'rate-onlarge');

      if (input) {
        input.value = randomChoice.getAttribute('dval');
        trigger(input, 'input');
        trigger(input, 'change');
      }
    });
  }
});
