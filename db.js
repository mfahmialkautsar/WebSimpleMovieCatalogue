const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

pool.connect();
async function getAll(lineuid) {
    try {
        let get = await pool.query(
            `SELECT * FROM watchlists WHERE lineuid = '${lineuid}'`
        );
        return get.rows;
    } catch (error) {}
}

async function getMovies(lineuid) {
    try {
        let get = await pool.query(
            `SELECT * FROM watchlists WHERE lineuid = '${lineuid}' AND category = 'movie'`
        );
        return get.rows;
    } catch (error) {}
}

async function getTvs(lineuid) {
    try {
        let get = await pool.query(
            `SELECT * FROM watchlists WHERE lineuid = '${lineuid}' AND category = 'tv'`
        );
        return get.rows;
    } catch (error) {}
}

async function get(lineuid, id) {
    try {
        let get = await pool.query(
            `SELECT * FROM watchlists WHERE lineuid = '${lineuid}' AND filmid = ${id}`
        );
        return get.rows[0];
    } catch (error) {}
}

async function addUser(lineuid, linename) {
    try {
        await pool.query(`INSERT INTO users (lineuid, linename)
        SELECT * FROM (SELECT '${lineuid}', '${linename}') AS tmp
        WHERE NOT EXISTS (
            SELECT lineuid from users WHERE lineuid = '${lineuid}'
        ) LIMIT 1`);
    } catch (error) {}
}

async function addWL(lineuid, linename, movie) {
    try {
        addUser(lineuid, linename);
        let title = movie.title || movie.name;
        title = title.replace("'", "''");
        const insert = await pool.query(
            `INSERT INTO watchlists (wlid, lineuid, linename, filmid, filmTitle, category) 
            SELECT * FROM (SELECT '${
                lineuid + movie.id
            }', '${lineuid}', '${linename}', ${movie.id}, '${title}', '${
                movie.title ? "movie" : "tv"
            }') AS tmp
            WHERE NOT EXISTS (
                SELECT lineuid, filmid FROM watchlists WHERE lineuid = '${lineuid}' AND filmid = ${
                movie.id
            }
            ) LIMIT 1`
        );
        if (insert.rowCount == 0) {
            ``;
            return await delWL(lineuid, movie.id);
        }
        return insert;
    } catch (error) {
        if (error.code == 23505) {
            return await delWL(lineuid, movie.id);
        }
    }
}

async function delWL(lineuid, filmid) {
    try {
        const wl = await pool.query(
            `DELETE FROM watchlists WHERE lineuid = '${lineuid}' AND filmid = ${filmid}`
        );
        return wl;
    } catch (error) {}
}

module.exports = { getAll, get, addWL, delWL };
