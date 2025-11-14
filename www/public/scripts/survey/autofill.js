// Verify we're on the correct website
if (!globalThis.location.hostname.includes('wjx.cn')) {
  console.error('This script only works on wjx.cn survey platform!');
  throw new Error('Invalid website - script aborted');
}

// Utility: Random integer between 0 and max-1
const randIndex = max => Math.floor(Math.random() * max);

// Utility: Get random elements from array
const getRandomElements = (arr, count) => {
  const result = [];
  const used = new Set();
  const max = Math.min(count, arr.length);

  while (result.length < max) {
    const idx = randIndex(arr.length);
    if (!used.has(idx)) {
      used.add(idx);
      result.push(arr[idx]);
    }
  }
  return result;
};

// Utility: Trigger an event
const trigger = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

console.log('🎮 DNA Survey Autofill Script');
console.log('📍 Running on:', globalThis.location.hostname);

// === MAIN SCRIPT ===
for (const field of document.querySelectorAll('.field[topic]')) {
  const type = field.getAttribute('type');

  // --- Type 3: Single-choice (radio buttons) ---
  if (type === '3') {
    const radios = field.querySelectorAll('input[type="radio"]');
    if (!radios.length) continue;

    const randomRadio = radios[randIndex(radios.length)];

    // Uncheck all radios and update UI
    for (const r of radios) {
      r.checked = false;
      const wrapper = r.closest('.jqradiowrapper');
      if (wrapper) {
        const jqradio = wrapper.querySelector('.jqradio');
        if (jqradio) jqradio.classList.remove('jqchecked');
      }
    }

    // Check selected radio and update UI
    randomRadio.checked = true;
    const selectedWrapper = randomRadio.closest('.jqradiowrapper');
    if (selectedWrapper) {
      const jqradio = selectedWrapper.querySelector('.jqradio');
      if (jqradio) jqradio.classList.add('jqchecked');
    }
    trigger(randomRadio, 'change');
  }

  // --- Type 4: Multi-choice (checkboxes) ---
  else if (type === '4') {
    const checkboxes = field.querySelectorAll('input[type="checkbox"]');
    if (!checkboxes.length) continue;

    const count = Math.floor(Math.random() * Math.min(checkboxes.length, 3)) + 1;
    const checkboxArray = Array.from(checkboxes);
    const selected = getRandomElements(checkboxArray, count);
    const selectedSet = new Set(selected);

    // Uncheck all and update only selected ones
    for (const c of checkboxes) {
      const isSelected = selectedSet.has(c);
      c.checked = isSelected;

      const wrapper = c.closest('.jqcheckwrapper');
      if (wrapper) {
        const jqcheck = wrapper.querySelector('.jqcheck');
        if (jqcheck) {
          if (isSelected) {
            jqcheck.classList.add('jqchecked');
          } else {
            jqcheck.classList.remove('jqchecked');
          }
        }
      }

      if (isSelected) trigger(c, 'change');
    }
  }

  // --- Type 6: Matrix / Rating scale ---
  else if (type === '6') {
    const rows = field.querySelectorAll('tr[tp="d"]');

    for (const row of rows) {
      const choices = row.querySelectorAll('a[dval]');
      if (!choices.length) continue;

      const randomChoice = choices[randIndex(choices.length)];
      const fid = row.getAttribute('fid');
      const input = fid ? field.querySelector(`input#${fid}`) : null;

      // Update all choices in single pass
      for (const a of choices) {
        if (a === randomChoice) {
          a.classList.remove('rate-off', 'rate-offlarge');
          a.classList.add('rate-on', 'rate-onlarge');
        } else {
          a.classList.remove('rate-on', 'rate-onlarge');
          a.classList.add('rate-off', 'rate-offlarge');
        }
      }

      if (input) {
        input.value = randomChoice.getAttribute('dval');
        trigger(input, 'input');
        trigger(input, 'change');
      }
    }
  }
}

console.log('Autofill complete!');
