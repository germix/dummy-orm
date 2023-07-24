import { OrmConnection } from "./connection/OrmConnection";
import { OrmConnectionMysql } from "./connection/OrmConnectionMysql";
import { OrmConnectionPostgresql } from "./connection/OrmConnectionPostgresql";
import { OrmEntityDefinition } from "./entity/OrmEntityDefinition";
import { OrmConfigParams } from "./OrmConfigParams";
import { OrmException } from "./OrmException";
import { OrmSchemaBuilder } from "./OrmSchemaBuilder";
import { ConfigDriverType } from "./types";
import { OrmTableFieldType } from "./types/OrmTableFieldType";
import isString from "./utils/isString";

export const entityDefinitions: {[key: string]: OrmEntityDefinition} = {};

export class OrmConfig
{
    private params: OrmConfigParams;
    con: OrmConnection;
    dbname;
    entities = [];
    customTypes?:
    {
        name,
        type: typeof OrmTableFieldType,
    }[];

    constructor()
    {
    }

    /**
     * Initialize
     */
    public init(params: OrmConfigParams) : Promise<void>
    {
        this.params = params;
        return new Promise<void>((done, reject) =>
        {
            this.dbname = params.dbname,
            this.entities = params.entities;
            this.customTypes = params.customTypes || [];

            this.entities.forEach((e) =>
            {
                const ed = this.getEntityDefinition(e.name);

                //
                // Check valid entity definition
                //
                if(ed.name !== e.name)
                {
                    throw new OrmException(`Metadata for entity '${e.name}' not found`);
                }

                //
                // Patch extends
                //
                if(ed.extends !== undefined)
                {
                    ed.extends = this.getEntityDefinition(ed.extends.name);
                }

                //
                // Patch mapped by for OneToMany
                //
                if(ed.ormOneToMany !== undefined)
                {
                    for(const fieldName in ed.ormOneToMany)
                    {
                        const fieldParams = ed.ormOneToMany[fieldName];
                        console.log("fieldName", fieldName)
                        console.log("fieldParams", fieldParams)

                        // Buscar entidad relacionada
                        const mappedEntity = this.getEntityDefinition(fieldParams.entity);
                        if(!mappedEntity)
                        {
                            throw new OrmException(`Entity '${fieldParams.entity}' was not discovered (used in ${ed.name}.${fieldName})`);
                        }

                        if(mappedEntity.ormManyToOne === undefined)
                        {
                            mappedEntity.ormManyToOne = {};
                        }
                        if(mappedEntity.ormManyToOne[fieldParams.mappedBy] === undefined)
                        {
                            mappedEntity.ormManyToOne[fieldParams.mappedBy] = {
                                target: fieldParams.entity
                            }
                            console.log("PATH AAAAAAAAAAAAAA") // TODO:
                        }
                        else
                        {
                            console.log("PATH BBBBBBBBBBBBBBB") // TODO:
                        }
                    }
                }
            })

            this.entities.forEach((e) =>
            {
                const ed = this.getEntityDefinition(e.name);
                console.log("ed", ed)
            })

            //
            // Create connection
            //
            switch(params.type)
            {
                case 'mysql':
                    this.con = new OrmConnectionMysql();
                    break;
                case 'postgresql':
                    this.con = new OrmConnectionPostgresql();
                    break;
                default:
                    throw new OrmException("Invalid driver type");
            }

            //
            // Initialize
            //
            this.con.init(params);
            done();
        })
    }

    /**
     * Connect
     */
    public connect(): Promise<void>
    {
        return this.con.connect();
    }

    /**
     * Drop schema
     */
    public async dropSchema(): Promise<void>
    {
        const osb = new OrmSchemaBuilder(this);

        await osb.drop();
    }

    /**
     * Create schema
     */
    public async createSchema(): Promise<void>
    {
        const osb = new OrmSchemaBuilder(this);

        await osb.create();
        await osb.generate();
    }

    /**
     * Get driver type
     *
     * @returns Driver type
     */
    public getDriverType(): ConfigDriverType
    {
        return this.params.type;
    }

    public wrapTableName(tableName: string): string
    {
        return this.con.wrapTableName(tableName);
    }

    public wrapFieldName(fieldName: string): string
    {
        return this.con.wrapFieldName(fieldName);
    }

    public getEntityIds(ed: OrmEntityDefinition)
    {
        while(ed.extends !== undefined)
        {
            ed = ed.extends;
        }
        return ed.ormIds;
    }

    public getEntityFields(ed: OrmEntityDefinition)
    {
        let fields = {};
        while(ed !== undefined)
        {
            fields = {
                ...fields,
                ...ed.ormFields,
            }
            ed = ed.extends;
        }
        return fields;
    }

    public getEntityManyToOneFields(ed: OrmEntityDefinition)
    {
        let fields = {};
        while(ed !== undefined)
        {
            fields = {
                ...fields,
                ...ed.ormManyToOne,
            }
            ed = ed.extends;
        }
        return fields;
    }

    public getEntityDefinition(entityName) : OrmEntityDefinition
    {
        if(!isString(entityName))
        {
            entityName = entityName.name;
        }
        return entityDefinitions[entityName];
    }

    public getEntityDefinitionBase(ed: OrmEntityDefinition) : OrmEntityDefinition
    {
        while(ed.extends !== undefined)
        {
            ed = ed.extends;
        }
        return ed;
    }

    public createTableFieldType(type, fieldName, fieldData)
    {
        for(let i = 0; i < this.customTypes.length; i++)
        {
            if(this.customTypes[i].name == type)
            {
                return new (this.customTypes[i].type as any)(fieldName, fieldData);
            }
        }
        return null;
    }

    public findDefinitionFromFieldOrId(entityDefinition: OrmEntityDefinition, fieldName)
    {
        for(const fn in entityDefinition.ormIds)
        {
            if(fn == fieldName)
            {
                return entityDefinition;
            }
        }
        for(const fn in entityDefinition.ormFields)
        {
            if(fn == fieldName)
            {
                return entityDefinition;
            }
        }
        for(const fn in entityDefinition.ormManyToOne)
        {
            if(fn == fieldName)
            {
                return entityDefinition;
            }
        }
        if(entityDefinition.extends)
        {
            return this.findDefinitionFromFieldOrId(entityDefinition.extends, fieldName);
        }
        return null;
    }

    public findClass(entityClass)
    {
        let e = this.entities.find((e) =>
        {
            return e.name == entityClass;
        })
        return e;
    }
}
