import { BgRed, Reset } from "../bash";
import { OrmEntityDefinition } from "./entity/OrmEntityDefinition";
import { OrmConfig } from "./OrmConfig";
import { OrmInsertBuilder } from "./OrmInsertBuilder";
import { EntityClass } from "./types";
import { camelcaseToUnderscore, getEntityFieldValue } from "./utils";

function isEmptyObject(obj)
{
    return Object.keys(obj).length === 0 && obj.constructor === Object
}

export class OrmManager
{
    private con;
    private config: OrmConfig;
    private entitiesToDelete = [];
    private entitiesToPersist = [];

    constructor(config: OrmConfig)
    {
        this.con = config.con;
        this.config = config;
    }

    public async findBy<T>(entityClass: EntityClass<T>, criteria) : Promise<T[]>
    {
        let ed = this.config.getEntityDefinition(entityClass.name);
        let entityDefinition = ed;

        //
        // Select
        //
        let sql = "SELECT ";
        let dbName = this.config.dbname;
        let tableName = ed.tableName;

        if(ed.extends === undefined)
        {
            sql += "*";
        }
        else
        {
            let fieldsToSelect = [];
            do
            {
                for(const fieldName in ed.ormFields)
                {
                    fieldsToSelect.push(`\`${fieldName}\``);
                }
                if(ed.extends !== undefined)
                {
                    ed = ed.extends;
                }
                else
                {
                    for(const idName in ed.ormIds)
                    {
                        fieldsToSelect.push(`\`${ed.tableName}\`.\`${idName}\` as \`${idName}\``);
                    }
                    ed = null;
                }
            }
            while(ed !== null);

            sql += fieldsToSelect.join(',');
        }

        //
        // From
        //
        sql += ` FROM \`${dbName}\`.\`${tableName}\``;

        //
        // Inner join
        //
        ed = entityDefinition;
        if(ed.extends !== undefined)
        {
            //
            // Get ids
            //
            let ids = this.config.getEntityIds(ed);

            //
            // ...
            //
            ed = ed.extends;
            do
            {
                sql += ` INNER JOIN \`${dbName}\`.\`${ed.tableName}\` ON `;
                let first = true;
                for(const idName in ids)
                {
                    if(!first)
                        sql += " AND ";
                    first = false;
                    sql += `\`${dbName}\`.\`${ed.tableName}\`.\`${idName}\` = \`${dbName}\`.\`${tableName}\`.\`${idName}\``;
                }
                ed = ed.extends;
            }
            while(ed !== undefined);
        }

        //
        // Where
        //
        if(criteria !== undefined && !isEmptyObject(criteria))
        {
            sql = "SELECT * FROM (" + sql + ") AS tmp";
            sql += " WHERE ";
            let first = true;
            for(const columnName in criteria)
            {
                const columnValue = criteria[columnName];
                if(!first)
                    sql += " AND ";
                first = false;
                const underscoreColumnName = camelcaseToUnderscore(columnName);
                if(columnValue === null)
                    sql += `\`${underscoreColumnName}\` = NULL`;
                else
                    sql += `\`${underscoreColumnName}\` = '${columnValue}'`;
            }
        }

        sql += ';';
        console.log(BgRed + "QUERY" + Reset + ": ")
        console.log(sql)

        return new Promise((done, reject) =>
        {
            let resultEntities: T[] = [];

            //
            // Execute
            //
            this.config.con.query(sql, async function(err, result, fields)
            {
                if(err)
                {
                    reject(err);
                }
                else
                {
                    //
                    // Map rows to entities
                    //
                    result.forEach((row) =>
                    {
                        let entity = new entityClass();

                        for(const columnName in row)
                        {
                            entity[columnName] = row[columnName];
                        }

                        resultEntities.push(entity);
                    });
                    // Done
                    done(resultEntities);
                }
            });
        })
    }

    public async findOneBy<T>(entityClass: EntityClass<T>, criteria) : Promise<T>
    {
        return new Promise((done) =>
        {
            this.findBy(entityClass, criteria).then((result) =>
            {
                if(result.length == 0)
                    done(null);
                else
                    done(result[0]);
            });
        });
    }

    public delete(entity) : OrmManager
    {
        this.entitiesToDelete.push(entity);
        return this;
    }

    public persist(entity) : OrmManager
    {
        this.entitiesToPersist.push(entity);
        return this;
    }

    public async flush() : Promise<any[]>
    {
        let allPromises = [];
        this.entitiesToDelete.forEach((entity) =>
        {
            allPromises.push(this.deleteEntity(entity, entity.constructor.name));
        });
        this.entitiesToDelete = [];

        this.entitiesToPersist.forEach((entity) =>
        {
            allPromises.push(this.persistEntity(entity, entity.constructor.name));
        });
        this.entitiesToPersist = [];

        return Promise.all(allPromises);
    }

    public deleteAndFlush(entity) : Promise<any>
    {
        return this.delete(entity).flush();
    }

    public persistAndFlush(entity) : Promise<any>
    {
        return this.persist(entity).flush();
    }

    private async deleteEntity(entity, entityName) : Promise<any>
    {
        let ed: OrmEntityDefinition = this.config.getEntityDefinition(entityName);
        let tableName = ed.tableName;

        while(ed.extends !== undefined)
        {
            ed = ed.extends;
        }
        let sql = `DELETE FROM \`${this.config.dbname}\`.\`${tableName}\` WHERE `;
        let first = true;

        for(const idName in ed.ormIds)
        {
            if(!first)
                sql += " AND ";
            first = true;
            let idValue = getEntityFieldValue(entity, idName);
            if(idValue === null)
                sql += `\`${idName}\` = null`;
            else
                sql += `\`${idName}\` = '${idValue}'`;
        }
        sql += ";";

        return new Promise((done) =>
        {
            this.con.query(sql, () =>
            {
                done();
            });
        });
    }

    private async persistEntity(entity, entityName) : Promise<any>
    {
        let ed: OrmEntityDefinition = this.config.getEntityDefinition(entityName);
        let builder = (new OrmInsertBuilder(this.config, ed.tableName));

        if(ed.extends !== undefined)
        {
            let baseEntity = ed.extends;
            let baseEntityName = baseEntity.name;

            await this.persistEntity(entity, baseEntityName);

            while(baseEntity.extends !== undefined)
            {
                baseEntity = baseEntity.extends;
            }
            for(const columnName in baseEntity.ormIds)
            {
                this.addInsertColumn(builder, entity, columnName, baseEntity.ormIds[columnName]);
            }
        }

        // OnPreInsert
        if(entity.ormOnPreInsert) entity.ormOnPreInsert();

        // Add insert values
        for(const columnName in ed.ormIds) this.addInsertColumn(builder, entity, columnName, ed.ormIds[columnName]);
        for(const columnName in ed.ormFields) this.addInsertColumn(builder, entity, columnName, ed.ormFields[columnName]);

        // Execute
        return new Promise((done) =>
        {
            this.con.query(builder.getSqlQuery(), () =>
            {
                // OnPostInsert
                if(entity.ormOnPostInsert) entity.ormOnPostInsert();

                done();
            });
        })
    }

    private addInsertColumn(builder, entity, columnName, columnData)
    {
        if(columnData.type == 'autoincrement')
        {
        }
        else
        {
            builder.add(columnName, getEntityFieldValue(entity, columnName));
        }
    }
}
