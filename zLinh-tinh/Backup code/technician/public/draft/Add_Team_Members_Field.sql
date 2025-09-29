-- Thêm trường team_members vào bảng jobs để lưu thông tin người làm cùng
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS team_members text; -- Lưu danh sách tên người làm cùng, cách nhau bởi dấu phẩy

-- Cập nhật một số dữ liệu mẫu (tùy chọn)
UPDATE public.jobs SET team_members = 'Nguyễn Văn A, Trần Thị B' WHERE id = 1;
UPDATE public.jobs SET team_members = NULL WHERE id = 2; -- Thực hiện cá nhân
