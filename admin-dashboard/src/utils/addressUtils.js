// Utility functions for address handling
export const addressUtils = {
  // Build full address string from form data
  buildFullAddress(address, wardCode, districtCode, provinceCode, wards, districts, provinces) {
    const addressParts = [
      address,
      wards.find(w => w.code === wardCode)?.name,
      districts.find(d => d.code === districtCode)?.name,
      provinces.find(p => p.code === provinceCode)?.name
    ].filter(Boolean);

    return addressParts.join(', ');
  },

  // Generate Google Maps URL from address
  generateGoogleMapsUrl(address) {
    if (!address || !address.trim()) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  },

  // Get address names from codes
  getAddressNames(wardCode, districtCode, provinceCode, wards, districts, provinces) {
    return {
      ward: wards.find(w => w.code === wardCode)?.name || '',
      district: districts.find(d => d.code === districtCode)?.name || '',
      province: provinces.find(p => p.code === provinceCode)?.name || ''
    };
  },

  // Map address names to codes (for editing)
  mapNamesToCodes(provinceName, districtName, wardName, provincesData, districtsData, wardsData) {
    const provinceObj = provincesData.find(p => p.name === provinceName);
    const provinceCode = provinceObj ? provinceObj.code : provinceName;

    const districtObj = districtsData.find(d =>
      d.name === districtName && d.province_code === parseInt(provinceCode)
    );
    const districtCode = districtObj ? districtObj.code : districtName;

    const wardObj = wardsData.find(w =>
      w.name === wardName && w.district_code === districtCode
    );
    const wardCode = wardObj ? wardObj.code : wardName;

    return { provinceCode, districtCode, wardCode };
  }
};

// Form utility functions
export const formUtils = {
  // Reset dependent fields when parent changes
  resetDependentFields(changedField, formData, setFormData) {
    const resets = {
      province: { district: '', ward: '' },
      district: { ward: '' }
    };

    if (resets[changedField]) {
      setFormData(prev => ({
        ...prev,
        ...resets[changedField]
      }));
    }
  },

  // Handle checkbox array changes
  handleCheckboxArrayChange(arrayName, value, checked, currentArray, setter) {
    setter(prev => ({
      ...prev,
      [arrayName]: checked
        ? [...(currentArray || []), value]
        : (currentArray || []).filter(item => item !== value)
    }));
  },

  // Validate required fields
  validateRequiredFields(formData, requiredFields) {
    const errors = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        errors[field] = 'Trường này là bắt buộc';
      }
    });
    return errors;
  }
};