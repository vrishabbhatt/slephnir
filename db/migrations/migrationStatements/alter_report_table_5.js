const query = `ALTER TABLE report
ADD COLUMN name VARCHAR(64) not null,
ADD COLUMN description text;`
const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}