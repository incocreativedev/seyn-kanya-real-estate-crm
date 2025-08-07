const { query, createResponse, handleOptions, initializeTables } = require('./utils/database');

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  // Initialize tables on first request
  try {
    await initializeTables();
  } catch (error) {
    console.error('Failed to initialize tables:', error);
  }

  const { httpMethod, body } = event;

  try {
    switch (httpMethod) {
      case 'GET':
        return await getLeads();
      case 'POST':
        return await createLead(JSON.parse(body));
      case 'PUT':
        return await updateLead(JSON.parse(body));
      case 'DELETE':
        const { id } = JSON.parse(body);
        return await deleteLead(id);
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return createResponse(500, { error: 'Internal server error', details: error.message });
  }
};

async function getLeads() {
  const result = await query(`
    SELECT 
      id,
      name,
      phone,
      email,
      interest,
      follow_up_date as "followUpDate",
      status,
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM leads 
    ORDER BY follow_up_date ASC, created_at DESC
  `);
  
  return createResponse(200, { leads: result.rows });
}

async function createLead(leadData) {
  const {
    name,
    phone,
    email,
    interest,
    followUpDate,
    status,
    notes
  } = leadData;

  // Validate required fields
  if (!name || !phone || !interest || !followUpDate || !status) {
    return createResponse(400, { error: 'Missing required fields: name, phone, interest, followUpDate, status' });
  }

  const result = await query(`
    INSERT INTO leads (name, phone, email, interest, follow_up_date, status, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING 
      id,
      name,
      phone,
      email,
      interest,
      follow_up_date as "followUpDate",
      status,
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [name, phone, email || null, interest, followUpDate, status, notes || null]);

  return createResponse(201, { lead: result.rows[0] });
}

async function updateLead(leadData) {
  const {
    id,
    name,
    phone,
    email,
    interest,
    followUpDate,
    status,
    notes
  } = leadData;

  if (!id) {
    return createResponse(400, { error: 'Lead ID is required' });
  }

  const result = await query(`
    UPDATE leads 
    SET 
      name = $2,
      phone = $3,
      email = $4,
      interest = $5,
      follow_up_date = $6,
      status = $7,
      notes = $8,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING 
      id,
      name,
      phone,
      email,
      interest,
      follow_up_date as "followUpDate",
      status,
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [id, name, phone, email || null, interest, followUpDate, status, notes || null]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Lead not found' });
  }

  return createResponse(200, { lead: result.rows[0] });
}

async function deleteLead(id) {
  if (!id) {
    return createResponse(400, { error: 'Lead ID is required' });
  }

  const result = await query('DELETE FROM leads WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Lead not found' });
  }

  return createResponse(200, { message: 'Lead deleted successfully', id: result.rows[0].id });
}