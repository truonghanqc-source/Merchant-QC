import type { Locator, Page } from "@playwright/test";
import { assertNotOnLoginPage, waitUntilLeftLogin } from "../../utils/navigation-helpers.ts";

/**
 * Danh sách khóa học — `/courses` (tiêu đề **Courses List**).
 * Lọc GET `form#formFilter` (tìm theo `#search`); lưới `table.table-rounded.table-striped.gy-3`.
 * (URL trong prompt `…/lession/detail` là trang thêm *lesson*, không phải list course.)
 */
export class ListCoursePage {
  readonly pageTitleH1: Locator;
  readonly formFilter: Locator;
  readonly searchInput: Locator;
  readonly filterSearchButton: Locator;
  readonly resetButton: Locator;
  readonly dataTable: Locator;
  readonly tableHeader: Locator;
  readonly tableBody: Locator;
  readonly tableBodyRows: Locator;

  constructor(public readonly page: Page) {
    this.pageTitleH1 = page.locator(".page-title h1");
    this.formFilter = page.locator("form#formFilter");
    this.searchInput = page.locator("input#search");
    this.filterSearchButton = this.formFilter.locator('button[type="submit"]');
    this.resetButton = page.locator("#btnClearFormFilter");
    this.dataTable = page.locator("table.table-rounded.table-striped.gy-3").first();
    this.tableHeader = this.dataTable.locator("thead");
    this.tableBody = this.dataTable.locator("tbody");
    this.tableBodyRows = this.dataTable.locator("tbody tr");
  }

  async goto(baseUrl: string) {
    const root = baseUrl.replace(/\/$/, "");
    await this.page.goto(`${root}/courses`, {
      waitUntil: "load",
      timeout: 90000,
    });
    await this.page.waitForLoadState("load").catch(() => null);
    await waitUntilLeftLogin(this.page);
    assertNotOnLoginPage(
      this.page,
      "Courses List: still on /login after navigation. Re-run global-setup / check LOGIN_* in .env.local.",
    );
    await this.page.waitForSelector("form#formFilter, table.table-striped", {
      state: "visible",
      timeout: 25000,
    });
  }

  async expectListShellVisible() {
    await this.pageTitleH1.waitFor({ state: "visible", timeout: 15000 });
    await this.formFilter.waitFor({ state: "visible", timeout: 15000 });
    await this.dataTable.waitFor({ state: "visible", timeout: 20000 });
    await this.tableHeader.waitFor({ state: "visible", timeout: 10000 });
    await this.tableBody.waitFor({ state: "attached", timeout: 10000 });
  }

  async submitSearch() {
    await this.filterSearchButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }

  async resetFilters() {
    await this.resetButton.click();
    await this.page.waitForLoadState("load").catch(() => null);
  }
}
