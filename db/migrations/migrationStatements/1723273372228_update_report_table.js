
const query = `alter table report 
add description text null,
add start_time  timestamp default now()`;
const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}
