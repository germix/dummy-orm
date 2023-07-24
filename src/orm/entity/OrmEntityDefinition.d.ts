export type OrmOneToManyData =
{
    entity: string;
    mappedBy: string;
};

export type OrmOneToManyDataMap = {[key: string]: OrmOneToManyData};

export type OrmManyToOneData =
{
    target?;
    nullable?: boolean;
};

export type OrmManyToOneDataMap = {[key: string]: OrmManyToOneData};

export interface OrmEntityDefinition
{
    /**
     * Entity name
     */
    name: string;

    /**
     * Table/Collection name
     */
    tableName: string;

    /**
     * Entity ids
     */
    ormIds?: {[key: string]: any};

    /**
     * Entity fields
     */
    ormFields?: {[key: string]: any};

    /**
     * Entity fields (OneToMany)
     */
    ormOneToMany?: OrmOneToManyDataMap;

    /**
     * Entity fields (ManyToOne)
     */
    ormManyToOne?: OrmManyToOneDataMap;

    /**
     * Entity that extends
     */
    extends?: OrmEntityDefinition;

    /**
     * Indicates if the entity is an abstract entity
     */
    isAbstract?: boolean;

    /**
     * Discriminator value
     */
     discriminatorValue?: string;

    /**
     * Discriminator column
     */
    discriminatorColumn?: string;
}
