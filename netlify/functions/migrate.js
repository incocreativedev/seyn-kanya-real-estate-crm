const { query, createResponse, handleOptions, initializeTables } = require('./utils/database');

exports.handler = async (event) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { error: 'Only POST method allowed' });
  }

  // Initialize tables first
  try {
    await initializeTables();
  } catch (error) {
    console.error('Failed to initialize tables:', error);
    return createResponse(500, { error: 'Failed to initialize database tables' });
  }

  try {
    const { clients, leads, properties, reminders, comments } = JSON.parse(event.body);
    const results = {
      clients: 0,
      leads: 0,
      properties: 0,
      reminders: 0,
      comments: 0,
      errors: []
    };

    // Migrate clients
    if (clients && Array.isArray(clients)) {
      for (const client of clients) {
        try {
          // Check if client already exists (by email)
          const existing = await query('SELECT id FROM clients WHERE email = $1', [client.email]);
          if (existing.rows.length === 0) {
            await query(`
              INSERT INTO clients (name, phone, email, type, birthday, budget_min, budget_max, reminder_date, notes)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [
              client.name,
              client.phone,
              client.email,
              client.type,
              client.birthday || null,
              client.budgetMin || 0,
              client.budgetMax || 0,
              client.reminderDate || null,
              client.notes || null
            ]);
            results.clients++;
          }
        } catch (error) {
          results.errors.push(`Client ${client.name}: ${error.message}`);
        }
      }
    }

    // Migrate leads
    if (leads && Array.isArray(leads)) {
      for (const lead of leads) {
        try {
          await query(`
            INSERT INTO leads (name, phone, email, interest, follow_up_date, status, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            lead.name,
            lead.phone,
            lead.email || null,
            lead.interest,
            lead.followUpDate,
            lead.status,
            lead.notes || null
          ]);
          results.leads++;
        } catch (error) {
          results.errors.push(`Lead ${lead.name}: ${error.message}`);
        }
      }
    }

    // Migrate properties
    if (properties && Array.isArray(properties)) {
      for (const property of properties) {
        try {
          await query(`
            INSERT INTO properties (title, price, type, status, bedrooms, bathrooms, size, location, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          `, [
            property.title,
            property.price,
            property.type,
            property.status,
            property.bedrooms || 0,
            property.bathrooms || 0,
            property.size || 0,
            property.location,
            property.description || null
          ]);
          results.properties++;
        } catch (error) {
          results.errors.push(`Property ${property.title}: ${error.message}`);
        }
      }
    }

    // Migrate reminders
    if (reminders && Array.isArray(reminders)) {
      for (const reminder of reminders) {
        try {
          await query(`
            INSERT INTO reminders (title, date, time, type, related_client, notes)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            reminder.title,
            reminder.date,
            reminder.time || null,
            reminder.type,
            reminder.relatedClient || null,
            reminder.notes || null
          ]);
          results.reminders++;
        } catch (error) {
          results.errors.push(`Reminder ${reminder.title}: ${error.message}`);
        }
      }
    }

    // Migrate comments
    if (comments && Array.isArray(comments)) {
      for (const comment of comments) {
        try {
          await query(`
            INSERT INTO comments (title, category, related_to, content, date)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            comment.title,
            comment.category,
            comment.relatedTo || null,
            comment.content,
            comment.date || new Date().toISOString().split('T')[0]
          ]);
          results.comments++;
        } catch (error) {
          results.errors.push(`Comment ${comment.title}: ${error.message}`);
        }
      }
    }

    return createResponse(200, {
      message: 'Migration completed',
      results: results
    });

  } catch (error) {
    console.error('Migration error:', error);
    return createResponse(500, { error: 'Migration failed', details: error.message });
  }
};