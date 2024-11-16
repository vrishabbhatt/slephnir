const pg = require('pg');

//create pool with pg db env values
const {PGHOST: host, PGUSER: user, PGDATABASE: database, PGPASSWORD: password, PGPORT: port} = process.env;
const pool = new pg.Pool({
    user,
    password,
    host,
    port,
    database
});

console.log("pool initialised");
//export pool
module.exports = pool;
