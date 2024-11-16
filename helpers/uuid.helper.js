const { v4: uuidv4, v1: uuidv1 } = require('uuid');

const validators = require('./validation.helper');

//TODO: understand library better
//mimiq key can be passed, should this be done ?
const genUUID4 = () => {
    try{
        return uuidv4();
    }
    catch(err){
        console.error('uuidHelper:genUUID5 err generating UUID: ' + JSON.stringify(err));
        throw err;
    }
};


const genUUID1 = (ts) => {
    try{
        ts = (validators.isNumber(ts))? ts : Date.now();
        const v1options = {
            msecs: new Date(ts).getTime(),
        };
        return uuidv1(v1options); 
    }
    catch(err){
        console.error('uuidHelper:genUUID5 err generating UUID: ' + JSON.stringify(err))
        throw err;
    }
}

module.exports = {
    genUUID1,
    genUUID4
}

