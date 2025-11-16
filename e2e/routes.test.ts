import { expect, test } from '@playwright/test';

test('404 page works as expected', async ({ page }) => {
	await page.goto('/random-route-not-found');
	await expect(page.locator('#page-not-found')).toBeVisible();
});

test('Root route works as expected', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('#root-route')).toBeVisible();
});

test('Overwritten route works as expected', async ({ page }) => {
	await page.goto('/overwritten-route');
	await expect(page.locator('#overwritten-route-2')).toBeVisible();
});

test('Link component works', async ({ page }) => {
	await page.goto('/links/component/start');
	await page.locator('#go-to-finish').click();

	await expect(page.locator('#links-component-finish')).toBeVisible();
	await expect(page).toHaveURL('/links/component/finish');

	await page.goBack();
	await expect(page.locator('#links-component-start')).toBeVisible();
});

test('Link attachment works', async ({ page }) => {
	await page.goto('/links/attachment/start');
	await page.locator('#go-to-finish').click();

	await expect(page.locator('#links-attachment-finish')).toBeVisible();
	await expect(page).toHaveURL('/links/attachment/finish');

	await page.goBack();
	await expect(page.locator('#links-attachment-start')).toBeVisible();
});

test('Simple layout works', async ({ page }) => {
	await page.goto('/layout/child-1');
	await expect(page.locator('#layout')).toBeVisible();
	await expect(page.locator('#child-1')).toBeVisible();

	await page.goto('/layout/child-2');
	await expect(page.locator('#layout')).toBeVisible();
	await expect(page.locator('#child-2')).toBeVisible();

	await page.goto('/layout/');
	await expect(page.locator('#layout-root')).toBeVisible();
});

test('Nested layout works', async ({ page }) => {
	await page.goto('/layout-nested');
	await expect(page.locator('#nested-layout-root')).toBeVisible();
	await expect(page.locator('#layout-nested')).toBeVisible();

	await page.goto('/layout-nested/nested-child');
	await expect(page.locator('#nested-child-1')).toBeVisible();
	await expect(page.locator('#layout-nested')).toBeVisible();

	await page.goto('/layout-nested/nested/');
	await expect(page.locator('#nested-layout-root-2')).toBeVisible();
	await expect(page.locator('#layout-nested')).toBeVisible();

	await page.goto('/layout-nested/nested/nested-child-2');
	await expect(page.locator('#nested-child-2')).toBeVisible();
	await expect(page.locator('#layout-nested')).toBeVisible();

	await page.goto('/layout-nested/param/value1');
	await expect(page.locator('#nested-layout-route-param')).toBeVisible();
	await expect(page.locator('#layout-nested')).toBeVisible();
	await expect(page.locator('#nested-layout-root-3')).toBeVisible();
	await expect(page.locator('#route-param-id')).toHaveText('value1');

	await page.goto('/layout-nested/param/value1/nested-child-3');
	await expect(page.locator('#nested-layout-route-param')).toBeVisible();
	await expect(page.locator('#layout-nested')).toBeVisible();
	await expect(page.locator('#nested-child-3')).toBeVisible();
	await expect(page.locator('#route-param-id')).toHaveText('value1');
});

test('Query parameters work', async ({ page }) => {
	await page.goto('/query-params?param1=value1&param2=value2');
	await expect(page.locator('#param-param1')).toHaveText('param1:value1');
	await expect(page.locator('#param-param2')).toHaveText('param2:value2');
});

test('Route parameters work', async ({ page }) => {
	await page.goto('/route-params/value1/value2');
	await expect(page.locator('#route-params')).toBeVisible();
	await expect(page.locator('#route-params-fallback')).not.toBeVisible();
	await expect(page.locator('#param1')).toHaveText('value1');
	await expect(page.locator('#param2')).toHaveText('value2');

	await page.goto('/route-params');
	await expect(page.locator('#route-params')).not.toBeVisible();
	await expect(page.locator('#route-params-fallback')).toBeVisible();
});

test('Persistent layout works', async ({ page }) => {
	await page.goto('/persistence/1');
	await expect(page.locator('#persistence-layout')).toBeVisible();
	await expect(page.locator('#persistence-1')).toBeVisible();
	await expect(page.locator('#persistence-404')).not.toBeVisible();
	await page.locator('#persistence-increment').click();

	await page.locator('#persistence-go-to-2').click();
	await expect(page.locator('#persistence-layout')).toBeVisible();
	await expect(page.locator('#persistence-2')).toBeVisible();
	await expect(page.locator('#persistence-404')).not.toBeVisible();
	await expect(page.locator('#persistence-value')).toHaveText("1");

	await page.goto('/persistence/non-existent');
	await expect(page.locator('#persistence-layout')).toBeVisible();
	await expect(page.locator('#persistence-404')).toBeVisible();
});