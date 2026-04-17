const sql = require('./db.js');

const Service = {};

Service.getAll = (result) => {
    sql.query("SELECT * FROM services", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        console.log("services: ", res);
        result(null, res);
    });
};

Service.search = (filters, result) => {
    // Helper to clean price strings
    const cleanPriceSql = (col) => `CAST(REPLACE(REPLACE(REPLACE(COALESCE(${col}, '0'), '£', ''), ',', ''), ' ', '') AS DECIMAL(10,2))`;

    // 1. Check schema diagnostics
    sql.query("SHOW COLUMNS FROM partners", (err, cols) => {
        if (err) {
            console.error("Schema diagnostic failed:", err);
            result(err, null);
            return;
        }

        const columnNames = cols.map(c => c.Field);
        const hasRating = columnNames.includes('rating');
        const hasApproved = columnNames.includes('is_approved');
        const hasStatus = columnNames.includes('status');

        // 2. Check if partner_services table exists
        sql.query("SHOW TABLES LIKE 'partner_services'", (err, tableExists) => {
            const hasExtraTable = tableExists && tableExists.length > 0;

            let approvalFilter = "1=1";
            if (hasApproved) approvalFilter = "p.is_approved = 1";
            else if (hasStatus) approvalFilter = "p.status = 'approved'";

            const ratingSelect = hasRating ? "p.rating" : "0 AS rating";

            let baseQuery = `
                SELECT 
                    s.name AS service_name, 
                    p.name AS partner_name, 
                    p.description, 
                    p.pricing, 
                    p.work_images, 
                    p.id, 
                    p.profile_image, 
                    p.service_id, 
                    s.category_id,
                    sc.name AS category_name, 
                    ${ratingSelect},
                    ${cleanPriceSql('p.pricing')} as clean_price
                FROM services s
                INNER JOIN partners p ON s.id = p.service_id
                LEFT JOIN service_categories sc ON s.category_id = sc.id
                WHERE ${approvalFilter}
            `;
            
            let secondaryQuery = "";
            if (hasExtraTable) {
                secondaryQuery = `
                    UNION ALL
                    SELECT 
                        s.name AS service_name, 
                        p.name AS partner_name, 
                        ps.description, 
                        CAST(ps.price AS CHAR) as pricing, 
                        p.work_images, 
                        p.id, 
                        p.profile_image, 
                        ps.service_id, 
                        s.category_id,
                        sc.name AS category_name, 
                        ${ratingSelect},
                        ${cleanPriceSql('ps.price')} as clean_price
                    FROM partner_services ps
                    JOIN partners p ON ps.partner_id = p.id
                    JOIN services s ON ps.service_id = s.id
                    LEFT JOIN service_categories sc ON s.category_id = sc.id
                    WHERE ${approvalFilter}
                `;
            }

            let query = `SELECT * FROM (${baseQuery} ${secondaryQuery}) as combined WHERE 1=1`;
            let params = [];

            if (filters.keyword) {
                query += " AND (LOWER(service_name) LIKE LOWER(?) OR LOWER(partner_name) LIKE LOWER(?) OR LOWER(category_name) LIKE LOWER(?) OR LOWER(description) LIKE LOWER(?))";
                const searchTerm = `%${filters.keyword}%`;
                params.push(searchTerm, searchTerm, searchTerm, searchTerm);
            }

            if (filters.category_id) {
                if (!isNaN(filters.category_id) && filters.category_id !== "") {
                    query += " AND category_id = ?";
                    params.push(filters.category_id);
                } else if (filters.category_id !== "") {
                    query += " AND LOWER(category_name) = LOWER(?)";
                    params.push(filters.category_id);
                }
            }

            if (filters.service_id) {
                query += " AND service_id = ?";
                params.push(filters.service_id);
            }

            query += " ORDER BY rating DESC";

            sql.query(query, params, (err, res) => {
                if (err) {
                    console.error("Final Search Query Error:", err);
                    result(err, null);
                    return;
                }
                result(null, res);
            });
        });
    });
};

Service.getPartners = (serviceId, result) => {
    sql.query("SELECT * FROM partners WHERE service_id = ?", serviceId, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        console.log("partners: ", res);
        result(null, res);
    });
};

module.exports = Service;
