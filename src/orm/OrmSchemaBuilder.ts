import { OrmEntityDefinition } from "./entity/OrmEntityDefinition";
import { OrmConfig } from "./OrmConfig";
import { OrmException } from "./OrmException";
import { OrmTableBuilder } from "./OrmTableBuilder";
import { camelcaseToUnderscore, makeReferenceFieldId } from "./utils";
import { FieldType } from "./types";
import { OrmTableFieldType } from "./types/OrmTableFieldType";
import { OrmTableFieldTypeBigInt } from "./types/OrmTableFieldTypeBigInt";
import { OrmTableFieldTypeBoolean } from "./types/OrmTableFieldTypeBoolean";
import { OrmTableFieldTypeDate } from "./types/OrmTableFieldTypeDate";
import { OrmTableFieldTypeDatetime } from "./types/OrmTableFieldTypeDatetime";
import { OrmTableFieldTypeDecimal } from "./types/OrmTableFieldTypeDecimal";
import { OrmTableFieldTypeDouble } from "./types/OrmTableFieldTypeDouble";
import { OrmTableFieldTypeFloat } from "./types/OrmTableFieldTypeFloat";
import { OrmTableFieldTypeInteger } from "./types/OrmTableFieldTypeInteger";
import { OrmTableFieldTypeMediumInt } from "./types/OrmTableFieldTypeMediumInt";
import { OrmTableFieldTypeSmallInt } from "./types/OrmTableFieldTypeSmallInt";
import { OrmTableFieldTypeString } from "./types/OrmTableFieldTypeString";
import { OrmTableFieldTypeText } from "./types/OrmTableFieldTypeText";
import { OrmTableFieldTypeTime } from "./types/OrmTableFieldTypeTime";
import { OrmTableFieldTypeTinyInt } from "./types/OrmTableFieldTypeTinyInt";
import { OrmTableIdTypeAutoIncrement } from "./types/OrmTableIdTypeAutoIncrement";

export class OrmSchemaBuilder
{
    private config: OrmConfig;

    constructor(config: OrmConfig)
    {
        this.config = config;
    }

    public async drop()
    {
        return new Promise((done, reject) =>
        {
            this.config.con.query(`DROP DATABASE IF EXISTS \`${this.config.dbname}\``, () =>
            {
                done(undefined);
            });
        });
    }

    public async build()
    {
        return new Promise((done) =>
        {
            this.config.con.query(`CREATE DATABASE \`${this.config.dbname}\``, () =>
            {
                done(undefined);
            });
        })
        .then(() =>
        {
            return new Promise(async (done) =>
            {
                for await(const entity of this.config.entities)
                {
                    let entityName = entity.name;
                    let ed = this.config.getEntityDefinition(entityName);
                    let builder = new OrmTableBuilder(this.config.dbname);

                    //
                    // Table name
                    //
                    builder.setName(ed.tableName);

                    //
                    // Extends
                    //
                    if(ed.extends !== undefined)
                    {
                        let tmp = ed;
                        while(tmp.extends !== undefined)
                        {
                            tmp = tmp.extends;
                        }
                        this.generateIds(builder, tmp);
                    }

                    //
                    // Generate ids
                    //
                    this.generateIds(builder, ed);

                    //
                    // Generate fields
                    //
                    this.generateFields(builder, ed);

                    // Execute query
                    await new Promise((done) =>
                    {
                        this.config.con.query(builder.toSqlString(), () =>
                        {
                            done(undefined);
                        });
                    });
                }
                done(undefined);
            })
        })
    }

    private getTableField(name, data, ref?) : OrmTableFieldType
    {
        let field = null;
        if(!('type' in data))
        {
            throw new OrmException('Field type is not defined');
        }
        else
        {
            switch(data['type'] as FieldType)
            {
                case 'text':
                    field = new OrmTableFieldTypeText(name);
                    break;
                case 'string':
                    field = new OrmTableFieldTypeString(name);
                    if('length' in data)
                    {
                        field.setLength(data['length']);
                    }
                    break;
                case 'boolean':
                    field = new OrmTableFieldTypeBoolean(name);
                    break;
                case 'integer':
                    field = new OrmTableFieldTypeInteger(name);
                    break;
                case 'bigint':
                    field = new OrmTableFieldTypeBigInt(name);
                    break;
                case 'tinyint':
                    field = new OrmTableFieldTypeTinyInt(name);
                    break;
                case 'smallint':
                    field = new OrmTableFieldTypeSmallInt(name);
                    break;
                case 'mediumint':
                    field = new OrmTableFieldTypeMediumInt(name);
                    break;
                case 'float':
                    field = new OrmTableFieldTypeFloat(name);
                    break;
                case 'double':
                    field = new OrmTableFieldTypeDouble(name);
                    break;
                case 'decimal':
                    field = new OrmTableFieldTypeDecimal(name);
                    if('precision' in data)
                    {
                        field.setPrecision(data['precision']);
                    }
                    if('scale' in data)
                    {
                        field.setScale(data['scale']);
                    }
                    break;
                case 'date':
                    field = new OrmTableFieldTypeDate(name);
                    break;
                case 'time':
                    field = new OrmTableFieldTypeTime(name);
                    if('fraction' in data)
                    {
                        field.setFraction(data['fraction']);
                    }
                    break;
                case 'datetime':
                    field = new OrmTableFieldTypeDatetime(name);
                    if('fraction' in data)
                    {
                        field.setFraction(data['fraction']);
                    }
                    break;
                case 'autoincrement':
                    if(ref)
                        field = new OrmTableFieldTypeInteger(name);
                    else
                        field = new OrmTableIdTypeAutoIncrement(name);
                    break;
                default:
                    field = this.config.createTableFieldType(data['type'], name, data);
                    break;
            }
            if(data.nullable)
            {
                field.setNullable(true);
            }
        }
        return field;
    }

    private generateIds(builder: OrmTableBuilder, ed: OrmEntityDefinition, foreign = false)
    {
        for(const idName in ed.ormIds)
        {
            let idData = ed.ormIds[idName];

            let field = this.getTableField(idName, idData).setPrimaryKey(true);
            if(foreign)
            {
                field.setForeignKeyTable(ed.tableName);
                field.setForeignKeyColumn(idName);
            }
            builder.addField(field);
        }
    }

    private generateFields(builder: OrmTableBuilder, ed: OrmEntityDefinition)
    {
        // Normal fields
        for(const fieldName in ed.ormFields)
        {
            let field = this.getTableField(fieldName, ed.ormFields[fieldName]);

            builder.addField(field);
        }

        // ManyToOne fields
        for(const fieldName in ed.ormManyToOne)
        {
            let params = ed.ormManyToOne[fieldName];
            // Get target
            let target = params.target;
            // Get entity definition of target
            let edTarget = this.config.getEntityDefinition(target);

            Object.entries(this.config.getEntityIds(edTarget)).forEach(([idFieldName, idFieldData]) =>
            {
                let field = this.getTableField(
                    makeReferenceFieldId(fieldName, idFieldName),
                    idFieldData,
                    true);
                
                if(params.nullable)
                {
                    field.setNullable(true);
                }

                builder.addField(field);
            })
        }
    }
}
