const db = require('../config/database'); // Assuming you have a database connection

class EminentSpeakerModel {
    // Create new eminent speaker
    async create(speakerData) {
        const { speaker_name, type, speaker_photo, category, description, display } = speakerData;
        
        const query = `
            INSERT INTO eminent_speakers 
            (speaker_name, type, speaker_photo, category, description, display, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `;
        
        const values = [speaker_name, type, speaker_photo, category, description, display];
        
        const [result] = await db.execute(query, values);
        
        // Return the created speaker
        return await this.findById(result.insertId);
    }

    // Find all speakers with pagination and filters
    async findAll(filters = {}, page = 1, limit = 10) {
        let query = `
            SELECT speaker_id, speaker_name, type, speaker_photo, category, 
                   description, display, created_at, updated_at
            FROM eminent_speakers 
            WHERE 1=1
        `;
        
        const values = [];
        
        // Apply filters
        if (filters.category) {
            query += ' AND category = ?';
            values.push(filters.category);
        }
        
        if (filters.type) {
            query += ' AND type = ?';
            values.push(filters.type);
        }
        
        if (filters.display) {
            query += ' AND display = ?';
            values.push(filters.display);
        }

        // Count total records
        const countQuery = query.replace('SELECT speaker_id, speaker_name, type, speaker_photo, category, description, display, created_at, updated_at', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery, values);
        const total = countResult[0].total;

        // Add pagination
        const offset = (page - 1) * limit;
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        values.push(parseInt(limit), parseInt(offset));

        const [speakers] = await db.execute(query, values);

        return {
            data: speakers,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    // Find speaker by ID
    async findById(id) {
        const query = `
            SELECT speaker_id, speaker_name, type, speaker_photo, category, 
                   description, display, created_at, updated_at
            FROM eminent_speakers 
            WHERE speaker_id = ?
        `;
        
        const [speakers] = await db.execute(query, [id]);
        return speakers[0] || null;
    }

    // Update speaker
    async update(id, updateData) {
        const fields = [];
        const values = [];
        
        Object.keys(updateData).forEach(key => {
            fields.push(`${key} = ?`);
            values.push(updateData[key]);
        });
        
        fields.push('updated_at = NOW()');
        values.push(id);
        
        const query = `
            UPDATE eminent_speakers 
            SET ${fields.join(', ')}
            WHERE speaker_id = ?
        `;
        
        await db.execute(query, values);
        
        // Return updated speaker
        return await this.findById(id);
    }

    // Delete speaker
    async delete(id) {
        const query = 'DELETE FROM eminent_speakers WHERE speaker_id = ?';
        const [result] = await db.execute(query, [id]);
        return result.affectedRows > 0;
    }

    // Check if speaker exists by name
    async existsByName(name, excludeId = null) {
        let query = 'SELECT speaker_id FROM eminent_speakers WHERE speaker_name = ?';
        const values = [name];
        
        if (excludeId) {
            query += ' AND speaker_id != ?';
            values.push(excludeId);
        }
        
        const [speakers] = await db.execute(query, values);
        return speakers.length > 0;
    }
}

module.exports = new EminentSpeakerModel();