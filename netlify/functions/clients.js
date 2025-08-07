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
        return await getClients();
      case 'POST':
        return await createClient(JSON.parse(body));
      case 'PUT':
        return await updateClient(JSON.parse(body));
      case 'DELETE':
        const { id } = JSON.parse(body);
        return await deleteClient(id);
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return createResponse(500, { error: 'Internal server error', details: error.message });
  }
};

async function getClients() {
  const result = await query(`
    SELECT 
      id,
      name,
      phone,
      email,
      type,
      birthday,
      budget_min as "budgetMin",
      budget_max as "budgetMax",
      reminder_date as "reminderDate",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM clients 
    ORDER BY created_at DESC
  `);
  
  return createResponse(200, { clients: result.rows });
}

async function createClient(clientData) {
  const {
    name,
    phone,
    email,
    type,
    birthday,
    budgetMin,
    budgetMax,
    reminderDate,
    notes
  } = clientData;

  // Validate required fields
  if (!name || !phone || !email || !type) {
    return createResponse(400, { error: 'Missing required fields: name, phone, email, type' });
  }

  // Check for duplicate email
  const existingClient = await query('SELECT id FROM clients WHERE email = $1', [email]);
  if (existingClient.rows.length > 0) {
    return createResponse(409, { error: 'Client with this email already exists' });
  }

  const result = await query(`
    INSERT INTO clients (name, phone, email, type, birthday, budget_min, budget_max, reminder_date, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING 
      id,
      name,
      phone,
      email,
      type,
      birthday,
      budget_min as "budgetMin",
      budget_max as "budgetMax",
      reminder_date as "reminderDate",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [name, phone, email, type, birthday || null, budgetMin || 0, budgetMax || 0, reminderDate || null, notes || null]);

  return createResponse(201, { client: result.rows[0] });
}

async function updateClient(clientData) {
  const {
    id,
    name,
    phone,
    email,
    type,
    birthday,
    budgetMin,
    budgetMax,
    reminderDate,
    notes
  } = clientData;

  if (!id) {
    return createResponse(400, { error: 'Client ID is required' });
  }

  // Check if email conflicts with another client
  if (email) {
    const existingClient = await query('SELECT id FROM clients WHERE email = $1 AND id != $2', [email, id]);
    if (existingClient.rows.length > 0) {
      return createResponse(409, { error: 'Email already exists for another client' });
    }
  }

  const result = await query(`
    UPDATE clients 
    SET 
      name = $2,
      phone = $3,
      email = $4,
      type = $5,
      birthday = $6,
      budget_min = $7,
      budget_max = $8,
      reminder_date = $9,
      notes = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING 
      id,
      name,
      phone,
      email,
      type,
      birthday,
      budget_min as "budgetMin",
      budget_max as "budgetMax",
      reminder_date as "reminderDate",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [id, name, phone, email, type, birthday || null, budgetMin || 0, budgetMax || 0, reminderDate || null, notes || null]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Client not found' });
  }

  return createResponse(200, { client: result.rows[0] });
}

async function deleteClient(id) {
  if (!id) {
    return createResponse(400, { error: 'Client ID is required' });
  }

  const result = await query('DELETE FROM clients WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Client not found' });
  }

  return createResponse(200, { message: 'Client deleted successfully', id: result.rows[0].id });
}