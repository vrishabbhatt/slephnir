const express = require('express');
const router = express.Router({mergeParams: true});

const {model_service} = require('../../../../services');
const {multerHelper: {upload}, validationHelper} = require('../../../../helpers'); 

const {error_types} = require('../../../../types');

const file_name = 'model_report_router';

router.get('/', async (req, res, next) => {
    const file_name = 'get_all';
    try{
        const {locals: {model}} = req;
        const reports = await model_service.query_model_reports(model);

        return res.status(200).json({
            status: 1,
            message: 'model reports fetched successfully',
            data: { reports }
        });
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        next(err);
    }
});

router.post('/', upload.single('file') ,async (req, res, next) => {
    const function_name = 'insert';
    try{
        const {locals: {model}, file} = req;
        if(validationHelper.isNUll(file)) throw {name: error_types.data_not_found, message: 'file not found', status: 400};

        const {filename} = file;
        let {body} = req;
        if(validationHelper.isNUll(body)) body = {};
        body.filename = filename;

        const report_uuid = await model_service.insert_model_report(model, body);


        return res.status(200).json({
            status: 1,
            message: 'work in progress, report is being generated please check UI dashboard in a while',
            data: {report_uuid}
        })
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        next(err);
    }
})




module.exports = router