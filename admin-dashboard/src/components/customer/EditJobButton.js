import React from 'react';
import { Button } from '@mui/material';
import { Work } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const EditJobButton = ({ customer }) => {
  const navigate = useNavigate();

  const handleEditJob = () => {
    // Chuyển đến trang lập kế hoạch với customer_id trong URL params
    navigate(`/lap-ke-hoach-cong-viec?customer_id=${customer.id}&customer_name=${encodeURIComponent(customer.name)}`);
  };

  return (
    <Button
      variant="outlined"
      color="success"
      startIcon={<Work />}
      size="small"
      onClick={handleEditJob}
      sx={{ 
        textTransform: 'none',
        fontSize: '0.8rem'
      }}
    >
      Sửa công việc
    </Button>
  );
};

export default EditJobButton;
