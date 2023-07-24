
export interface OrmEntityInterface
{
    ormOnPreInsert?();
    ormOnPostInsert?();
    ormOnPreUpdate?();
    ormOnPostUpdate?();
}
