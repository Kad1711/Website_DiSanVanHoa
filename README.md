# 📚 Nền tảng học liệu Văn học dân gian các tộc người thiểu số

<p align="center">
  <b>Nền tảng học liệu số dành cho sinh viên Sư phạm Ngữ văn</b>
</p>

<p align="center">
  Tác phẩm • Tác giả • Dân tộc • Bản đồ số • Video • Học liệu đa phương tiện
</p>

<p align="center">
  Phát triển bởi <b>Nguyễn Khả Dương</b>
</p>

---

## 📖 Giới thiệu

**Nền tảng học liệu Văn học dân gian các tộc người thiểu số** là sản phẩm
được phát triển bởi **Nguyễn Khả Dương**, hướng đến hỗ trợ sinh viên
**Sư phạm Ngữ văn** trong quá trình học tập học phần
**Văn học dân gian các tộc người thiểu số**.

Dự án ứng dụng công nghệ Web để xây dựng một không gian học liệu số,
cho phép sinh viên tiếp cận các tác phẩm văn học dân gian gắn với
**tác giả, tộc người, không gian văn hóa và vị trí địa lý** tương ứng.

Thay vì chỉ tiếp cận tác phẩm dưới dạng văn bản, hệ thống hướng đến
việc tổ chức học liệu theo hướng trực quan và đa phương tiện thông qua
**hình ảnh, video, bản đồ số và dữ liệu văn hóa liên quan**.

---

## 🎯 Đối tượng sử dụng

- 🎓 Sinh viên **Sư phạm Ngữ văn**
- 📚 Sinh viên học học phần **Văn học dân gian các tộc người thiểu số**
- 👨‍🏫 Giảng viên và người học có nhu cầu xây dựng, khai thác học liệu
- 🔎 Người dùng quan tâm đến văn học dân gian và văn hóa các tộc người

---

# ✨ Chức năng nổi bật

## 📖 Hệ thống tác phẩm

Mỗi tác phẩm được xây dựng thành một đơn vị học liệu riêng với các thông tin:

- Tên tác phẩm
- Nội dung tác phẩm
- Tác giả / nguồn tác phẩm
- Tộc người gắn với tác phẩm
- Hình ảnh minh họa
- Địa danh liên quan
- Học liệu video
- Thông tin bổ trợ

Ví dụ:

> **Chiếc khăn Piêu** – tác phẩm gắn với văn hóa của dân tộc Thái.

---

## 🗺️ Bản đồ số văn học dân gian

Một trong những chức năng trọng tâm của hệ thống là tích hợp
**Google Maps API**.

Tác phẩm có thể được gắn với một **vị trí địa lý cụ thể** trên bản đồ,
giúp sinh viên không chỉ đọc tác phẩm mà còn xác định được
**không gian văn hóa và địa lý gắn với tác phẩm**.

```text
Tác phẩm
    │
    ├── Dân tộc
    │
    ├── Địa danh
    │
    └── Tọa độ
           │
           ▼
     Google Maps API
           │
           ▼
      📍 Bản đồ số

Điều này giúp kết nối:

Văn học → Văn hóa → Tộc người → Không gian địa lý

🎬 Học liệu đa phương tiện

Mỗi tác phẩm có thể được bổ sung học liệu trực quan:

▶️ Video từ YouTube
📤 Video tải trực tiếp từ máy
🖼️ Hình ảnh minh họa
📚 Nội dung học liệu liên quan

Video có thể được hiển thị trực tiếp trong trang tác phẩm để sinh viên
vừa đọc nội dung vừa tiếp cận tài liệu trực quan.

🛠️ Hệ thống quản lý và xuất bản

Người dùng được cấp quyền Manager có thể quản lý học liệu trên hệ thống.

Manager có thể:

➕ Tạo tác phẩm mới
✏️ Chỉnh sửa nội dung
🖼️ Thêm hình ảnh
🎬 Thêm video YouTube
📤 Upload video từ thiết bị
👥 Liên kết tác phẩm với tộc người
📍 Chọn vị trí chính xác trên bản đồ
🗺️ Gắn tọa độ thông qua Google Maps
🚀 Xuất bản tác phẩm lên nền tảng

Qua đó, hệ thống không chỉ là website đọc nội dung mà còn là một
nền tảng xây dựng và quản lý học liệu.

💬 Tương tác học tập

Sinh viên có thể tương tác trực tiếp với nội dung:

❤️ Yêu thích tác phẩm
💬 Viết bình luận / cảm nhận
📖 Trao đổi về nội dung tác phẩm
👥 Khám phá tộc người liên quan
📍 Tìm hiểu địa danh gắn với tác phẩm
💡 Giá trị giáo dục

Điểm trọng tâm của dự án là ứng dụng công nghệ để hỗ trợ một
nhu cầu học tập cụ thể của sinh viên Sư phạm Ngữ văn.

Hệ thống hướng đến việc chuyển đổi cách tiếp cận:

Tài liệu truyền thống
        ↓
     Học liệu số
        ↓
 Văn bản + Hình ảnh
        +
       Video
        +
     Bản đồ số
        +
  Không gian văn hóa
        ↓
Trải nghiệm học tập trực quan

Qua đó, sinh viên có thể tiếp cận tác phẩm văn học dân gian
không chỉ dưới góc độ văn bản mà còn trong mối quan hệ với
tộc người, văn hóa và không gian địa lý.

🛠️ Công nghệ
Frontend

React • JavaScript • HTML • CSS

Backend

Node.js • Express.js • REST API

Database

MongoDB • Mongoose

Media & Maps

Cloudinary • Google Maps API • YouTube

Deployment

Render

Development

Git • GitHub • VS Code • Postman

👨‍💻 Người phát triển

Nguyễn Khả Dương

Software Developer

Dự án được phát triển nhằm ứng dụng công nghệ vào hỗ trợ học tập
cho sinh viên Sư phạm Ngữ văn, đặc biệt trong học phần
Văn học dân gian các tộc người thiểu số.

GitHub: @Kad1711
Email: nguyenkhaduong17@gmail.com
<img width="2126" height="1536" alt="image" src="https://github.com/user-attachments/assets/79a721b7-77a3-4401-ba04-77ab19ef9c43" />
