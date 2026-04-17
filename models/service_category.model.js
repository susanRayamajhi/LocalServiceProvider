const sql = require('./db.js');

const ServiceCategory = function(category) {
    this.name = category.name;
    this.description = category.description;
    this.image = category.image;
};

ServiceCategory.create = (newCategory, result) => {
    sql.query("INSERT INTO service_categories SET ?", newCategory, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, { id: res.insertId, ...newCategory });
    });
};

ServiceCategory.findByName = (name, result) => {
    sql.query("SELECT * FROM service_categories WHERE name = ?", [name], (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }
        result({ kind: "not_found" }, null);
    });
};

ServiceCategory.getAll = (result) => {
    sql.query("SELECT * FROM service_categories", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        result(null, res);
    });
};

ServiceCategory.updateById = (id, category, result) => {
    sql.query(
        "UPDATE service_categories SET name = ?, description = ?, image = ? WHERE id = ?",
        [category.name, category.description, category.image, id],
        (err, res) => {
            if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
            }
            if (res.affectedRows == 0) {
                result({ kind: "not_found" }, null);
                return;
            }
            result(null, { id: id, ...category });
        }
    );
};

ServiceCategory.remove = (id, result) => {
    sql.query("DELETE FROM service_categories WHERE id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
        if (res.affectedRows == 0) {
            result({ kind: "not_found" }, null);
            return;
        }
        result(null, res);
    });
};

module.exports = ServiceCategory;
