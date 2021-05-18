
interface OrmConnectionCallback
{
    (err, result, fields);
}

export interface OrmConnection
{
    query(sql, callback?: OrmConnectionCallback);
}
