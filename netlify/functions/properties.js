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
        return await getProperties();
      case 'POST':
        return await createProperty(JSON.parse(body));
      case 'PUT':
        return await updateProperty(JSON.parse(body));
      case 'DELETE':
        const { id } = JSON.parse(body);
        return await deleteProperty(id);
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return createResponse(500, { error: 'Internal server error', details: error.message });
  }
};

async function getProperties() {
  const result = await query(`
    SELECT 
      id,
      title,
      price,
      type,
      status,
      bedrooms,
      bathrooms,
      size,
      location,
      description,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM properties 
    ORDER BY created_at DESC
  `);
  
  return createResponse(200, { properties: result.rows });
}

async function createProperty(propertyData) {
  const {
    title,
    price,
    type,
    status,
    bedrooms,
    bathrooms,
    size,
    location,
    description
  } = propertyData;

  // Validate required fields
  if (!title || !price || !type || !status || !location) {
    return createResponse(400, { error: 'Missing required fields: title, price, type, status, location' });
  }

  const result = await query(`
    INSERT INTO properties (title, price, type, status, bedrooms, bathrooms, size, location, description)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING 
      id,
      title,
      price,
      type,
      status,
      bedrooms,
      bathrooms,
      size,
      location,
      description,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [title, price, type, status, bedrooms || 0, bathrooms || 0, size || 0, location, description || null]);

  return createResponse(201, { property: result.rows[0] });
}

async function updateProperty(propertyData) {
  const {
    id,
    title,
    price,
    type,
    status,
    bedrooms,
    bathrooms,
    size,
    location,
    description
  } = propertyData;

  if (!id) {
    return createResponse(400, { error: 'Property ID is required' });
  }

  const result = await query(`
    UPDATE properties 
    SET 
      title = $2,
      price = $3,
      type = $4,
      status = $5,
      bedrooms = $6,
      bathrooms = $7,
      size = $8,
      location = $9,
      description = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING 
      id,
      title,
      price,
      type,
      status,
      bedrooms,
      bathrooms,
      size,
      location,
      description,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [id, title, price, type, status, bedrooms || 0, bathrooms || 0, size || 0, location, description || null]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Property not found' });
  }

  return createResponse(200, { property: result.rows[0] });
}

async function deleteProperty(id) {
  if (!id) {
    return createResponse(400, { error: 'Property ID is required' });
  }

  const result = await query('DELETE FROM properties WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Property not found' });
  }

  return createResponse(200, { message: 'Property deleted successfully', id: result.rows[0].id });
}