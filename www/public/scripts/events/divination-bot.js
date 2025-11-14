// Verify we're on the correct website
if (!globalThis.location.hostname.includes('dna-panstudio.com')) {
  console.error('This script only works on dna-panstudio.com!');
  throw new Error('Invalid website - script aborted');
}

(() => {
  // Constants
  const BASE_URL = 'https://duetnightabyss.dna-panstudio.com';
  const DELAY = 1000;
  const TOTAL_ROLES = 17;

  // Known answer keys for each role
  const ROLE_ANSWERS = [
    { name: 'Berenica', answers: [82, 17, 1, 36, 3, 44, 62, 86] },
    { name: 'Margie', answers: [25, 93, 99, 59, 79, 64, 95, 97] },
    { name: 'Randy', answers: [32, 70, 67, 75, 69, 16, 66, 42] },
    { name: 'Outsider', answers: [54, 71, 84, 100, 45, 30, 54, 79] },
    { name: 'Daphne', answers: [26, 24, 82, 94, 37, 28, 44, 34] },
    { name: 'Lady Nifle', answers: [46, 23, 29, 11, 3, 5, 72, 90] },
    { name: 'Rebecca', answers: [77, 23, 88, 73, 4, 21, 36, 71] },
    { name: 'Lynn', answers: [16, 92, 43, 35, 33, 49, 15, 41] },
    { name: 'Sibylle', answers: [1, 56, 92, 49, 76, 59, 100, 12] },
    { name: 'Tabethe', answers: [8, 47, 51, 51, 80, 9, 79, 88] },
    { name: 'Lisbell', answers: [43, 17, 82, 65, 34, 8, 94, 44] },
    { name: 'Rhythm', answers: [44, 17, 71, 16, 42, 55, 22, 61] },
    { name: 'Hellfire', answers: [5, 27, 46, 7, 20, 11, 2, 95] },
    { name: 'Truffle and Filbert', answers: [99, 3, 45, 46, 33, 79, 24, 89] },
    { name: 'Yale and Oliver', answers: [46, 1, 30, 91, 68, 59, 46, 54] },
    { name: 'Phantasio', answers: [80, 4, 45, 75, 81, 7, 96, 27] },
    { name: 'Psyche', answers: [6, 54, 14, 77, 61, 54, 6, 69] }
  ];

  // State
  let isRunning = false;
  let successfulUnlocks = 0;
  let failedAttempts = 0;

  // Utilities
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const answersToFormData = answers =>
    Object.fromEntries(answers.map((val, i) => [`answer${i + 1}`, val]));

  const countUnlockedRoles = userData =>
    Array.from({ length: TOTAL_ROLES }, (_, i) => userData[`role${i + 1}`] === 1).filter(Boolean)
      .length;

  const getUnlockedRoles = userData =>
    Array.from({ length: TOTAL_ROLES }, (_, i) => i + 1).filter(i => userData[`role${i}`] === 1);

  // API functions
  const submitDivination = async formData => {
    try {
      const params = new URLSearchParams(formData);
      const response = await fetch(`${BASE_URL}/wedge/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      if (response.ok) {
        const data = await response.json();
        if (data.code === 0) return data.data;
        console.error('API error:', data.msg || 'Unknown');
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
    return null;
  };

  const getUserInfo = async () => {
    try {
      const response = await fetch(`${BASE_URL}/wedge/get-user-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 0) return data.data;
        console.error('API error:', data.msg || 'Unknown');
      }
    } catch (error) {
      console.error('Request failed:', error);
    }
    return null;
  };

  // Helper functions for run()
  const logInitialStatus = (unlockedCount, unlockedRoles, lockedRoles) => {
    console.log(`Initial: ${unlockedCount}/${TOTAL_ROLES} unlocked`);
    console.log(`Unlocked: [${unlockedRoles.join(', ')}]`);
    console.log(`Locked: [${lockedRoles.join(', ')}]`);
    console.log('-'.repeat(50));
  };

  const handleUnlockResult = async (result, unlockedCount) => {
    const userInfo = await getUserInfo();
    if (!userInfo) return unlockedCount;

    const newCount = countUnlockedRoles(userInfo);
    if (newCount > unlockedCount) {
      successfulUnlocks++;
      console.log(`Unlocked: ${result.role_name} (${newCount}/${TOTAL_ROLES})`);
      return newCount;
    }

    console.log(`Duplicate: ${result.role_name}`);
    return unlockedCount;
  };

  const tryUnlockRole = async (role, unlockedCount) => {
    console.log(`\nTrying: ${role.name}`);
    const result = await submitDivination(answersToFormData(role.answers));

    if (result) return await handleUnlockResult(result, unlockedCount);

    failedAttempts++;
    console.log('Failed');
    return unlockedCount;
  };

  const logSummary = async () => {
    const final = await getUserInfo();
    if (!final) return;

    const count = countUnlockedRoles(final);
    console.log('\n' + '-'.repeat(50));
    console.log(
      `Finished: ${count}/${TOTAL_ROLES} | New: ${successfulUnlocks} | Failed: ${failedAttempts}`
    );
    if (count >= TOTAL_ROLES) console.log('All unlocked!');
    console.log('-'.repeat(50));
  };

  // Main bot function
  const run = async () => {
    if (isRunning) {
      console.log('Already running');
      return;
    }

    isRunning = true;
    console.log('DNA Divination Bot');
    console.log('Running on:', globalThis.location.hostname);
    console.log('-'.repeat(50));

    const initialUserInfo = await getUserInfo();
    if (!initialUserInfo) {
      console.error('Failed to get user info');
      isRunning = false;
      return;
    }

    let unlockedCount = countUnlockedRoles(initialUserInfo);
    const unlockedRoles = getUnlockedRoles(initialUserInfo);
    const lockedRoles = Array.from({ length: TOTAL_ROLES }, (_, i) => i + 1).filter(
      i => !unlockedRoles.includes(i)
    );

    logInitialStatus(unlockedCount, unlockedRoles, lockedRoles);

    for (const [i, role] of ROLE_ANSWERS.entries()) {
      if (!isRunning) break;

      if (unlockedRoles.includes(i + 1)) {
        console.log(`Skip: ${role.name}`);
        continue;
      }

      unlockedCount = await tryUnlockRole(role, unlockedCount);
      if (i < ROLE_ANSWERS.length - 1) await sleep(DELAY);
    }

    await logSummary();
    isRunning = false;
  };

  const stop = () => {
    console.log('Stopping...');
    isRunning = false;
  };

  // Expose to global
  globalThis.divinationBot = { run, stop };

  console.log('Divination Bot loaded. Starting in 2s... (divinationBot.stop() to abort)');

  // Auto-start
  setTimeout(() => run(), 2000);
})();
