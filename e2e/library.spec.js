import { test, expect } from '@playwright/test';

test('demo sign-in opens the dashboard and renders the catalog', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/');
  await page.locator('.btn-fill-demo:visible').first().click();
  await page.locator('#login-form .auth-btn-submit').click();
  await page.waitForURL('**/dashboard.html', { timeout: 10_000 });

  await expect(page.locator('#user-session-bar')).toContainText('John Smith');
  await expect(page.locator('.book-card')).toHaveCount(20);
  expect(pageErrors).toEqual([]);
});

test('auth tabs remain operable after loading the page-curl effect', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/');
  await page.getByRole('tab', { name: 'Register' }).click();
  await expect(page.locator('#tab-signup')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#tab-login')).toHaveAttribute('aria-selected', 'false');
  expect(pageErrors).toEqual([]);
});

test('page-turn effect keeps an interactive frame loop in Chromium', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.getElementById('book-curl-canvas')?.dataset.pageCurlReady === 'true');
  const measurement = await page.evaluate(() => new Promise((resolve) => {
    const startedAt = performance.now();
    let frames = 0;
    const duration = 900;
    const measure = (time) => {
      frames += 1;
      if (time - startedAt >= duration) {
        const canvas = document.getElementById('book-curl-canvas');
        const gl = canvas && (canvas.getContext('webgl2') || canvas.getContext('webgl'));
        const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
        const renderer = gl
          ? gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || gl.RENDERER)
          : 'WebGL unavailable';
        resolve({ fps: Math.round(frames * 1000 / (time - startedAt)), renderer });
        return;
      }
      requestAnimationFrame(measure);
    };
    requestAnimationFrame(measure);
    document.getElementById('tab-signup').click();
  }));
  console.info(`Page-curl smoke measurement: ${measurement.fps} RAF fps; renderer: ${measurement.renderer}`);
  test.skip(/swiftshader|llvmpipe|software/i.test(measurement.renderer), 'Headless software WebGL cannot verify the 60 FPS hardware-rendering target');
  expect(measurement.fps).toBeGreaterThan(30);
});

test('auth page fits the responsive reference viewports without horizontal overflow', async ({ page }) => {
  const viewports = [
    { width: 360, height: 740 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.locator('#tab-login')).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    expect(dimensions.content, `horizontal overflow at ${viewport.width}x${viewport.height}`)
      .toBeLessThanOrEqual(dimensions.viewport + 1);

    const authScreenshot = viewport.width === 360
      ? 'test-results/auth-phone.png'
      : viewport.width === 768
        ? 'test-results/auth-tablet.png'
        : viewport.width === 1440 ? 'test-results/auth-desktop.png' : null;
    if (authScreenshot) await page.screenshot({ path: authScreenshot, fullPage: true });
    if (viewport.width === 360) {
      await page.screenshot({ path: 'test-results/auth-phone-viewport.png' });
    }

    await page.goto('/dashboard.html?guest=true');
    await expect(page.locator('.book-card')).toHaveCount(20);
    if (viewport.width === 360) {
      const nav = page.locator('.nav-tabs');
      await nav.evaluate((element) => { element.scrollLeft = element.scrollWidth; });
      await expect(page.locator('#user-session-bar a[href="index.html#login"]')).toBeInViewport();
    }
    const dashboardDimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth
    }));
    const overflowElements = await page.locator('body *').evaluateAll((elements) => elements
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return { tag: element.tagName, className: String(element.className), right: Math.round(rect.right), width: Math.round(rect.width) };
      })
      .filter((element) => element.right > window.innerWidth + 2)
      .slice(0, 8));
    if (viewport.width === 1440) await page.screenshot({ path: 'test-results/dashboard-desktop.png', fullPage: true });
    if (viewport.width === 360) await page.screenshot({ path: 'test-results/dashboard-phone-viewport.png' });
    expect(dashboardDimensions.content, `dashboard horizontal overflow at ${viewport.width}x${viewport.height}; ${JSON.stringify(overflowElements)}`)
      .toBeLessThanOrEqual(dashboardDimensions.viewport + 1);

    if (viewport.width === 360 || viewport.width === 1440) {
      const dashboardScreenshot = viewport.width === 360
        ? 'test-results/dashboard-phone.png'
        : 'test-results/dashboard-desktop.png';
      await page.screenshot({ path: dashboardScreenshot, fullPage: true });
    }
  }
});
