## Blaite Edu FE (AStudy) — Next.js App

Ứng dụng frontend cho nền tảng học tập Blaite Edu (tên nội bộ: AStudy), xây dựng với Next.js 15, React 19, Ant Design, TanStack Query và Tailwind CSS.

source code backend: <a href="https://github.com/PhanThanhTungg/Blaite-edu-be" target="_blank">github</a>

### Giới thiệu nhanh
- Giao diện Dashboard, Lớp học, Chủ đề (Topics) và Kiến thức (Knowledge)
- UI dựa trên Ant Design và Happy Work Theme
- State server qua TanStack Query; HTTP sử dụng Axios
- Hỗ trợ markdown và sanitization khi render nội dung

### Công nghệ chính
- Next.js 15 (App Router)
- React 19
- Ant Design 5, @ant-design/pro-components
- TanStack Query 5
- Tailwind CSS 4
- Axios
- Clerk (đã khai báo dependency, có thể dùng cho xác thực)

### Bắt đầu nhanh
```bash
# 1) Cài dependencies
npm install

# 2) Chạy dev (Turbopack)
npm run dev

# Mặc định app chạy tại http://localhost:3000
```

### Scripts hữu ích
```bash
npm run dev     # next dev --turbopack
npm run build   # next build
npm run start   # next start (sau khi build)
npm run lint    # next lint
```

### Ghi chú môi trường (ENV)
Hiện `src/config/environment.ts` chỉ đọc `NODE_ENV` để xác định chế độ dev/prod và cung cấp metadata app (name, version). Nếu tích hợp xác thực Clerk hoặc backend cụ thể, thêm các biến sau (tùy triển khai của bạn):
- `NODE_ENV` = `development` | `production`
- (Tùy chọn) `NEXT_PUBLIC_*` các biến public cho FE
- (Tùy chọn khi dùng Clerk) `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (server)

Lưu ý: Không đọc trực tiếp `process.env` rải rác; thay vào đó import từ mô-đun cấu hình khi có.

### Build & Chạy production
```bash
npm run build
npm run start
```

---

Made with ❤️ using Next.js, Ant Design, and TanStack Query.


