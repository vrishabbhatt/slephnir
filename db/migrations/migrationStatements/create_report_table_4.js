const query = `create table if not exists report (
    id serial primary key,
    report_uuid varchar(64) not null UNIQUE ,
    model_uuid varchar(64) not null references model (model_uuid),
    status STATUS not null default 'pending',
    file_location text null,
    created_at timestamp default now(),
    updated_at timestamp default now()
)`

const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}