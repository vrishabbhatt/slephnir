const {model: db} = require('../db');
const report_service = require('./report_service');

const {uuidHelper} = require('../helpers');
const {error_types, status_types} = require('../types');

const file_name = 'model_service';




const insert = async (model_obj) => {
    const function_name = 'insert';
    try{
        if(model_obj == null) throw {name: error_types.validation, message: 'model obj is null or missing', status: 400};
        if(typeof(model_obj) !== 'object') throw {name: error_types.validation, message: 'model obj not of type obj', status: 400};

        const {model_name, model_version} = model_obj
        const parsed_model_obj = {};

        //no validations lightweight
        if(model_name) parsed_model_obj.model_name = model_name;
        if(model_version) parsed_model_obj.model_version = model_version;

        parsed_model_obj.model_uuid = uuidHelper.genUUID1(Date.now());
        parsed_model_obj.status = status_types.active;

        const db_response =  await db.create(parsed_model_obj);
        if(db_response.length === 0) throw {name: error_types.processing, message: 'failed to save model', status: 500};
        return db_response[0];
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err:${err}`);
        throw err;
    }
}


const query_all = async () => {
    const function_name = 'query_all';
    try{
        return db.query();
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err:${err}`);
        throw err;
    }
}


const query_uuid = async (model_uuid) => {
    const function_name = 'query_uuid';
    try{
        const db_response = await db.query({model_uuid});
        
        if(db_response.length === 0) throw {name: error_types.data_not_found, message: 'model with same uuid not found', status: 400};
        if(db_response.length > 1) throw {name: error_types.processing, message: 'more than one model found with the same uuid', status: 500};

        const {status} = db_response[0];
        if(status === status_types.withdrawn) throw {name: error_types.data_not_found, message: 'model with same uuid not found or deleted', status: 400};
    
        return db_response[0];
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err:${err}`);
        throw err;
    }
};

const query_model_reports = async (model) => {
    const function_name = 'query_model_reports';
    try{
        const {model_uuid} = model;
        return report_service.query_by_model_uuid(model_uuid);
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err:${err}`);
        throw err;
    }
};

const insert_model_report = async (model, raw_report_obj) => {
    const function_name = 'insert_model_reports';
    try{
        console.log(process.env.MULTERDIR)
        const {model_uuid} = model;
        return await report_service.create(model_uuid, raw_report_obj);
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err:${err}`);
        throw err;
    }
}

module.exports = {
    insert,
    query_all,
    query_uuid,
    query_model_reports,
    insert_model_report
}