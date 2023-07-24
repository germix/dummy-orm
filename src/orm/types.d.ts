
export type FieldType =
      'text'
    | 'string'
    | 'boolean'
    | 'integer'
    | 'bigint'
    | 'tinyint'
    | 'smallint'
    | 'mediumint'
    | 'float'
    | 'double'
    | 'decimal'
    | 'date'
    | 'time'
    | 'datetime'
    | 'autoincrement'
    ;

export interface Constructable<T>
{
    new(...args: any) : T;
}

export declare type EntityClass<T extends Partial<T>> = Function & Constructable<T> &
{
    name: string;
    prototype: T;
};

export declare type ConfigDriverType = 'dummy'|'mysql'|'mariadb'|'postgresql';
