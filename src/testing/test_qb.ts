import { Comment } from "../app/Comment";
import { User } from "../app/User";
import { OrmEntityDefinition } from "../orm/entity/OrmEntityDefinition";
import { OrmConfig } from "../orm/OrmConfig";
import { OrmQueryResult } from "../orm/OrmQueryResult";
import { OrmQueryRunner } from "../orm/OrmQueryRunner";
import { Parser } from "../orm/parser/Parser";
import { ParserException } from "../orm/parser/ParserException";
import isObject from "../orm/utils/isObject";
import isString from "../orm/utils/isString";
import { Customer } from "./entity/Test";
import { logError } from "./log";
import { OrmEntityMapper } from "./OrmEntityMapper";

class SelectExpr
{
    fields;

    constructor(fields)
    {
        this.fields = fields;
    }
};

class FromExpr
{
    entity;
    alias;

    constructor(entity, alias)
    {
        this.entity = entity;
        this.alias = alias;
    }
}

function innerJoin(config: OrmConfig, entityDefinition: OrmEntityDefinition)
{
    let dbName = config.dbname;

    //
    // Inner join
    //
    let ed = entityDefinition;
    let sql = '';
    if(ed.extends !== undefined)
    {
        //
        // Get ids
        //
        let ids = config.getEntityIds(ed);

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
                sql += `\`${dbName}\`.\`${ed.tableName}\`.\`${idName}\` = \`${dbName}\`.\`${entityDefinition.tableName}\`.\`${idName}\``;
            }
            ed = ed.extends;
        }
        while(ed !== undefined);
    }
    return sql;
}

class OrmQueryBuilder
{
    private config: OrmConfig;
    private selectExpr: SelectExpr = null;
    private fromParts: FromExpr[] = [];
    private whereExpr: {};

    constructor(cfg: OrmConfig)
    {
        this.config = cfg;
    }

    public select(fields) : OrmQueryBuilder
    {
        if(this.selectExpr != null)
        {
            // TODO
        }
        this.selectExpr = new SelectExpr(fields);

        return this;
    }

    public from(from, alias) : OrmQueryBuilder
    {
        this.fromParts.push(new FromExpr(from, alias));

        return this;
    }

    public where(where) : OrmQueryBuilder
    {
        this.whereExpr = where;

        return this;
    }

    public getSqlQuery() : string
    {
        if(this.selectExpr != null)
        {
            const sql = this.getSelectQuery();
            this.reset();
            return sql;
        }
        throw new ParserException("TODO:");
    }

    private reset(): void
    {
        this.selectExpr = null;
        this.fromParts = [];
        this.whereExpr = null;
    }

    private getSelectQuery() : string
    {
        const cfg = this.config;
        let sql = '';
        let dbName = this.config.dbname;

        let lastSubAliasId = 1;

        let aliasTablesToData = {};
        let aliasFieldsToData = {};

        let fieldsToSelect = [];
        let fromClauses = [];
        let whereClause = null;

        if(this.fromParts.length > 0)
        {
            this.fromParts.forEach((from) =>
            {
                let entityDefinition = this.config.getEntityDefinition(from.entity.name);
                let tableName = entityDefinition.tableName;
                let mainSubAlias = 't' + lastSubAliasId++;
                // TODO: let fromClause = `\`${dbName}\`.\`${tableName}\` ${mainSubAlias}`;
                let fromClause = `${cfg.wrapTableName(tableName)} ${mainSubAlias}`;

                aliasTablesToData[from.alias] = {};
                aliasTablesToData[from.alias][tableName] = mainSubAlias;

                {
                    let ed = entityDefinition;
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
                            let first = true;
                            let joinSubAlias = 't' + lastSubAliasId++;

                            // TODO: fromClause += ` INNER JOIN \`${dbName}\`.\`${ed.tableName}\` ${joinSubAlias} ON `;
                            fromClause += ` INNER JOIN ${cfg.wrapTableName(ed.tableName)} ${joinSubAlias} ON `;
                            aliasTablesToData[from.alias][ed.tableName] = joinSubAlias;

                            for(const idName in ids)
                            {
                                if(!first)
                                    fromClause += " AND ";
                                first = false;
                                // TODO: fromClause += `${mainSubAlias}.\`${idName}\` = ${joinSubAlias}.\`${idName}\``;
                                fromClause += `${mainSubAlias}.${cfg.wrapFieldName(idName)} = ${joinSubAlias}.${cfg.wrapFieldName(idName)}`;
                            }
                            ed = ed.extends;
                        }
                        while(ed !== undefined);
                    }
                }

                fromClauses.push(fromClause);

            })
            //sql += " FROM " + fromClauses.join(', ');
        }

        //
        // Fields to select
        //
        Object.entries(this.selectExpr.fields).forEach(([key, value]) =>
        {
            const fromAlias = key;
            const splittedFields = (value as string).split(',');
            const entityDefinition = this.findEntityDefinitionFromAlias(fromAlias);

            splittedFields.forEach((fieldName) =>
            {
                const {
                    subAlias,
                    fieldNameAs,
                    fieldNameOriginal,
                } = this.getFieldData(aliasTablesToData, fromAlias, entityDefinition, fieldName);
                /*
                let fieldNameParts = fieldName.split(" as ");

                console.log(fieldNameParts)

                let fieldNameAs = (fieldNameParts.length == 2) ? fieldNameParts[1] : fieldName;
                let fieldNameOriginal = (fieldNameParts.length == 2) ? fieldNameParts[0] : fieldName;

                let entityDefinitionFromField = this.config.findDefinitionFromFieldOrId(entityDefinition, fieldNameOriginal);
                console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrr')
                console.log(entityDefinitionFromField);

                let subAlias = aliasTablesToData[fromAlias][entityDefinitionFromField.tableName];
                console.log('subAlias: ' + subAlias)
                console.log(aliasTablesToData[fromAlias]);
                console.log(entityDefinitionFromField.tableName)
*/
                fieldsToSelect.push(`${subAlias}.${fieldNameOriginal} as ${fieldNameAs}`);
            });
        });

        //
        // Where clauses
        //
        if(isString(this.whereExpr))
        {
            whereClause = this.whereExpr;
        }
        else if(isObject(this.whereExpr))
        {
            whereClause = this.buildWhere(this.whereExpr, aliasTablesToData);
        }

        sql += 'SELECT ' + fieldsToSelect.join(', ');
        if(fromClauses.length > 0)
        {
            sql += " FROM " + fromClauses.join(', ');
        }
        if(whereClause != null)
        {
            sql += " WHERE " + whereClause;
        }

        return sql;
    }

    private getFieldData(aliasTablesToData, fromAlias, entityDefinition: OrmEntityDefinition, fieldName)
    {
        const fieldNameParts = fieldName.split(" as ");
        const fieldNameAs = (fieldNameParts.length == 2) ? fieldNameParts[1] : fieldName;
        const fieldNameOriginal = (fieldNameParts.length == 2) ? fieldNameParts[0] : fieldName;
        const entityDefinitionFromField = this.config.findDefinitionFromFieldOrId(entityDefinition, fieldNameOriginal);
        const subAlias = aliasTablesToData[fromAlias][entityDefinitionFromField.tableName];

        return {
            subAlias,
            fieldNameAs,
            fieldNameOriginal,
        }
    }

    private findEntityDefinitionFromAlias(fromAlias: string): OrmEntityDefinition
    {
        const from = this.fromParts.find((from) =>
        {
            return from.alias == fromAlias;
        });
        if(!from)
        {
            // TODO
        }

        const entityDefinition = this.config.getEntityDefinition(from.entity.name);

        return entityDefinition;
    }

    private buildWhere(whereExpr: {[key: string]: any}, aliasTablesToData: any): string
    {
        const whereAnds: string[] = [];

        for(const key in whereExpr)
        {
            const fromAlias = key;
            const whereValue = whereExpr[fromAlias];

            if(key === "$or")
            {
                if(Array.isArray(whereValue))
                {
                    const whereOrs = [];
                    whereValue.forEach((v) =>
                    {
                        whereOrs.push(this.buildWhere(v, aliasTablesToData))
                    })
                    whereAnds.push(`(${whereOrs.join(" OR ")})`);
                }
                else
                {
                    throw new ParserException("TODO:");
                }
            }
            else if(key === "$and")
            {
                if(Array.isArray(whereValue))
                {
                    whereValue.forEach((v) =>
                    {
                        whereAnds.push(this.buildWhere(v, aliasTablesToData))
                    })
                }
                else
                {
                    throw new ParserException("TODO:");
                }
            }
            else if(key.startsWith("$"))
            {
                // TODO:
            }
            else
            {
                whereAnds.push(...this.buildWhereAND(fromAlias, whereValue, aliasTablesToData));
            }
        }
        return whereAnds.join(" AND ");
    }

    private buildWhereAND(fromAlias: string, whereValue: any, aliasTablesToData: any): string[]
    {
        const whereAnds: string[] = [];
        const entityDefinition = this.findEntityDefinitionFromAlias(fromAlias);

        for(const fieldName in whereValue)
        {
            const {
                subAlias,
                fieldNameAs,
                fieldNameOriginal,
            } = this.getFieldData(aliasTablesToData, fromAlias, entityDefinition, fieldName);
            const fieldValue = whereValue[fieldName];

            let expr = null;
            if(isString(fieldValue))
            {
                expr = `${subAlias}.${fieldNameOriginal} = '${fieldValue}'`;
            }

            if(expr == null)
            {
                // TODO:
                throw new ParserException("TODO: Expression is null");
            }
            whereAnds.push(expr);
        }

        return whereAnds;
    }
};

export async function test_qb(config: OrmConfig)
{
    let qb = new OrmQueryBuilder(config);

    if(true)
    {
    console.log('----------------------------')

    if(false)
    {
        qb.select({
            c: 'id,name,type as kind'
        })
        .from(Customer, 'c')
        .where({
            c: {
                id: '14'
            }
        })
        ;
        console.log(qb.getSqlQuery());
    }

    if(false)
    {
        qb.select({
            u: 'id,username'
        })
        .from(User, 'u')
        .where({
            $or: [
                {
                    u: {
                        id: '8'
                    }
                },
                {
                    u: {
                        id: '9'
                    }
                }
            ]
        })
        ;

        console.log(qb.getSqlQuery());
    }

    if(true)
    {
        qb.select({
            u: 'id,username'
        })
        .from(User, 'u')
        .where({
            $and: [
                {
                    u: {
                        id: '10'
                    }
                },
                {
                    u: {
                        username: "User 3",
                        password: '123'
                    }
                }
            ]
        })
        ;

        console.log(qb.getSqlQuery());
    }

    console.log('----------------------------')

    process.exit();

    //
    // Execute
    //
    config.con.query(sql, async function(err, result, fields)
    {
        if(err)
        {
            console.error(err)
            //reject(err);
        }
        else
        {
            console.log(result);
            /*
            (new OrmEntityMapper()).map(Customer, result, (entities) =>
            {
                console.log(entities)
            })
            */
        }
    });
}

/*
    SELECT u.id,u.username
        FROM User u
*/
/*
    SELECT u{id,username}
        FROM User u
*/

    let qr = new OrmQueryRunner(config);
    let query1 = `
    SELECT u.id,u.username
        FROM User u
    `;
    let query2 = `
    SELECT u{id,username}
        FROM User u
        WHERE u.id == 3 && u.id >= 2
    `;
    let query3 =
    `
    SELECT e{id,employeeField}
        FROM Employee e
    `
    let query4 = `
    SELECT u{id,username}
        FROM User u
        WHERE u.username LIKE '%5'
    `;

    let query10 = `SELECT u{id,username} FROM User u WHERE u.id == 2 + 2`;
    let query11 = `SELECT u{id,username} FROM User u WHERE u.id == 3 - 2`;
    let query7 = `SELECT u{id,username} FROM User u WHERE u.id == 2 * 2`;
    let query8 = `SELECT u{id,username} FROM User u WHERE u.id == 2 / 2`;
    let query9 = `SELECT u{id,username} FROM User u WHERE u.id == 3 % 2`;
    let query5 = `SELECT u{id,username} FROM User u WHERE u.id == 2 << 1`;
    let query6 = `SELECT u{id,username} FROM User u WHERE u.id == 4 >> 1`;
    let query12 = `SELECT u{id,username} FROM User u WHERE u.id == 2 | 1`;
    let query13 = `SELECT u{id,username} FROM User u WHERE u.id == 2 & 2`;
    let query14 = `SELECT u{id,username} FROM User u WHERE u.id < 3`;
    let query15 = `SELECT u{id,username} FROM User u WHERE u.id <= 3`;
    let query16 = `SELECT u{id,username} FROM User u WHERE u.id > 3`;
    let query17 = `SELECT u{id,username} FROM User u WHERE u.id >= 3`;
    let query18 = `SELECT u{id,username} FROM User u WHERE u.id != 3`;
    let query19 = `SELECT u{id,username} FROM User u WHERE u.id == 3`;
    let query20 = `SELECT u{id,username} FROM User u WHERE u.id BETWEEN 2 AND 3`;
    let query21 = `SELECT u FROM Comment u WHERE NOT u.id BETWEEN 2 AND 3`;

    console.log(await qr.run("query21"));

    console.log('-----------------------------------------')

    console.log(await qr.run('DELETE FROM Comment c WHERE c.id == 4'));

}
