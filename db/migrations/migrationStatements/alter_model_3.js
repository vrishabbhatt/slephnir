const query = `ALTER TABLE model RENAME COLUMN model_uuid_uuid TO model_uuid;`
const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}