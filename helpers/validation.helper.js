const isNumber = (n) => !isNaN(n);
const isObj = (obj) => typeof obj === 'object';

const isValidPositiveNumber = (a) =>  {
    if(!isNumber(a)) return false;
    return (a >= 0);
}

const isNUll = (n) => n == null;

const isValidTS = (n) => {
    if(!isValidPositiveNumber(n)) return false;

    const currentTime = Date.now();
    const providedTs = new Date(n * 1000).getTime();

    console.log('currentTime: ', currentTime);
    console.log('ts: ', providedTs);
    
    if(!isValidPositiveNumber(providedTs)) return false;
    return (currentTime >= providedTs);
}

module.exports = {
    isNumber,
    isObj,
    isNUll,
    isValidTS,
    isValidPositiveNumber
}