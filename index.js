const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');

//router
const router = require('./routes');

//helpers
const {uuidHelper, responseHelper} = require('./helpers');

const {genUUID1} = uuidHelper;
const {errorResponse} = responseHelper;


(async () => {
    try{
        config();
        console.log('logs initialised');

        //run migrations in dev environment
        if(parseInt(process.env.RUNMIGRATIONS)){
            const migrationRunner = require('./db/migrations');
            await migrationRunner();
        }

        //setup app
        const app = express();
        const port =  (process.env.PORT)? process.env.PORT : 3000;

        // support parsing of application/json type post data
        app.use(bodyParser.json());

        app.get('/', (req, res) => {
            res.send('Hello World!')
        });

        //generate a requestId to track requests
        app.use((req, res, next) => {
            try{
                if(!req.locals) req.locals = {};
                req.locals.reqId = genUUID1(Date.now());
                next();    
            }
            catch(err){
                errorLogger('err generating request id: ', err);
                next(err);
            }
        });

        app.use(router);

        app.use(function (err, req, res, next) {
            if(err){
                const {locals: {reqId}} = req;
                const errorMessage = (typeof err === 'string')? err : JSON.stringify(err);

                //logging the error
                console.error(`request with id: ${reqId}, failed with the error: ${errorMessage}`);
                
                //returning an error response
                return errorResponse(res, err);
            }
        })

        app.listen(port, () => {
            console.log(`app listening at ${port}`)
        });
    }
    catch(err){
        console.error('main: err stating server', err);
    }
})();