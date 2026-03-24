# TASKS

## Quy ước làm việc

- Mỗi lần bắt đầu một task, phải đọc lại file `TASKS.md`.
- Chỉ triển khai theo đúng yêu cầu ghi trong file này.
- Mỗi task có trạng thái: `todo`, `in_progress`, `done`, `blocked`.
- Khi bắt đầu làm task, đổi trạng thái sang `in_progress`.
- Khi hoàn thành, đổi trạng thái sang `done`.
- Nếu vướng, đổi trạng thái sang `blocked` và ghi rõ lý do.

## Mục tiêu sản phẩm

- Ưu tiên 1: Tạo user và user profile.
- Ưu tiên 2: Tìm kiếm người khác kiểu Tinder, không realtime scan.
- Chỉ user opt-in mới xuất hiện trong discovery.
- Cơ chế match: mutual like.
- Phạm vi discovery MVP: cùng campus.

## Task backlog

| ID | Task | Trạng thái | Ghi chú |
| --- | --- | --- | --- |
| T01 | Thiết kế schema auth OTP + profile + discovery | done | Đã thêm migration SQL và cập nhật type database |
| T02 | Implement đăng ký email/password + gửi OTP qua Web3Forms | done | Đã thêm auth action register và request OTP |
| T03 | Implement verify OTP và chặn login khi chưa verify | done | Đã verify OTP, update profile, chặn login nếu chưa verify |
| T04 | Tạo onboarding/edit user profile | done | Đã tạo trang profile và form chỉnh sửa |
| T05 | Thêm opt-in discovery trong profile/settings | done | Đã thêm cờ discovery_opt_in trong profile form |
| T06 | Tạo API/actions discovery cùng campus | done | Đã filter cùng campus, opt-in, exclude self |
| T07 | Tạo Like/Pass và tạo match khi mutual like | done | Đã upsert swipe và tạo match unique pair |
| T08 | Xây UI danh sách discovery + xem detail user | done | Đã tạo trang discover với list, detail, like/pass |
| T09 | Kiểm thử end-to-end cho luồng auth/profile/discovery | done | Đã chạy kiểm tra lint theo file thay đổi và rà soát luồng |

## Cập nhật thực thi

- Mỗi lần làm xong task, thêm một dòng log ở đây theo format:
  - `YYYY-MM-DD HH:mm | Task ID | trạng thái | ghi chú ngắn`
- `2026-03-24 10:20 | T01 | done | Them migration OTP, profile, swipes, matches`
- `2026-03-24 10:28 | T02 | done | Them register va request OTP qua Web3Forms`
- `2026-03-24 10:35 | T03 | done | Them verify OTP va chan login chua verify`
- `2026-03-24 10:42 | T04 | done | Tao trang profile va form cap nhat thong tin`
- `2026-03-24 10:46 | T05 | done | Them opt-in discovery trong profile`
- `2026-03-24 10:50 | T06 | done | Tao action discovery filter cung campus`
- `2026-03-24 10:55 | T07 | done | Them like/pass va tao match khi mutual like`
- `2026-03-24 11:00 | T08 | done | Tao UI discover list va xem detail user`
- `2026-03-24 11:06 | T09 | done | Kiem tra lint cho cac file da sua`
- `2026-03-24 11:22 | T02 | done | Chuyen gui OTP tu Web3Forms sang Nodemailer SMTP`
- `2026-03-24 12:05 | T02 | done | Doi flow dang ky submit username password otp email va switch login/register`
- `2026-03-24 12:28 | T02 | done | Tach man signin signup otp success theo luong moi`
