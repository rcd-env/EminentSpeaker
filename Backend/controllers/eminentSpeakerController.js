const EminentSpeaker = require('../models/eminentSpeakerModel');
const fs = require('fs').promises;
const path = require('path');

class EminentSpeakerController {
    // Create new eminent speaker
    async createEminentSpeaker(req, res) {
        try {
            const { speaker_name, type, category, description, display } = req.body;
            
            // Validation
            if (!speaker_name || !type || !category || !description) {
                if (req.file) {
                    await fs.unlink(req.file.path); // Clean up uploaded file
                }
                return res.status(400).json({
                    error: 'VALIDATION_ERROR',
                    message: 'Required fields: speaker_name, type, category, description'
                });
            }

            const speaker_photo = req.file ? req.file.filename : null;
            
            const speakerData = {
                speaker_name,
                type,
                speaker_photo,
                category,
                description,
                display: display || 'active'
            };

            const newSpeaker = await EminentSpeaker.create(speakerData);
            
            res.status(201).json({
                success: true,
                message: 'Eminent speaker created successfully',
                data: newSpeaker
            });

        } catch (error) {
            // Clean up uploaded file if error occurs
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    error: 'DUPLICATE_ENTRY',
                    message: 'Speaker with this name already exists',
                });
            }

            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to create eminent speaker',
                code: 'EM_003',
                details: error.message
            });
        }
    }

    // Get all eminent speakers
    async getAllEminentSpeakers(req, res) {
        try {
            const { page = 1, limit = 10, category, type, display } = req.query;
            
            const filters = {};
            if (category) filters.category = category;
            if (type) filters.type = type;
            if (display) filters.display = display;

            const speakers = await EminentSpeaker.findAll(filters, page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Eminent speakers retrieved successfully',
                data: speakers.data,
                pagination: speakers.pagination
            });

        } catch (error) {
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve eminent speakers',
                details: error.message
            });
        }
    }

    // Get eminent speaker by ID
    async getEminentSpeakerById(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    error: 'INVALID_PARAMETER',
                    message: 'Valid speaker ID is required'
                });
            }

            const speaker = await EminentSpeaker.findById(id);
            
            if (!speaker) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: 'Eminent speaker not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Eminent speaker retrieved successfully',
                data: speaker
            });

        } catch (error) {
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to retrieve eminent speaker',
                details: error.message
            });
        }
    }

    // Update eminent speaker
    async updateEminentSpeaker(req, res) {
        try {
            const { id } = req.params;
            const { speaker_name, type, category, description, display } = req.body;
            
            if (!id || isNaN(id)) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(400).json({
                    error: 'INVALID_PARAMETER',
                    message: 'Valid speaker ID is required'
                });
            }

            const existingSpeaker = await EminentSpeaker.findById(id);
            if (!existingSpeaker) {
                if (req.file) {
                    await fs.unlink(req.file.path);
                }
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: 'Eminent speaker not found'
                });
            }

            const updateData = {};
            if (speaker_name) updateData.speaker_name = speaker_name;
            if (type) updateData.type = type;
            if (category) updateData.category = category;
            if (description) updateData.description = description;
            if (display) updateData.display = display;

            // Handle photo update
            if (req.file) {
                updateData.speaker_photo = req.file.filename;
                // Delete old photo
                if (existingSpeaker.speaker_photo) {
                    const oldPhotoPath = path.join(__dirname, '../uploads/speakers', existingSpeaker.speaker_photo);
                    await fs.unlink(oldPhotoPath).catch(() => {});
                }
            }

            const updatedSpeaker = await EminentSpeaker.update(id, updateData);

            res.status(200).json({
                success: true,
                message: 'Eminent speaker updated successfully',
                data: updatedSpeaker
            });

        } catch (error) {
            if (req.file) {
                await fs.unlink(req.file.path).catch(() => {});
            }

            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to update eminent speaker',
                details: error.message
            });
        }
    }

    // Delete eminent speaker
    async deleteEminentSpeaker(req, res) {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(id)) {
                return res.status(400).json({
                    error: 'INVALID_PARAMETER',
                    message: 'Valid speaker ID is required'
                });
            }

            const speaker = await EminentSpeaker.findById(id);
            if (!speaker) {
                return res.status(404).json({
                    error: 'NOT_FOUND',
                    message: 'Eminent speaker not found'
                });
            }

            await EminentSpeaker.delete(id);

            // Delete associated photo
            if (speaker.speaker_photo) {
                const photoPath = path.join(__dirname, '../uploads/speakers', speaker.speaker_photo);
                await fs.unlink(photoPath).catch(() => {});
            }

            res.status(200).json({
                success: true,
                message: 'Eminent speaker deleted successfully'
            });

        } catch (error) {
            res.status(500).json({
                error: 'INTERNAL_SERVER_ERROR',
                message: 'Failed to delete eminent speaker',
                details: error.message
            });
        }
    }
}

module.exports = new EminentSpeakerController();