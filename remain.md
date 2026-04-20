# Playwright — Hướng dẫn vận hành

## Cấu trúc thư mục

```
pages/              # Page Object classes theo module
tests/              # Playwright spec files
fixtures/           # Shared fixtures (authenticatedPage, baseUrl)
test-data/          # Dữ liệu test tĩnh
playwright/         # Auth state session (.auth/)
playwright-report/  # HTML report (tự sinh sau khi chạy)
test-results/       # Screenshot, trace, video khi fail
.env.local          # Biến môi trường local (không commit)
```

---

## Cấu hình môi trường (.env.local)

```env
BASE_URL=https://your-merchant-url
LOGIN_USER_ADMIN=your_admin_user
LOGIN_PASS_ADMIN=your_admin_pass
LOGIN_USER_MERCHANT=your_merchant_user
LOGIN_PASS_MERCHANT=your_merchant_pass
```

> **Lưu ý:** `.env.local` không được commit lên Git. File này dùng cho local và Docker Compose.

---

## Chạy test — Local

**Toàn bộ suite:**

```bash
npx playwright test
```

**Theo module:**

```bash
npx playwright test tests/auth/
npx playwright test tests/quotation/
npx playwright test tests/pgpb/
```

**Theo tag:**

```bash
npx playwright test --grep @smoke
npx playwright test --grep @regression
```

**Nhiều workers (nhanh hơn):**

```bash
npx playwright test --workers=20
```

**Debug 1 file (hiện browser):**

```bash
npx playwright test tests/pgpb/create-pg-staff.spec.ts --headed --workers=1
```

**Giao diện UI runner:**

```bash
npx playwright test --ui
```

---

## Xem report

```bash
npx playwright show-report
```

Hoặc mở trực tiếp:

```bash
open playwright-report/index.html
```

---

## Chạy test — Docker Compose

> Dùng khi muốn chạy giống môi trường CI hoặc trước khi merge.
> Biến môi trường tự nạp từ `.env.local`.

**Lần đầu hoặc khi thay đổi `Dockerfile` / `package.json` — build image trước:**

```bash
docker compose build
```

**Build sạch hoàn toàn:**

```bash
docker compose build --no-cache
```

**Chạy full suite:**

```bash
docker compose up --abort-on-container-exit
```

> `--abort-on-container-exit`: khi container test kết thúc thì dừng toàn bộ stack và trả terminal về tự động. Bắt buộc có flag này trong CI.

**Chạy theo module:**

```bash
TEST_ARGS="tests/auth/" docker compose up --abort-on-container-exit
```

**Chạy theo tag:**

```bash
TEST_ARGS="--grep @smoke" docker compose up --abort-on-container-exit
```

**Chạy module + tag + workers:**

```bash
TEST_ARGS="tests/quotation/ --grep @smoke --workers=4" docker compose up --abort-on-container-exit
```

**Xem report sau khi chạy xong:**

```bash
open playwright-report/index.html
```

**Dọn container:**

```bash
docker compose down
```

> Sau `docker compose down`, chỉ cần `docker compose up --abort-on-container-exit` để chạy lại — không cần build lại.

---

## Khi nào cần build lại Docker image

| Thay đổi                                 | Cần build lại? |
| ---------------------------------------- | -------------- |
| Chỉnh sửa test / page object             | Không          |
| Thêm/xóa dependency trong `package.json` | Có             |
| Sửa `Dockerfile`                         | Có             |
| Lần đầu tiên chưa có image               | Có             |

---

## Scripts có sẵn (package.json)

```bash
npm test                  # chạy full suite
npm run test:smoke        # chạy theo tag @smoke
npm run test:regression   # chạy theo tag @regression
npm run test:auth         # chạy module auth
npm run test:pg           # chạy module pgpb
npm run test:quotation    # chạy module quotation
npm run test:headed       # chạy có browser
npm run test:ui           # mở UI runner
npm run test:report       # mở HTML report
```

---

## Kiểm tra TypeScript

```bash
npx tsc --noEmit
```

---

## Xử lý khi test chậm hoặc timeout

- Tăng timeout ở test level:
  ```ts
  test.describe.configure({ timeout: 120_000 });
  ```
- Tăng timeout navigation trong `playwright.config.js`:
  ```ts
  navigationTimeout: 60000;
  ```
- Thêm wait load state khi cần:
  ```ts
  await page.waitForLoadState("load");
  ```
