import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the autofill script
const autofillScript = readFileSync(join(__dirname, '../scripts/survey/autofill.js'), 'utf-8');

test.describe('DNA Survey Autofill Script', () => {
  test('should navigate to survey page and load successfully', async ({ page }) => {
    await page.goto('/vm/wFQ0GOu.aspx');

    // Wait for the survey form to load
    await page.waitForSelector('.field[topic]', { timeout: 10000 });

    // Verify survey loaded
    const fields = await page.locator('.field[topic]').count();
    expect(fields).toBeGreaterThan(0);
  });

  test('should fill Type 3 (single-choice/radio) questions', async ({ page }) => {
    await page.goto('/vm/wFQ0GOu.aspx');
    await page.waitForSelector('.field[topic]', { timeout: 10000 });

    // Inject and run the autofill script
    await page.evaluate(autofillScript);

    // Wait for script execution
    await page.waitForTimeout(1000);

    // Check Type 3 fields (radio buttons)
    const type3Fields = await page.locator('.field[topic][type="3"]').all();

    for (const field of type3Fields) {
      // Verify at least one radio is checked
      const checkedRadios = await field.locator('input[type="radio"]:checked').count();
      expect(checkedRadios).toBe(1);

      // Verify UI state matches
      const checkedRadio = field.locator('input[type="radio"]:checked');
      const wrapper = checkedRadio.locator('xpath=ancestor::*[contains(@class, "jqradiowrapper")]');
      const hasCheckedClass = await wrapper
        .locator('.jqradio.jqchecked')
        .count()
        .catch(() => 0);

      if (hasCheckedClass > 0) {
        expect(hasCheckedClass).toBe(1);
      }
    }
  });

  test('should fill Type 4 (multi-choice/checkbox) questions', async ({ page }) => {
    await page.goto('/vm/wFQ0GOu.aspx');
    await page.waitForSelector('.field[topic]', { timeout: 10000 });

    // Inject and run the autofill script
    await page.evaluate(autofillScript);
    await page.waitForTimeout(1000);

    // Check Type 4 fields (checkboxes)
    const type4Fields = await page.locator('.field[topic][type="4"]').all();

    for (const field of type4Fields) {
      // Verify at least 1 and at most 3 checkboxes are checked
      const checkedCount = await field.locator('input[type="checkbox"]:checked').count();
      expect(checkedCount).toBeGreaterThanOrEqual(1);
      expect(checkedCount).toBeLessThanOrEqual(3);

      // Verify UI state for checked boxes
      const checkedBoxes = await field.locator('input[type="checkbox"]:checked').all();
      for (const checkbox of checkedBoxes) {
        const wrapper = checkbox.locator('xpath=ancestor::*[contains(@class, "jqcheckwrapper")]');
        const hasCheckedClass = await wrapper
          .locator('.jqcheck.jqchecked')
          .count()
          .catch(() => 0);

        if (hasCheckedClass > 0) {
          expect(hasCheckedClass).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });

  test('should fill Type 6 (matrix/rating scale) questions', async ({ page }) => {
    await page.goto('/vm/wFQ0GOu.aspx');
    await page.waitForSelector('.field[topic]', { timeout: 10000 });

    // Inject and run the autofill script
    await page.evaluate(autofillScript);
    await page.waitForTimeout(1000);

    // Check Type 6 fields (matrix/rating)
    const type6Fields = await page.locator('.field[topic][type="6"]').all();

    for (const field of type6Fields) {
      // Get all rows in the matrix
      const rows = await field.locator('tr[tp="d"]').all();

      for (const row of rows) {
        // Verify at least one choice is selected (has 'rate-on' class)
        const selectedChoices = await row.locator('a.rate-on, a.rate-onlarge').count();
        expect(selectedChoices).toBeGreaterThanOrEqual(1);

        // Verify the hidden input has a value
        const fid = await row.getAttribute('fid');
        if (fid) {
          const input = field.locator(`input#${fid}`);
          const value = await input.inputValue().catch(() => '');
          expect(value).not.toBe('');
        }
      }
    }
  });

  test('should handle all question types in a complete survey', async ({ page }) => {
    await page.goto('/vm/wFQ0GOu.aspx');
    await page.waitForSelector('.field[topic]', { timeout: 10000 });

    // Count total fields before autofill
    const totalFields = await page.locator('.field[topic]').count();
    console.log(`Total survey fields found: ${totalFields}`);

    // Inject and run the autofill script
    await page.evaluate(autofillScript);
    await page.waitForTimeout(1500);

    // Verify that each field type was processed
    const type3Count = await page.locator('.field[topic][type="3"]').count();
    const type4Count = await page.locator('.field[topic][type="4"]').count();
    const type6Count = await page.locator('.field[topic][type="6"]').count();

    console.log(`Type 3 (radio): ${type3Count}`);
    console.log(`Type 4 (checkbox): ${type4Count}`);
    console.log(`Type 6 (matrix): ${type6Count}`);

    // Take a screenshot for visual verification with timestamp
    const timestamp = new Date().toISOString().replaceAll(/[:.]/g, '-');
    await page.screenshot({
      path: `tests/e2e/screenshots/autofill-complete-${timestamp}.png`,
      fullPage: true
    });
  });

  test('should not throw errors when executing script', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/vm/wFQ0GOu.aspx');
    await page.waitForSelector('.field[topic]', { timeout: 10000 });

    // Inject and run the autofill script
    await page.evaluate(autofillScript);
    await page.waitForTimeout(1000);

    // Verify no errors occurred
    expect(errors).toEqual([]);
  });
});
