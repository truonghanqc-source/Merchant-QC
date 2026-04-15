import { ListReturnPage } from "../../pages/returnproduct/ListReturn.ts";
import { test, expect } from "../../fixtures/index.ts";

test.describe("Return products — list (/return-product)", () => {
  test.describe.configure({ timeout: 90 * 1000 });

  /**
   * Nghiệp vụ (map UI — không có tài liệu PDF trong repo):
   * - Xem danh sách yêu cầu trả hàng; lọc theo vendor, kiểu tìm (SKU/…), từ khóa, brand, trạng thái, khu vực, kho.
   * - Search (GET) cập nhật danh sách; Reset xóa filter; Download (không bấm trong E2E để tránh file).
   *
   * Kịch bản:
   * - Smoke: URL, tiêu đề, form + bảng.
   * - Regression: cột bảng đúng nghiệp vụ trả hàng.
   * - Regression: Search giữ shell và vẫn ở `/return-product`.
   * - Regression: các control filter chính + nút Download hiển thị.
   * - Edge: Reset không làm vỡ shell.
   */

  test("TC01 - Navigate — URL, title, filter and results grid @smoke", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListReturnPage(authenticatedPage.page);

    await list.goto(baseUrl);

    await expect(authenticatedPage.page).toHaveURL(/\/return-product(\?|$)/i);
    await list.expectListShellVisible();
    await expect(list.pageTitleH1).toHaveText(/Return Product/i);
    await expect(list.searchInput).toBeVisible();
    await expect(list.vendorSelect).toBeAttached();
    await expect(list.filterSearchButton).toBeVisible();
  });

  test("TC02 - Results table lists return-request columns @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListReturnPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    const headerText = await list.tableHeader.innerText();
    expect(headerText).toMatch(/Product/i);
    expect(headerText).toMatch(/Request Name/i);
    expect(headerText).toMatch(/Quantity|Stock/i);
    expect(headerText).toMatch(/Request Date/i);
    expect(headerText).toMatch(/Vendor/i);
    expect(headerText).toMatch(/Status/i);
    expect(headerText).toMatch(/Action/i);
  });

  test("TC03 - Search with current filters keeps shell @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListReturnPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.submitSearch();

    await list.expectListShellVisible();
    await expect(list.dataTable).toBeVisible();
  });

  test("TC04 - Filter controls — search mode, status, export entrypoint @regression", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListReturnPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    expect(
      await list.searchTypeSelect.locator("option").count(),
    ).toBeGreaterThan(0);
    expect(await list.statusSelect.locator("option").count()).toBeGreaterThan(
      0,
    );
    await expect(list.brandSelect).toBeAttached();
    await expect(list.citySelect).toBeAttached();
    await expect(list.stockSelect).toBeAttached();
    await expect(list.downloadButton).toBeVisible();
  });

  test("TC05 - Reset keeps list shell @edge", async ({
    authenticatedPage,
    baseUrl,
  }) => {
    const list = new ListReturnPage(authenticatedPage.page);
    await list.goto(baseUrl);
    await list.expectListShellVisible();

    await list.resetFilters();

    await list.expectListShellVisible();
  });
});


