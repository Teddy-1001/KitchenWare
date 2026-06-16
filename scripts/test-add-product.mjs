import pool from "../db/config.js";
import cloudinary from "../db/cloudinary.js";

const testFile = "uploads/1781614014238-1503-F-768x768.jpg";

try {
    const upload = await cloudinary.uploader.upload(testFile, {
        folder: "kitchenware/products"
    });
    console.log("Cloudinary OK");

    const cats = await pool.query("SELECT id FROM categories LIMIT 1");
    if (!cats.rows.length) {
        console.log("FAIL: no categories in database");
        process.exit(1);
    }

    const ins = await pool.query(
        `INSERT INTO utensils(name, description, category_id, price, old_price, stock, badge, image_url)
         VALUES($1,$2,$3,$4,$5,$6,$7,$8)
         RETURNING id`,
        ["Test Product", "desc", cats.rows[0].id, 100, null, 5, null, upload.secure_url]
    );
    console.log("Insert OK", ins.rows[0].id);
    await pool.query("DELETE FROM utensils WHERE id = $1", [ins.rows[0].id]);
} catch (e) {
    console.error("FAIL:", e.message);
    if (e.detail) console.error("Detail:", e.detail);
    if (e.column) console.error("Column:", e.column);
} finally {
    await pool.end();
}
