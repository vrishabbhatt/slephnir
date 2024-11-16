
const query = `alter table report 
rename file_location to raw_file_location;
alter table report add  report_location text null`
const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}
