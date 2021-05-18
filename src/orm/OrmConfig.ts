import { OrmConnection } from "./connection/OrmConnection";
import { OrmConnectionDummy } from "./connection/OrmConnectionDummy";
import { OrmConnectionMysql } from "./connection/OrmConnectionMysql";
import { OrmEntityDefinition } from "./entity/OrmEntityDefinition";
import { OrmConfigParams } from "./OrmConfigParams";
import { OrmTableFieldType } from "./types/OrmTableFieldType";
import isString from "./utils/isString";

export const entityDefinitions = {

};

export class OrmConfig
{
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

    public init({
        type,
        dbname,
        host,
        user,
        password,
        entities,
        customTypes,
    }: OrmConfigParams) : Promise<OrmConfig>
    {
        return new Promise((done, reject) =>
        {
            this.dbname = dbname,
            this.entities = entities;
            this.customTypes = customTypes || [];

            //
            // Patch extends
            //
            this.entities.forEach((e) =>
            {
                const ed = this.getEntityDefinition(e.name);
                if(ed.extends !== undefined)
                {
                    ed.extends = this.getEntityDefinition(ed.extends.name);
                }
            })

            //
            // Create connection
            //
            switch(type)
            {
                case 'dummy':
                    this.con = new OrmConnectionDummy();
                    done(this);
                    break;
                case 'mysql':
                    try
                    {
                        this.con = new OrmConnectionMysql({
                            host: host || "localhost",
                            user: user || "",
                            password: password || ""
                        }, () =>
                        {
                            done(this);
                        });
                    }
                    catch(error)
                    {
                        reject(error);
                    }
                    break;
            }
        })
    }

    public getEntityIds(ed: OrmEntityDefinition)
    {
        while(ed.extends !== undefined)
        {
            ed = ed.extends;
        }
        return ed.ormIds;
    }

/*
    private getEntityIds(entityDefinition: OrmEntityDefinition)
    {
        let ids = {};

        //
        // Ids from extends
        //
        if(entityDefinition.extends !== undefined)
        {
            let ed = entityDefinition;
            while(ed.extends !== undefined)
            {
                ed = ed.extends;
            }
            for(const idName in ed.ormIds)
            {
                ids[idName] = ed.ormIds[idName];
            }
        }

        //
        // Ids
        //
        for(const idName in entityDefinition.ormIds)
        {
            ids[idName] = entityDefinition.ormIds[idName];
        }

        return ids;
    }
*/

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
