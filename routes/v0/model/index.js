const express = require('express');
const router = express.Router();

const {reportRoutes} = require('./nestedRoutes');

const {model_service} = require('../../../services');


const file_name = 'model_router'
router.get('/', async (req, res, next) => {
    const function_name = 'get_all';
    try{
        const models = await model_service.query_all();
        return res.status(200).json({
            status: 1,
            message: 'models successfully queried',
            data: {models}
        });
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        next(err);
    }
});


router.post('/', async (req, res, next) => {
    const function_name = 'create';
    try{
        const {body} = req;
        const model_uuid = await model_service.insert(body);

        console.log(model_uuid);
        return res.status(200).json({
            status: 1,
            message: 'models successfully queried',
            data: {model_uuid}
        });
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        next(err);
    }
});


router.use('/:model_uuid', async (req, res, next) => {
    const function_name = 'model_uuid_middleware';
    try{
        const {params:  {model_uuid}} = req;
        const model = await model_service.query_uuid(model_uuid);

        if(!req.locals) req.locals = {};
        req.locals.model = model;

        next();
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        next(err);
    }
});

router.get('/:model_uuid', async (req, res, next) => {
    const function_name = 'get_one';
    try{
        const {locals: {model}} = req;

        return res.status(200).json({
            status: 1,
            message: 'model data successfully recieved',
            data: {
                model
            }
        })
    }
    catch(err){
        console.error(`${file_name}:${function_name}:err`);
        next(err);
    }
});

router.use('/:model_uuid/report', reportRoutes);

module.exports = router;