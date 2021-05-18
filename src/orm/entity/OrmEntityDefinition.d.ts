
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
    ormIds: [];

    /**
     * Entity fields
     */
    ormFields: [];

    /**
     * Entity fields (OneToMany)
     */
    ormOneToMany: [];

    /**
     * Entity fields (ManyToOne)
     */
    ormManyToOne: any[];

    /**
     * Entity that extends
     */
    extends;

    /**
     * Indicates if the entity is an abstract entity
     */
    isAbstract?;

    /**
     * Discriminator value
     */
     discriminatorValue?;
    
    /**
     * Discriminator column
     */
    discriminatorColumn?;
}
