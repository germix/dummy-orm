import { OrmConfig } from "./OrmConfig";
import { OrmManager } from "./OrmManager";

export class OrmReference<T>
{
    id;
    cfg: OrmConfig;
    value: T;
    className;

    constructor(value, cfg?: OrmConfig, className?)
    {
        if(cfg === undefined)
        {
            this.value = value;
            this.className = className;
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
