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
        return await getReminders();
      case 'POST':
        return await createReminder(JSON.parse(body));
      case 'PUT':
        return await updateReminder(JSON.parse(body));
      case 'DELETE':
        const { id } = JSON.parse(body);
        return await deleteReminder(id);
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return createResponse(500, { error: 'Internal server error', details: error.message });
  }
};

async function getReminders() {
  const result = await query(`
    SELECT 
      id,
      title,
      date,
      time,
      type,
      related_client as "relatedClient",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM reminders 
    ORDER BY date ASC, time ASC
  `);
  
  return createResponse(200, { reminders: result.rows });
}

async function createReminder(reminderData) {
  const {
    title,
    date,
    time,
    type,
    relatedClient,
    notes
  } = reminderData;

  // Validate required fields
  if (!title || !date || !type) {
    return createResponse(400, { error: 'Missing required fields: title, date, type' });
  }

  const result = await query(`
    INSERT INTO reminders (title, date, time, type, related_client, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING 
      id,
      title,
      date,
      time,
      type,
      related_client as "relatedClient",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [title, date, time || null, type, relatedClient || null, notes || null]);

  return createResponse(201, { reminder: result.rows[0] });
}

async function updateReminder(reminderData) {
  const {
    id,
    title,
    date,
    time,
    type,
    relatedClient,
    notes
  } = reminderData;

  if (!id) {
    return createResponse(400, { error: 'Reminder ID is required' });
  }

  const result = await query(`
    UPDATE reminders 
    SET 
      title = $2,
      date = $3,
      time = $4,
      type = $5,
      related_client = $6,
      notes = $7,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING 
      id,
      title,
      date,
      time,
      type,
      related_client as "relatedClient",
      notes,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [id, title, date, time || null, type, relatedClient || null, notes || null]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Reminder not found' });
  }

  return createResponse(200, { reminder: result.rows[0] });
}

async function deleteReminder(id) {
  if (!id) {
    return createResponse(400, { error: 'Reminder ID is required' });
  }

  const result = await query('DELETE FROM reminders WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Reminder not found' });
  }

  return createResponse(200, { message: 'Reminder deleted successfully', id: result.rows[0].id });
}