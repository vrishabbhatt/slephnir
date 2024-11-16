//requiring path and fs modules
const path = require('path');
const fs = require('fs');
//joining path of directory 
const directoryPath = path.join(__dirname, 'migrationStatements');
//passsing directoryPath and callback function

const pgPool = require('../pg');


module.exports = async function(){
    try{
        if(!process.env.RUNMIGRATIONS || !parseInt(process.env.RUNMIGRATIONS)){
            console.log('migrations: migrations not enabled, terminating...');
            return;
        }

        const runAll = (!process.env.FORCERUNMIGRATIONSALL || !parseInt(process.env.FORCERUNMIGRATIONSALL))? false : true;
        console.log('will run all migrations: ', runAll);

        // const query_str = 'SELECT NOW();'
        // await pgPool.query(query_str).then(res => {console.log(`query: ${query_str} res: ${JSON.stringify(res)}`)}).catch(err => {console.log('err: ', err); throw err;});    
                    
        
        fs.readdir(directoryPath, async function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            //listing all files

            for(let i = 0; i < files.length; i ++ ){
                try{
                    const file = files[i];
                    console.log('fetching migration information for: ', file); 
                    
                    const queryObj = require(`./migrationStatements/${file}`);
                    const {shouldRun, query} = queryObj;
            
                    if(runAll || shouldRun){
                        console.log('running query: ', query);
                        await pgPool.query(query).then(res => {console.log(`query: ${query} res: ${JSON.stringify(res)}`)}).catch(err => {console.log('err: ', err); throw err;});    
                    }
                }
                catch(err){
                    console.log('err running query: ', err);
                }
            }
        });
    }
    catch(err){
        console.log('migrations: err running migrations ', err);
    }
}
