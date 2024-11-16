const knex = require('./knex');
const table_name = 'report';


const create = async (model_obj) => {
    try{
        return await knex(table_name).insert(model_obj, ['report_uuid']);
    }
    catch(err){
        console.error('model_db:create_err:', err);
        throw err;
    }
};


const query =  async (query_obj = {}, select_obj = null) => {
    try{
        return await knex(table_name).select(select_obj).where(query_obj);
    }
    catch(err){
        console.error('model_db:create_err:', err);
        throw err;
    }
};


const update = async (model_uuid, update_obj) => {
    try{
        return await knex(table_name).where({model_uuid}).update(update_obj);
    }
    catch(err){
        console.error('model_db:create_err:', err);
        throw err;
    }
};


module.exports = {
    create,
    query,
    update
}