require('dotenv').config();

//types
const {envs} = require('./types')



module.exports = function(){
    try{
        console.log('verifying server configurations...');
        
        process.env.PORT = (process.env.PORT)? process.env.PORT : 3000;
        console.log('config: running server on the following port: ' + process.env.PORT);

        //env config:
        process.env.ENV = (envs[process.env.ENV])? envs[process.env.ENV] : envs.prd;
        console.log('config: running server in the following env mode: ' + process.env.ENV);

        //verify postgres settings
        console.log('verifying postgres configurations');
        if(!process.env.PGHOST) throw {name: 'configurationError', message: 'pg host not present'};
        if(!process.env.PGUSER) throw {name: 'configurationError', message: 'pg user not present'};
        if(!process.env.PGDATABASE) throw {name: 'configurationError', message: 'pg database not present'};
        if(!process.env.PGPASSWORD) throw {name: 'configurationError', message: 'pg password not present'};
        if(!process.env.PGPORT) throw {name: 'configurationError', message: 'pg port not present'};
        console.log('postgres configurations verified');

        //check if migrations need to be run
        if(process.env.ENV === envs.dev){
            process.env.RUNMIGRATIONS = (process.env.RUNMIGRATIONS && process.env.RUNMIGRATIONS === 'true')? 1 : 0;
            process.env.FORCERUNMIGRATIONSALL = (process.env.FORCERUNMIGRATIONSALL && process.env.FORCERUNMIGRATIONSALL === 'true')? 1 : 0;
            console.log('config: migrations will be run: ', process.env.RUNMIGRATIONS);
            console.log('config: all migrations to be forcefully run', process.env.FORCERUNMIGRATIONSALL);
        } else {
            process.env.RUNMIGRATIONS = 0;
        }

        //create pool
        require('./db/pg');
        require('./db/knex');

        //check multer file dir
        if(!process.env.MULTERDIR) process.env.MULTERDIR = 'raw/'
    }
    catch(err){
        console.log('err verifying startup configurations terminating server startup: ', err);
        throw err;
    }
}