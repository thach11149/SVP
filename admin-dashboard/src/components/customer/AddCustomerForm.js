import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Box, Button } from '@mui/material';
import { useCustomerForm } from '../../hooks/useCustomerForm';
import GeneralInfoSection from './formSections/GeneralInfoSection';
import PrimaryContactSection from './formSections/PrimaryContactSection';
import SiteContactSection from './formSections/SiteContactSection';
import NotesSection from './formSections/NotesSection';
import ServicePlanSection from './formSections/ServicePlanSection';

// Đổi tên component cho rõ nghĩa hơn: Form này giờ dùng cho cả Thêm và Sửa
export default function AddCustomerForm({ open, onClose, onSave, showAlert, customerToEdit }) {
  const {
    loading,
    formData,
    servicePlanData,
    copyContact,
    setCopyContact,
    provinces,
    districts,
    wards,
    handleChange,
    handleViewMap,
    handleSubmit
  } = useCustomerForm(open, customerToEdit);

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(showAlert, onClose);
  };

  const onViewMap = () => {
    handleViewMap(showAlert);
  };

  // Giao diện

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Tiêu đề thay đổi tùy theo chế độ */}
      <DialogTitle>{customerToEdit ? 'Sửa Hồ Sơ Khách Hàng' : 'Tạo Mới Hồ Sơ Khách Hàng'}</DialogTitle>
      <Box component="form" onSubmit={onSubmit}>  {/* Sửa từ onSubmit={handleSubmit} thành onSubmit={onSubmit} */}
        <DialogContent sx={{ p: 2 }}>  {/* Thay px: 0 thành p: 2 để có padding như TestPage */}
          {/* Section 1: Thông tin chung */}
          <GeneralInfoSection formData={formData} handleChange={handleChange} />

          {/* Section 2: Người liên hệ chính */}
          <PrimaryContactSection formData={formData} handleChange={handleChange} />

          {/* Section 3: Địa điểm & liên hệ hiện trường */}
          <SiteContactSection
            formData={formData}
            handleChange={handleChange}
            provinces={provinces}
            districts={districts}
            wards={wards}
            copyContact={copyContact}
            setCopyContact={setCopyContact}
            handleViewMap={onViewMap}
          />

          {/* Section 4: Loại hình dịch vụ và Kế hoạch */}
          <ServicePlanSection formData={servicePlanData} handleChange={handleChange} />

          {/* Section 5: Thông tin bổ sung */}
          <NotesSection formData={formData} handleChange={handleChange} />

        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu Thông Tin'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}