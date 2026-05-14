import { test, expect, Page } from '@playwright/test';

test.describe('WYSIWYG Editor', () => {
  test.setTimeout(120000); // Allow time for Next.js first compile

  async function openEditor(page: Page) {
    await page.goto('/test-wysiwyg');
    // Wait for the editor modal to open (it opens on page load)
    await page.waitForSelector('div[contenteditable]', { timeout: 60000 });
  }

  // ─── SUITE 1: Math rendering ────────────────────────────────────────────────
  test('renders inline math as KaTeX, not raw code', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();
    await expect(editorNode).toBeVisible();

    // Raw code should NOT be visible as plain text
    const rawText = await editorNode.innerText();
    expect(rawText).not.toContain('$x^2 + y^2 = z^2$');

    // Math should be rendered by KaTeX (katex__html span)
    const katexSpan = editorNode.locator('span.math-node').first();
    await expect(katexSpan).toBeVisible();

    // data-raw attribute must carry the original LaTeX
    const raw = await katexSpan.getAttribute('data-raw');
    expect(raw).toBe('$x^2 + y^2 = z^2$');
  });

  // ─── SUITE 2: Bold markdown rendering ───────────────────────────────────────
  test('renders bold markdown as <strong>, not raw **text**', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();

    // Raw ** should not be visible
    const rawText = await editorNode.innerText();
    expect(rawText).not.toContain('**bold**');

    // <strong> must exist and contain the correct text
    const bold = editorNode.locator('strong').first();
    await expect(bold).toBeVisible();
    await expect(bold).toHaveText('bold');

    // data-raw should carry the original markdown
    const rawAttr = await bold.getAttribute('data-raw');
    expect(rawAttr).toBe('**bold**');
  });

  // ─── SUITE 3: Inline math is not editable (contenteditable=false) ───────────
  test('math spans have contenteditable=false to prevent accidental edits', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();
    const mathSpan = editorNode.locator('span.math-node').first();
    await expect(mathSpan).toBeVisible();

    const ceAttr = await mathSpan.getAttribute('contenteditable');
    expect(ceAttr).toBe('false');
  });

  // ─── SUITE 4: Double-click on math reveals raw text ─────────────────────────
  test('double-clicking a math node reveals raw LaTeX text for editing', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();
    const mathSpan = editorNode.locator('span.math-node').first();
    await expect(mathSpan).toBeVisible();

    // Double-click to expose raw text
    await mathSpan.dblclick();

    // After double-click, the span is replaced by raw text
    // The editable div should now contain the raw LaTeX
    const innerText = await editorNode.innerText();
    expect(innerText).toContain('$x^2 + y^2 = z^2$');

    // The math-node span should no longer exist (replaced by text)
    const mathNodeCount = await editorNode.locator('span.math-node').count();
    expect(mathNodeCount).toBe(0);
  });

  // ─── SUITE 5: Plain text typing works correctly ──────────────────────────────
  test('typing plain text works without interference from math nodes', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();
    await expect(editorNode).toBeVisible();

    // Move focus to end of editable area and type
    await editorNode.click();
    await page.keyboard.press('End');
    await page.keyboard.type(' appended text');

    // Text should appear in the editor
    const innerText = await editorNode.innerText();
    expect(innerText).toContain('appended text');
  });

  // ─── SUITE 6: Save button closes editor ─────────────────────────────────────
  test('clicking Save closes the editor modal', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();
    await expect(editorNode).toBeVisible();

    // Click the Save button
    const saveBtn = page.locator('button:has-text("Save changes")');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();

    // Modal should close — contenteditable div should disappear
    await expect(editorNode).not.toBeVisible({ timeout: 5000 });
  });

  // ─── SUITE 7: Cancel button closes editor ───────────────────────────────────
  test('clicking the Cancel button closes the editor modal', async ({ page }) => {
    await openEditor(page);

    const editorNode = page.locator('div[contenteditable]').first();
    await expect(editorNode).toBeVisible();

    // The modal is already open — click Cancel to dismiss
    const cancelBtn = page.locator('button:has-text("Cancel")');
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();

    // Modal should be gone
    await expect(editorNode).not.toBeVisible({ timeout: 5000 });
  });
});
