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
        return await getComments();
      case 'POST':
        return await createComment(JSON.parse(body));
      case 'PUT':
        return await updateComment(JSON.parse(body));
      case 'DELETE':
        const { id } = JSON.parse(body);
        return await deleteComment(id);
      default:
        return createResponse(405, { error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return createResponse(500, { error: 'Internal server error', details: error.message });
  }
};

async function getComments() {
  const result = await query(`
    SELECT 
      id,
      title,
      category,
      related_to as "relatedTo",
      content,
      date,
      created_at as "createdAt",
      updated_at as "updatedAt"
    FROM comments 
    ORDER BY date DESC, created_at DESC
  `);
  
  return createResponse(200, { comments: result.rows });
}

async function createComment(commentData) {
  const {
    title,
    category,
    relatedTo,
    content,
    date
  } = commentData;

  // Validate required fields
  if (!title || !category || !content) {
    return createResponse(400, { error: 'Missing required fields: title, category, content' });
  }

  const result = await query(`
    INSERT INTO comments (title, category, related_to, content, date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id,
      title,
      category,
      related_to as "relatedTo",
      content,
      date,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [title, category, relatedTo || null, content, date || new Date().toISOString().split('T')[0]]);

  return createResponse(201, { comment: result.rows[0] });
}

async function updateComment(commentData) {
  const {
    id,
    title,
    category,
    relatedTo,
    content,
    date
  } = commentData;

  if (!id) {
    return createResponse(400, { error: 'Comment ID is required' });
  }

  const result = await query(`
    UPDATE comments 
    SET 
      title = $2,
      category = $3,
      related_to = $4,
      content = $5,
      date = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING 
      id,
      title,
      category,
      related_to as "relatedTo",
      content,
      date,
      created_at as "createdAt",
      updated_at as "updatedAt"
  `, [id, title, category, relatedTo || null, content, date || new Date().toISOString().split('T')[0]]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Comment not found' });
  }

  return createResponse(200, { comment: result.rows[0] });
}

async function deleteComment(id) {
  if (!id) {
    return createResponse(400, { error: 'Comment ID is required' });
  }

  const result = await query('DELETE FROM comments WHERE id = $1 RETURNING id', [id]);

  if (result.rows.length === 0) {
    return createResponse(404, { error: 'Comment not found' });
  }

  return createResponse(200, { message: 'Comment deleted successfully', id: result.rows[0].id });
}