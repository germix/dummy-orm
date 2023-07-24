import { OrmConfig } from "./OrmConfig";
import { OrmException } from "./OrmException";
import { OrmManager } from "./OrmManager";

export class OrmReference<T>
{
    id;
    cfg: OrmConfig;
    value: T;
    className: string;

    constructor(value, cfg?: OrmConfig, className?)
    {
        if(value === null)
            throw new OrmException("Orm reference value is null");
        if(value === undefined)
            throw new OrmException("Orm reference value is undefined");

        if(cfg === undefined)
        {
            this.value = value;
            this.className = value.constructor.name;
        }
        else
        {
            this.id = value;
            this.cfg = cfg;
            this.className = className;
        }
    }

    async get() : Promise<T>
    {
        return new Promise(async (done, reject) =>
        {
            if(this.value !== undefined)
            {
                done(this.value)
            }
            else
            {
                if(this.id === null)
                {
                    this.value = null;
                }
                else
                {
                    this.value = await (new OrmManager(this.cfg)).findOneBy(this.className,
                    {
                        id: this.id
                    });
                }
                done(this.value);
            }
        });
    }
    set(value: T)
    {
        this.value = value;
    }
}
