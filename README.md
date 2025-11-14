# DNA Automation

Browser console scripts for automating Duet Night Abyss tasks. Copy, paste, run.

> **Use at your own risk.** These scripts are provided as-is for educational purposes.

## Scripts

### Survey Autofill

**File:** `scripts/survey/autofill.js`

Automatically fills out survey forms on wjx.cn with random selections.

**How to use:**

1. Go to a survey on wjx.cn
2. Open console (F12)
3. Copy and paste this code, then press Enter:

   ```javascript
   fetch(
     'https://raw.githubusercontent.com/getthevoid/dna-automation/main/scripts/survey/autofill.js'
   )
     .then(r => r.text())
     .then(eval);
   ```

### Divination Bot

**File:** `scripts/events/divination-bot.js`

Unlocks all 17 character roles in the divination event on dna-panstudio.com.

**How to use:**

1. Go to the divination event page
2. Open console (F12)
3. Copy and paste this code, then press Enter:

   ```javascript
   fetch(
     'https://raw.githubusercontent.com/getthevoid/dna-automation/main/scripts/events/divination-bot.js'
   )
     .then(r => r.text())
     .then(eval);
   ```

4. Auto-starts after 2 seconds
5. Stop with `globalThis.divinationBot.stop()`

**Roles unlocked:**
Berenica, Margie, Randy, Outsider, Daphne, Lady Nifle, Rebecca, Lynn, Sibylle, Tabethe, Lisbell, Rhythm, Hellfire, Truffle and Filbert, Yale and Oliver, Phantasio, Psyche

## Metadata

```js
const metadata = {
  name: 'dna-automation',
  version: '1.0.0',
  author: 'pyyupsk',
  license: 'MIT',
  repository: 'github.com/getthevoid/dna-automation'
};
```

## License

[MIT License](LICENSE) - Copyright (c) 2025 pyyupsk
