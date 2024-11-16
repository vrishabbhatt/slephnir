const query = `create table if not exists model (
    id serial primary key,
    model_uuid_uuid varchar(64) not null UNIQUE ,
    model_name varchar(64) null,
    model_version varchar(64) default 'v0.01',
    status STATUS not null default 'pending',
    created_at timestamp default now(),
    updated_at timestamp default now()
)`

const shouldRun = 0;

module.exports = {
    shouldRun,
    query
}