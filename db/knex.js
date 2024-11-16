
const {PGHOST: host, PGUSER: user, PGDATABASE: database, PGPASSWORD: password, PGPORT: port} = process.env;
const knex = require('knex')({
    client: 'pg',
    connection: {host,port,user,password,database},
});

module.exports = knex;