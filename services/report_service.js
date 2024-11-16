const fs = require('fs');
const path = require('path');

const {report: db} = require('../db');
const {reportWorker} = require('../worker');

const {uuidHelper, validationHelper, fileHelper} = require('../helpers');
const {error_types, status_types} = require('../types');

const csv_headers_config = require('../config/csv_headers_v0.json');

const file_name = 'report_service';
const multerDir = process.env.MULTERDIR;


const query_by_model_uuid = async (model_uuid) => {
    const function_name = 'query_by_model_uuid';
    try{
        const db_response = await db.query({model_uuid});
        if(db_response.length === 0) return [];

        return db_response.filter(report_row => {
            const {status} = report_row;
            return (status !== status_types.withdrawn)
        });
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        throw err;
    }
};

const processing = async (report_uuid, raw_file_location) => {

}


const create = async (model_uuid, raw_report_obj) => {
    const function_name = 'create';
    try{
        console.log(`${function_name}:raw_report_obj:${JSON.stringify(raw_report_obj)}`);


        const {filename} = raw_report_obj;
        //optional params to be verified
        let {name, description, start_time} = raw_report_obj;
        
        //set path to raw csv file
        const raw_file_dir = multerDir;
        const raw_file_location = raw_file_dir + '/' + filename;

        if(validationHelper.isNUll(description)) description = '';
        if(validationHelper.isNUll(start_time)) start_time = new Date(Date.now() - (12 * 60 * 60 * 1000));
        if(validationHelper.isNUll(name)) name = `model_flight_${filename.slice(0, -4)}`

        console.log(start_time);

        const report_obj = {
            model_uuid,
            name,
            raw_file_location,
            description,
            start_time
        }

        report_obj.report_uuid = uuidHelper.genUUID1();

        console.log(`${file_name}:${function_name}:obj about to inserted:${JSON.stringify(report_obj)}`);

        const db_response = await db.create(report_obj);
        if(db_response.length === 0) throw {name: error_types.processing, message: 'failed to save model', status: 500};
        
        console.log(`${function_name}:db_response:${JSON.stringify(db_response)}`);

        
        //begin report_worker
        saved_report_uuid = db_response[0];
        reportWorker.add(saved_report_uuid.report_uuid);
        
        return saved_report_uuid;
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        throw err;
    }
}


module.exports = {
    query_by_model_uuid,
    create
}
