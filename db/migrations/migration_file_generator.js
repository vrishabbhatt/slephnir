const fs = require('node:fs');

const migration_file_string = 
`
const query = \`\`
const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}
`;

(() => {
    try{
        const file_name = process.argv[2];
        if(file_name == "" || file_name == null) throw {name: 'validationError', message: 'file name not provdied'}

        const migration_file_name = Date.now() + '_' + file_name +'.js';
        

        fs.writeFileSync(`./migrationStatements/${migration_file_name}`, migration_file_string)
    }
    catch(err){
        console.error("migration_file_generator:err", err);
        process.exit(1);
    }
})()