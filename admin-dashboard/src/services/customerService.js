import { supabase } from '../supabaseClient';

export const customerService = {
  // Generate next customer code
  async generateCustomerCode(customerType) {
    const prefix = customerType === 'company' ? 'DN' : 'CN';
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
    return nextCode;
  },

  // Check if customer code exists
  async checkCustomerCodeExists(customerCode, excludeId = null) {
    let query = supabase
      .from('customers')
      .select('*')
      .eq('customer_code', customerCode)
      .limit(1);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data } = await query;
    return data && data.length > 0;
  },

  // Create new customer
  async createCustomer(customerData) {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select('id')
      .single();

    if (error) throw error;
    return data;
  },

  // Update customer
  async updateCustomer(customerId, customerData) {
    const { error } = await supabase
      .from('customers')
      .update(customerData)
      .eq('id', customerId);

    if (error) throw error;
  },

  // Get customer service plan
  async getCustomerServicePlan(customerId) {
    const { data, error } = await supabase
      .from('customer_sites_plans')
      .select(`
        *,
        customer_sites!inner (
          customer_id
        )
      `)
      .eq('customer_sites.customer_id', customerId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  },

  // Get customer service plan by site_id
  async getCustomerServicePlanBySite(siteId) {
    const { data, error } = await supabase
      .from('customer_sites_plans')
      .select('*')
      .eq('site_id', siteId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return data;
  },

  // Get site_ids from customer_id (customers can have multiple sites)
  async getSiteIdsByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('customer_sites')
      .select('id')
      .eq('customer_id', customerId);

    if (error) throw error;
    return data.map(d => d.id);
  },

  // Create or update service plan
  async saveServicePlan(servicePlanData) {
    const { site_id, ...planData } = servicePlanData;
    if (!site_id) {
      throw new Error('site_id is required in servicePlanData');
    }

    // Check if plan exists
    const existingPlan = await this.getCustomerServicePlanBySite(site_id);

    if (existingPlan) {
      // Update
      const { error } = await supabase
        .from('customer_sites_plans')
        .update(planData)
        .eq('site_id', site_id);

      if (error) throw error;
    } else {
      // Create
      const { error } = await supabase
        .from('customer_sites_plans')
        .insert([{ ...planData, site_id }]);

      if (error) throw error;
    }
  },

  // Get all customers (for future use)
  async getCustomers(filters = {}) {
    let query = supabase.from('customers').select('*');

    if (filters.customer_type) {
      query = query.eq('customer_type', filters.customer_type);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,customer_code.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Delete customer (for future use)
  async deleteCustomer(customerId) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (error) throw error;
  }
};