import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import provincesData from '../data/provinces.json';
import districtsData from '../data/districts.json';
import wardsData from '../data/wards.json';

export const useCustomerForm = (open, customerToEdit) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_type: 'company',
    customer_code: '',
    name: '',
    tax_code: '',
    primary_contact_name: '',
    primary_contact_position: '',
    primary_contact_phone: '',
    primary_contact_email: '',
    address: '',
    ward: '',
    district: '',
    province: '',
    site_name: '',
    site_contact_name: '',
    site_contact_position: '',
    site_contact_phone: '',
    notes: '',
    google_map_code: '',
    distance_km: '',
    service_types: [],
    plan: 'Lịch Định kỳ',
    days_of_week: [],
    frequency: 'Hàng tuần'
  });

  const [copyContact, setCopyContact] = useState(false);
  const [siteId, setSiteId] = useState(null);
  const [provinces, setProvinces] = useState([]);

  const districts = useMemo(() => {
    if (formData.province) {
      const provinceCode = parseInt(formData.province);
      return districtsData.filter(d => d.province_code === provinceCode);
    }
    return [];
  }, [formData.province]);

  const wards = useMemo(() => {
    if (formData.district) {
      return wardsData.filter(w => w.district_code === formData.district);
    }
    return [];
  }, [formData.district]);

  const [servicePlanData, setServicePlanData] = useState({
    service_types: [],
    plan: 'Lịch Định kỳ',
    days_of_week: [],
    frequency: 'Hàng tuần',
    start_date: '',
    end_date: '',
    report_date: '',
    report_frequency: '1 tuần/lần'
  });

  // Initialize form when opened
  useEffect(() => {
    if (open) {
      setProvinces(provincesData);
      // Only reset formData if not editing (no customerToEdit)
      if (!customerToEdit?.id) {
        setFormData({
          customer_type: 'company',
          customer_code: '',
          name: '',
          tax_code: '',
          primary_contact_name: '',
          primary_contact_position: '',
          primary_contact_phone: '',
          primary_contact_email: '',
          address: '',
          ward: '',
          district: '',
          province: '',
          site_contact_name: '',
          site_contact_position: '',
          site_contact_phone: '',
          notes: '',
          google_map_code: '',
          service_types: [],
          plan: 'Lịch Định kỳ'
        });
      }
    }
  }, [open, customerToEdit?.id]);

  // Auto-generate customer code
  useEffect(() => {
    if (open && !customerToEdit?.id) {
      const fetchLatestCode = async () => {
        const prefix = formData.customer_type === 'company' ? 'DN' : 'CN';
        const { data } = await supabase
          .from('customers')
          .select('customer_code')
          .like('customer_code', `${prefix}%`)
          .order('customer_code', { ascending: false })
          .limit(1);

        let nextCode = `${prefix}0001`;
        if (data && data.length > 0) {
          const lastCode = data[0].customer_code;
          const num = parseInt(lastCode.replace(prefix, ''), 10) + 1;
          nextCode = `${prefix}${num.toString().padStart(4, '0')}`;
        }
        setFormData(prev => ({
          ...prev,
          customer_code: nextCode
        }));
      };
      fetchLatestCode();
    }
  }, [formData.customer_type, open, customerToEdit?.id]);

  // Copy contact info
  useEffect(() => {
    if (copyContact) {
      setFormData(prev => ({
        ...prev,
        site_contact_name: prev.primary_contact_name,
        site_contact_position: prev.primary_contact_position,
        site_contact_phone: prev.primary_contact_phone
      }));
    }
  }, [copyContact, formData.primary_contact_name, formData.primary_contact_position, formData.primary_contact_phone]);

  // Reset siteId when form closes
  useEffect(() => {
    if (!open) {
      setSiteId(null);
    }
  }, [open]);

  // Load customer data for editing
  useEffect(() => {
    if (customerToEdit?.id) {
      console.log('Loading customer:', customerToEdit);
      // Load customer basic info
      setFormData({
        customer_type: customerToEdit.customer_type,
        customer_code: customerToEdit.customer_code,
        name: customerToEdit.name,
        tax_code: customerToEdit.tax_code,
        primary_contact_name: customerToEdit.primary_contact_name,
        primary_contact_position: customerToEdit.primary_contact_position,
        primary_contact_phone: customerToEdit.primary_contact_phone,
        primary_contact_email: customerToEdit.primary_contact_email,
        notes: customerToEdit.notes,
        // Site info will be loaded separately
        site_name: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        google_map_code: '',
        distance_km: '',
        site_contact_name: '',
        site_contact_position: '',
        site_contact_phone: ''
      });

      // Load site info
      const loadSite = async () => {
        const { data: siteData, error: siteError } = await supabase
          .from('customer_sites')
          .select('*')
          .eq('customer_id', customerToEdit.id)
          .limit(1);
        if (siteData && siteData.length > 0 && !siteError) {
          const site = siteData[0];
          setFormData(prev => ({
            ...prev,
            site_name: site.site_name || '',
            address: site.address || '',
            province: site.province || '',
            district: site.district || '',
            ward: site.ward || '',
            google_map_code: site.google_map_code || '',
            site_contact_name: site.site_contact_name || '',
            site_contact_position: site.site_contact_position || '',
            site_contact_phone: site.site_contact_phone || ''
          }));
          setSiteId(site.id);

          // Load distance for this site
          const { data: distanceData } = await supabase
            .from('distances')
            .select('khoang_cach')
            .eq('diem_di', 'Công ty')
            .eq('diem_den', site.site_name)
            .limit(1);
          if (distanceData && distanceData.length > 0) {
            setFormData(prev => ({
              ...prev,
              distance_km: distanceData[0].khoang_cach?.toString() || ''
            }));
          }
        }
      };

      // Load service plan
      const loadServicePlan = async () => {
        const { data: siteData, error: planError } = await supabase
          .from('customer_sites')
          .select('customer_sites_plans(*)')
          .eq('customer_id', customerToEdit.id)
          .limit(1);
        console.log('Load service plan data:', siteData, 'error:', planError);
        if (siteData && siteData.length > 0 && siteData[0].customer_sites_plans && siteData[0].customer_sites_plans.length > 0 && !planError) {
          const planData = siteData[0].customer_sites_plans[0];
          setServicePlanData({
            service_types: planData.service_types || [],
            plan: planData.plan || 'Lịch Định kỳ',
            days_of_week: planData.days_of_week || [],
            frequency: planData.frequency || 'Hàng tuần',
            start_date: planData.start_date || '',
            end_date: planData.end_date || '',
            report_date: planData.report_date || '',
            report_frequency: planData.report_frequency || '1 tuần/lần',
          });
        } else {
          setServicePlanData({
            service_types: [],
            plan: 'Lịch Định kỳ',
            days_of_week: [],
            frequency: 'Hàng tuần',
            start_date: '',
            end_date: '',
            report_date: '',
            report_frequency: '1 tuần/lần',
          });
        }
      };
      loadSite();
      loadServicePlan();
    }
  }, [customerToEdit]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    if (type === 'checkbox') {
      if (name === 'service_types') {
        setServicePlanData((prev) => ({
          ...prev,
          service_types: checked
            ? [...(prev.service_types || []), value]
            : (prev.service_types || []).filter((type) => type !== value),
        }));
      } else if (name === 'days_of_week') {
        setServicePlanData((prev) => ({
          ...prev,
          days_of_week: checked
            ? [...(prev.days_of_week || []), value]
            : (prev.days_of_week || []).filter((day) => day !== value),
        }));
      }
    } else {
      setServicePlanData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === 'service_types') {
      setFormData(prev => ({
        ...prev,
        service_types: checked
          ? [...(prev.service_types || []), value]
          : (prev.service_types || []).filter(type => type !== value)
      }));
      return;
    }
    if (name === 'days_of_week') {
      setFormData(prev => ({
        ...prev,
        days_of_week: checked
          ? [...(prev.days_of_week || []), value]
          : (prev.days_of_week || []).filter(day => day !== value)
      }));
      return;
    }
    if (name === 'province') {
      setFormData(prev => ({
        ...prev,
        province: value,
        district: '',
        ward: ''
      }));
      return;
    }
    if (name === 'district') {
      setFormData(prev => ({
        ...prev,
        district: value,
        ward: ''
      }));
      return;
    }
    if (name === 'ward') {
      setFormData(prev => ({
        ...prev,
        ward: value
      }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewMap = (showAlert) => {
    const addressFull = [
      formData.address,
      wards.find(w => w.code === formData.ward)?.name,
      districts.find(d => d.code === formData.district)?.name,
      provinces.find(p => p.code === formData.province)?.name
    ].filter(Boolean).join(', ');
    if (addressFull.trim()) {
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull)}`;
      window.open(mapUrl, '_blank');
    } else {
      showAlert && showAlert('Vui lòng nhập đầy đủ địa chỉ.', 'warning');
    }
  };

  const handleSubmit = async (showAlert, onClose) => {
    setLoading(true);
    const provinceText = provinces.find(p => p.code === formData.province)?.name || '';
    const districtText = districts.find(d => d.code === formData.district)?.name || '';
    const wardText = wards.find(w => w.code === formData.ward)?.name || '';
    const dataToSave = {
      ...formData,
      province_name: provinceText,
      district_name: districtText,
      ward_name: wardText,
      service_types: formData.service_types,
      plan: formData.plan
    };

    console.log('Dữ liệu được lưu:', dataToSave);

    // Check duplicate customer code
    if (!customerToEdit?.id || formData.customer_code !== customerToEdit.customer_code) {
      const { data: existed } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_code', formData.customer_code)
        .limit(1);
      if (existed && existed.length > 0) {
        showAlert && showAlert('Mã khách hàng đã tồn tại!', 'error');
        setLoading(false);
        return;
      }
    }

    try {
      let customerId = customerToEdit?.id;

      if (!customerId) {
        // Create new customer
        const customerData = {
          customer_type: formData.customer_type,
          customer_code: formData.customer_code,
          name: formData.name,
          tax_code: formData.tax_code,
          primary_contact_name: formData.primary_contact_name,
          primary_contact_position: formData.primary_contact_position,
          primary_contact_phone: formData.primary_contact_phone,
          primary_contact_email: formData.primary_contact_email,
          notes: formData.notes
        };
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .insert([customerData])
          .select('id')
          .single();
        if (customerError) throw customerError;
        customerId = customer.id;
      } else {
        // Update existing customer
        const customerData = {
          customer_type: formData.customer_type,
          customer_code: formData.customer_code,
          name: formData.name,
          tax_code: formData.tax_code,
          primary_contact_name: formData.primary_contact_name,
          primary_contact_position: formData.primary_contact_position,
          primary_contact_phone: formData.primary_contact_phone,
          primary_contact_email: formData.primary_contact_email,
          notes: formData.notes
        };
        const { error: customerError } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', customerId);
        if (customerError) throw customerError;
      }

      // Save site info
      const siteData = {
        customer_id: customerId,
        site_name: formData.site_name,
        address: formData.address,
        province: formData.province,
        district: formData.district,
        ward: formData.ward,
        google_map_code: formData.google_map_code,
        site_contact_name: formData.site_contact_name,
        site_contact_position: formData.site_contact_position,
        site_contact_phone: formData.site_contact_phone
        // Removed distance_km, stored in distances table
      };

      const { data: existingSite } = await supabase
        .from('customer_sites')
        .select('*')
        .eq('customer_id', customerId)
        .limit(1);

      let siteId;
      if (existingSite && existingSite.length > 0) {
        // Update existing site
        const { error: siteError } = await supabase
          .from('customer_sites')
          .update(siteData)
          .eq('id', existingSite[0].id);
        if (siteError) throw siteError;
        siteId = existingSite[0].id;
      } else {
        // Insert new site
        const { data: newSite, error: siteError } = await supabase
          .from('customer_sites')
          .insert([siteData])
          .select('id')
          .single();
        if (siteError) throw siteError;
        siteId = newSite.id;
      }

      // Save distance if site_name and distance_km are provided
      if (formData.site_name && formData.distance_km) {
        const tenChang = `Công ty → ${formData.site_name}`;
        const distanceData = {
          diem_di: 'Công ty',
          diem_den: formData.site_name,
          khoang_cach: parseFloat(formData.distance_km),
          ten_chang: tenChang
        };

        // Check if distance already exists
        const { data: existingDistance } = await supabase
          .from('distances')
          .select('*')
          .eq('diem_di', 'Công ty')
          .eq('diem_den', formData.site_name)
          .limit(1);

        if (existingDistance && existingDistance.length > 0) {
          // Update existing
          const { error } = await supabase
            .from('distances')
            .update(distanceData)
            .eq('id', existingDistance[0].id);
          if (error) throw error;
        } else {
          // Insert new
          const { error } = await supabase
            .from('distances')
            .insert([distanceData]);
          if (error) throw error;
        }
      }

      // Save service plan
      const servicePlan = {
        site_id: siteId,
        service_types: servicePlanData.service_types,
        plan: servicePlanData.plan,
        days_of_week: servicePlanData.plan === 'Lịch Định kỳ' ? servicePlanData.days_of_week : null,
        frequency: servicePlanData.plan === 'Lịch Định kỳ' ? servicePlanData.frequency : null,
        start_date: servicePlanData.start_date || null,
        end_date: servicePlanData.end_date || null,
        report_date: servicePlanData.report_date || null,
        report_frequency: servicePlanData.plan === 'Lịch Định kỳ' ? servicePlanData.report_frequency : null,
      };

      const { data: existingPlan } = await supabase
        .from('customer_sites_plans')
        .select('*')
        .eq('site_id', siteId)
        .limit(1);

      if (existingPlan && existingPlan.length > 0) {
        const { error } = await supabase
          .from('customer_sites_plans')
          .update(servicePlan)
          .eq('id', existingPlan[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('customer_sites_plans')
          .insert([servicePlan]);
        if (error) throw error;
      }

      showAlert('Thành công!', 'success');
      onClose();
    } catch (error) {
      console.error('Lỗi submit:', error);
      showAlert('Lỗi: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    formData,
    servicePlanData,
    copyContact,
    setCopyContact,
    siteId,
    provinces,
    districts,
    wards,
    handleChange,
    handleViewMap,
    handleSubmit
  };
};