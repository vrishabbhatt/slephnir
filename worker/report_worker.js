
const EventEmitter = require('node:events');
const eventEmitter = new EventEmitter()

const {report: db, model} = require('../db');
const v0_config = require('../config/csv_headers_v0.json');

const influxWorker = require('./influx_worker');

const {validationHelper, fileHelper} = require('../helpers');
const {error_types, status_types} = require('../types');


//helper functions
function chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}


class ReportWorker {
    class_name = 'report_worker'
    queue = [];

    constructor(){
        this.current_worker = null;
        this.raw_report_folders = process.env.MULTERDIR;

        this.influxWorkerstatus = true;
    }

    add(report_uuid){
        const function_name = 'add'
        try{
            const queue_length = this.queue.length;
            this.queue.push(report_uuid);

            if(queue_length === 0){ 
                //open the write api
                influxWorker.openWriteAPI();

                console.log(`${this.class_name}:${function_name}:queue emptry starting queue`);
                this.work().catch(err => {console.error(`${this.class_name}:${function_name}:err:${err}`)});
            }
        }
        catch(err){
            console.error(`${this.class_name}:${function_name}:err`, err)
            throw err;
        }
    }

    //function
    async work(){
        const function_name = 'work';
        try{
            if(this.current_worker != null) return;
            if(this.queue.length === 0){
                await this.workCompleted();
                return;
            }

            const current_report_uuid = this.queue.shift()
            this.current_worker = current_report_uuid;

            if(!this.influxWorkerstatus){
                influxWorker.openWriteAPI();
                this.influxWorkerstatus = true;
            }
            
            const report_obj_db_response = await db.query({report_uuid: current_report_uuid});
            console.log(`${this.class_name}:${function_name}:fetched report obj: ${JSON.stringify(report_obj_db_response)}`);

            if(report_obj_db_response.length == 0){
                console.error(`${this.class_name}:${function_name}:report ${current_report_uuid} no record found`);
                this.current_worker = null
                
                this.work().catch(err => {console.error(`${this.class_name}:${function_name}:err:${err}`)});
                return;
            }

            if(report_obj_db_response.length > 1){
                console.error(`${this.class_name}:${function_name}:report ${current_report_uuid} multiple matching records found`);
                this.current_worker = null
                
                this.work().catch(err => {console.error(`${this.class_name}:${function_name}:err:${err}`)});
                return;
            }

            const report_obj = report_obj_db_response[0];
            const {status} = report_obj;
            
            if(status != status_types.pending){
                //report state indicates report has already been processed
                console.error(`${this.class_name}:${function_name}:report ${current_report_uuid} already been processed`);
                this.current_worker = null
                
                this.work().catch(err => {console.error(`${this.class_name}:${function_name}:err:${err}`)});
                return
            }

            //parse report data
            const {model_uuid, report_uuid, raw_file_location, start_time, name} = report_obj;
            const data = await fileHelper.read_csv(`${process.cwd()}\\${raw_file_location}`);

            const process_data_arr = this.process(model_uuid, report_uuid, data, start_time, name);
            //break processed data into chunks
            const parsed_array_chunks = chunkArray(process_data_arr, 500);

            for(let i = 0; i < parsed_array_chunks.length; i ++){
                await influxWorker.writePoints(parsed_array_chunks[i]);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            console.log(`${this.class_name}:${function_name}: ${report_uuid} points written, moving to next`);
            
            this.current_worker = null;
            this.work().catch(err => {console.error(`${this.class_name}:${function_name}:err:${err}`)});
        }
        catch(err){
            console.error(`${this.class_name}:${function_name}:err`, err);
            throw err;
        }
    }

    process(model_uuid, report_uuid, raw_data, start_time, name){
        const function_name = 'process';
        try{
            //clean headers and parse and check for float
            const {headers, data} = raw_data;
            console.log('headers:', JSON.stringify(headers))
            if(headers.length !== 26) throw {name: error_types.validation, message: 'currently only files with 26 valid data point accepted during current version', status: 400};

            start_time = new Date(start_time);

            const process_data_arr = [];
            data.forEach((row) => {
                try{
                    const parsed_row = {};

                    const columns = Object.keys(row);            
                    columns.forEach((column) => {
                        try{
                            const column_name = column.replaceAll(/\s/g,'')
                            console.log(column);

                            const column_config = v0_config[column_name];
                            if(validationHelper.isNUll(column_config)) throw {name: error_types.validation, message: 'currently only file with the valid config headers are accepted during current version', status: 400} 
                        
                            const {display_name} = column_config;
                            const column_value = parseFloat(row[column]);

    
                            if(isNaN(column_value)) throw {name: error_types.processing, message: 'column value not parseable'};
                            parsed_row[display_name] = column_value;
                        }
                        catch(err){
                            throw err;
                        }
                    });

                    const ts = start_time.getTime() + (parsed_row.time * 1000);
                    delete parsed_row.time;

                    
                    const point = influxWorker.createPoint(model_uuid, {report_uuid, name}, parsed_row, ts);
                    process_data_arr.push(point)
                }
                catch(err){
                    console.error('err parsing row: ', err);
                }
            });

            return process_data_arr;
        }
        catch(err){
            console.error(`${this.class_name}:${function_name}:err`, err);
            throw err;
        }
    }

    async workCompleted(){
        const function_name = 'workCompleted';
        try{
            await influxWorker.closeWriteAPI();
            this.influxWorkerstatus = false;
        }
        catch(err){
            console.error(`${this.class_name}:${function_name}:err`, err);
            throw err;
        }
    }
}


//singleton pattern
report_worker = new ReportWorker();
module.exports = report_worker
