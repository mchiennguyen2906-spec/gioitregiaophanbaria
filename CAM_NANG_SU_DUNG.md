# CẨM NANG HƯỚNG DẪN SỬ DỤNG WEBSITE
**GIỚI TRẺ GIÁO PHẬN BÀ RỊA VŨNG TÀU**

Kính chào Quý Cha, Quý Tu Sĩ và các bạn Trẻ, 
Đây là cuốn cẩm nang được biên soạn cực kỳ chi tiết, từng bước một (từ A đến Z) nhằm giúp mọi người có thể làm chủ và quản trị Website một cách dễ dàng nhất, ngay cả khi không rành về công nghệ máy tính.

---

## 1. SƠ ĐỒ CẤU TRÚC CỦA TRANG WEB
Trang web được chia làm 2 phần chính: **Trang cho người xem (Giao diện chính)** và **Trang quản trị (Dành cho Admin)**.

**A. Trang cho người xem:**
- **Trang Chủ:** Nơi tổng hợp các thông tin nổi bật nhất, giờ lễ, lời Chúa, thông báo quan trọng.
- **Các Chuyên Mục:** Tin tức, Giới Trẻ, Thiếu Nhi, Giáo Lý, Bác Ái, v.v. (Mỗi chuyên mục có trang riêng).
- **Tiện Ích:** Nghe Radio, Đăng ký sự kiện, Xin lễ/Cầu nguyện, Góc hỏi đáp.

**B. Trang Quản Trị (Admin):**
Đây là nơi Quý Cha và Ban Truyền Thông đăng bài. Truy cập bằng cách thêm `/admin` vào sau tên miền trang web (Ví dụ: `gioitregiaophanbaria.vn/admin`) và đăng nhập.

---

## 2. QUẢN LÝ TÀI KHOẢN VÀ PHÂN QUYỀN TRONG ADMIN
Hệ thống cho phép chia quyền rõ ràng để tránh việc người này đăng nhầm vào chuyên mục của người khác.

### 2.1. Các cấp độ quyền (Role)
1. **Super Admin (Toàn quyền):** Thường dành cho Trưởng Ban Truyền Thông hoặc Cha Đặc Trách. Nhìn thấy và sửa được mọi thứ.
2. **Category Admin (Quản lý chuyên mục):** Dành cho các trưởng ban nhỏ. Có quyền đăng bài, quản lý bài viết thuộc chuyên mục được giao (Ví dụ: Chỉ được quản lý chuyên mục Thiếu Nhi).
3. **Editor (Người viết bài):** Dành cho cộng tác viên, chỉ có thể viết bài và lưu nháp, không có quyền xóa bài của người khác.

### 2.2. Cách tạo tài khoản và phân quyền
- **Bước 1:** Trong màn hình Admin, tìm menu bên trái và nhấp vào mục **Quản lý Tài khoản**.
- **Bước 2:** Nhấp vào nút màu đỏ **+ Tạo tài khoản mới** ở góc phải phía trên.
- **Bước 3:** Nhập **Email** và **Mật khẩu** cho tài khoản mới.
- **Bước 4:** Chọn **Phân quyền (Role)** (như đã giải thích ở mục 2.1).
- **Bước 5:** Nếu chọn quyền *Category Admin* hoặc *Editor*, một bảng danh sách các chuyên mục sẽ hiện ra. Bạn hãy đánh dấu tích (✔) vào các chuyên mục muốn giao cho người này quản lý.
- **Bước 6:** Nhấn nút **Xác nhận tạo tài khoản**.

### 2.3. Khóa hoặc Xóa tài khoản
- Trong danh sách tài khoản, cột ngoài cùng bên phải (Thao tác) có các nút **Khóa / Mở khóa** và **Xóa**.
- Khi một cộng tác viên nghỉ, tốt nhất nên chọn **Khóa** thay vì Xóa, để các bài viết cũ của họ không bị mất tác giả.

---

## 3. HƯỚNG DẪN ĐĂNG BÀI VIẾT TỪ A ĐẾN Z

Đây là phần được sử dụng nhiều nhất. Từ menu bên trái, nhấp vào **Quản lý Bài Viết**, sau đó nhấp **+ Viết bài mới**.

### 3.1. Các bước điền thông tin bài viết
- **Tiêu đề bài viết:** Viết ngắn gọn, rõ ràng (Ví dụ: Đại hội Giới trẻ năm 2026).
- **Lời dẫn (Sapo):** Một đoạn ngắn khoảng 2-3 câu tóm tắt nội dung để thu hút người đọc. Đoạn này sẽ hiển thị ở trang chủ.
- **Nội dung bài viết:** Đây là khung soạn thảo chính (giống như Microsoft Word).
  - Để in đậm, in nghiêng: Bôi đen chữ và chọn biểu tượng **B** (Đậm) hoặc *I* (Nghiêng).
  - Để chèn hình vào giữa bài: Nhấn biểu tượng bức ảnh trên thanh công cụ.
  - Để chèn Video Youtube: Nhấn biểu tượng máy quay phim và dán link Youtube vào.
- **Ảnh đại diện (Thumbnail):** Phải có ảnh này thì bài viết nhìn mới đẹp. Nhấp vào nút **Chọn file** ở mục Ảnh đại diện và tải lên một bức ảnh từ máy tính hoặc điện thoại.
- **File đính kèm (Nếu có):** Nếu bài viết có kèm tài liệu (File Word, Excel, PDF), nhấn nút **📎 Chọn file...** ở dưới cùng.

### 3.2. Cơ chế Bài Nổi Bật (RẤT QUAN TRỌNG)
Khi đăng bài, ở cột bên phải có mục **⭐ Tùy chọn Hiển thị**. Đây là nơi quyết định bài viết của bạn sẽ nằm ở đâu trên trang web.

**A. Hiển thị ở Trang Con (Trong chuyên mục):**
- **Đưa lên Slider nổi bật:** Đánh dấu vào đây thì bài viết sẽ thành hình ảnh to chạy ngang ở trên cùng của trang chuyên mục đó.
- **Ghim vào danh sách Ưu tiên:** Đánh dấu vào đây, bài viết sẽ luôn nằm ở đầu danh sách dù có bài mới hơn đăng sau nó (Dành cho thông báo quan trọng).

**B. Hiển thị ở Trang Chủ Hệ Thống (Trang chính lớn nhất):**
- **Đưa ra Slider Trang Chủ (VIP):** Đây là hình ảnh to nhất, chạy ngang trên cùng ở màn hình Trang Chủ. Chỉ nên chọn tính năng này cho những Sự kiện rất lớn của toàn Giáo phận.
- **Đưa ra Bản tin Trang Chủ:** Bài viết sẽ hiển thị ở các ô tin tức nổi bật ngay bên dưới Slider Trang Chủ. Nếu không đánh dấu, bài viết sẽ chỉ nằm im lặng ở trong trang chuyên mục mà thôi.

### 3.3. Lưu và Đăng bài
- Nhấn **Lưu & Xem Trước** để xem bài viết trông như thế nào trước khi đăng thật.
- Nhấn nút màu xanh **🚀 XÁC NHẬN ĐĂNG** để đưa bài viết lên mạng.

---

## 4. HƯỚNG DẪN ĐĂNG HÌNH ẢNH, VIDEO VÀ KHÓA HỌC

- **Đăng Album (Quản lý Hình ảnh):** Dùng để đăng nhiều hình cùng một lúc (ví dụ Hình ảnh Trại Hè). Nhấp vào "Quản lý Album" -> Nhập tên Album -> Tải lên cùng lúc nhiều ảnh -> Lưu.
- **Đăng Video:** Dùng để đăng Video bài giảng, thánh ca. Nhấp vào "Quản lý Video" -> Nhập tiêu đề -> Dán đường link Youtube vào (Không tải video trực tiếp lên web để web không bị chậm) -> Lưu.
- **Khóa học / Lịch học:** Dành để đăng các khóa đào tạo Giáo lý viên, Huynh trưởng. Khi đăng, ngoài nội dung, hãy nhớ điền "Ngày bắt đầu" và "Hạn chót đăng ký" để hệ thống tự động đóng khung đăng ký khi hết hạn.

---

## 5. HƯỚNG DẪN QUẢN LÝ GIỜ LỄ VÀ LỜI CHÚA

### 5.1. Cập nhật Giờ Lễ cố định của các Giáo xứ
- Truy cập mục **Quản lý Giờ Lễ** ở thanh menu.
- Chọn tab **Dữ Liệu Gốc (Danh sách Giáo xứ)**.
- Nhấn **+ Thêm Giáo Xứ Mới**, nhập tên và địa chỉ.
- Nhấn nút **Sửa Lịch Tuần**.
- Điền giờ lễ vào đúng ô của từng ngày (Lưu ý: Phải điền theo định dạng 24h, cách nhau bằng dấu phẩy. Ví dụ: `04:30, 17:30`).
- Hệ thống sẽ tự động bốc giờ này để hiển thị ra băng chuyền "Giờ Lễ Hôm Nay" ở trang chủ.

### 5.2. Chỉnh tốc độ băng chuyền chữ chạy
- Trong mục Quản lý Giờ lễ (Tab "Giờ lễ hôm nay"), bạn sẽ thấy một **Thanh trượt Tốc độ**. Cầm chuột kéo sang trái hoặc phải để chỉnh tốc độ chạy chữ. Số càng nhỏ chữ chạy càng nhanh.
- Tương tự, trong mục **Quản lý Lời Chúa Mỗi Ngày** cũng có một thanh trượt tốc độ chạy dành riêng cho Lời Chúa.

### 5.3. Cập nhật Lời Chúa
- Truy cập mục **Quản lý Lời Chúa Mỗi Ngày**.
- Trên màn hình sẽ có sẵn 7 ô tương ứng từ Thứ Hai đến Chúa Nhật.
- Bạn chỉ việc dán **Câu Lời Chúa** và **Nguồn trích dẫn** (VD: Mt 5, 7) vào ô tương ứng.
- Nhấn **Lưu Lời Chúa** màu đỏ ở dưới cùng. Sang tuần mới, bạn lại vào đây dán đè Lời Chúa của tuần tiếp theo lên.

---

**LỜI KẾT**
> Mọi thao tác trên trang web đều được thiết kế an toàn. Nếu Quý Cha hoặc các bạn lỡ làm sai, chỉ cần chọn lại bài viết đó và ấn "Sửa" hoặc "Xóa", không ảnh hưởng đến toàn bộ hệ thống. Chúc mọi người thao tác thuận lợi và phát triển trang web thật sinh động!
