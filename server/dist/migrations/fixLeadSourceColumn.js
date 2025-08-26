"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixLeadSourceColumn = void 0;
const models_1 = require("../models");
const fixLeadSourceColumn = async () => {
    try {
        // First, ensure the lead_sources table exists
        const [tableResults] = await models_1.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'lead_sources'
    `);
        if (tableResults.length === 0) {
            console.log('lead_sources table does not exist, creating it...');
            await models_1.sequelize.query(`
        CREATE TABLE lead_sources (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          description TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
        }
        // Ensure the tags table exists
        const [tagsTableResults] = await models_1.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'tags'
    `);
        if (tagsTableResults.length === 0) {
            console.log('tags table does not exist, creating it...');
            await models_1.sequelize.query(`
        CREATE TABLE tags (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
          description TEXT,
          "isActive" BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
        }
        // Ensure the lead_tags table exists
        const [leadTagsTableResults] = await models_1.sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'lead_tags'
    `);
        if (leadTagsTableResults.length === 0) {
            console.log('lead_tags table does not exist, creating it...');
            await models_1.sequelize.query(`
          CREATE TABLE lead_tags (
            id SERIAL PRIMARY KEY,
            "leadId" INTEGER NOT NULL,
            "tagId" INTEGER NOT NULL,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE("leadId", "tagId")
          )
        `);
            // Add foreign key constraints
            try {
                await models_1.sequelize.query(`
            ALTER TABLE lead_tags 
            ADD CONSTRAINT fk_lead_tags_lead 
            FOREIGN KEY ("leadId") REFERENCES leads(id)
          `);
                await models_1.sequelize.query(`
            ALTER TABLE lead_tags 
            ADD CONSTRAINT fk_lead_tags_tag 
            FOREIGN KEY ("tagId") REFERENCES tags(id)
          `);
            }
            catch (e) {
                console.log('Could not add foreign key constraints for lead_tags:', e);
            }
        }
        // Check if the source column exists and sourceId doesn't
        const [results] = await models_1.sequelize.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' 
      AND column_name IN ('source', 'sourceId')
    `);
        const columns = results.map((r) => r.column_name);
        if (columns.includes('source') && !columns.includes('sourceId')) {
            console.log('Migrating source column to sourceId...');
            // Rename the column
            await models_1.sequelize.query('ALTER TABLE leads RENAME COLUMN source TO sourceId');
            // Change the column type to INTEGER
            await models_1.sequelize.query('ALTER TABLE leads ALTER COLUMN sourceId TYPE INTEGER USING NULL');
            // Remove the NOT NULL constraint if it exists
            try {
                await models_1.sequelize.query('ALTER TABLE leads ALTER COLUMN sourceId DROP NOT NULL');
            }
            catch (e) {
                // Column might not have NOT NULL constraint
            }
            console.log('Successfully migrated source column to sourceId');
        }
        else if (columns.includes('sourceId')) {
            console.log('sourceId column already exists, skipping migration');
            // Check if the column type is correct
            try {
                const [typeResults] = await models_1.sequelize.query(`
          SELECT data_type 
          FROM information_schema.columns 
          WHERE table_name = 'leads' 
          AND column_name = 'sourceId'
        `);
                const dataType = typeResults[0]?.data_type;
                if (dataType !== 'integer') {
                    console.log('Converting sourceId column type to INTEGER...');
                    await models_1.sequelize.query('ALTER TABLE leads ALTER COLUMN sourceId TYPE INTEGER USING NULL');
                }
            }
            catch (e) {
                console.log('Could not check or convert column type:', e);
            }
            // Check if foreign key constraint exists
            try {
                const [fkResults] = await models_1.sequelize.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'leads' 
          AND constraint_type = 'FOREIGN KEY' 
          AND constraint_name LIKE '%sourceId%'
        `);
                if (fkResults.length === 0) {
                    console.log('Adding foreign key constraint for sourceId...');
                    await models_1.sequelize.query(`
            ALTER TABLE leads 
            ADD CONSTRAINT fk_leads_source 
            FOREIGN KEY ("sourceId") REFERENCES lead_sources(id)
          `);
                }
            }
            catch (e) {
                console.log('Could not add foreign key constraint:', e);
            }
        }
        else {
            console.log('Neither source nor sourceId column found, creating sourceId');
            try {
                // Use quoted column name to preserve case sensitivity
                await models_1.sequelize.query(`
           ALTER TABLE leads 
           ADD COLUMN "sourceId" INTEGER
         `);
                // Add foreign key constraint separately
                try {
                    await models_1.sequelize.query(`
             ALTER TABLE leads 
             ADD CONSTRAINT fk_leads_source 
             FOREIGN KEY ("sourceId") REFERENCES lead_sources(id)
           `);
                }
                catch (e) {
                    console.log('Could not add foreign key constraint:', e);
                }
            }
            catch (e) {
                console.log('Could not add sourceId column:', e);
            }
        }
    }
    catch (error) {
        console.error('Error during migration:', error);
        // Don't throw error, just log it and continue
        console.log('Migration failed, but continuing with server startup...');
    }
    // Final verification - check if sourceId column exists
    try {
        const [finalCheck] = await models_1.sequelize.query(`
         SELECT column_name 
         FROM information_schema.columns 
         WHERE table_name = 'leads' 
         AND column_name = 'sourceId'
       `);
        if (finalCheck.length > 0) {
            console.log('✅ sourceId column successfully exists in leads table');
        }
        else {
            console.log('❌ sourceId column still does not exist in leads table');
            // Let's also check what columns actually exist
            const [allColumns] = await models_1.sequelize.query(`
           SELECT column_name 
           FROM information_schema.columns 
           WHERE table_name = 'leads'
           ORDER BY column_name
         `);
            console.log('Available columns in leads table:', allColumns.map((c) => c.column_name));
        }
    }
    catch (e) {
        console.log('Could not verify sourceId column:', e);
    }
};
exports.fixLeadSourceColumn = fixLeadSourceColumn;
//# sourceMappingURL=fixLeadSourceColumn.js.map