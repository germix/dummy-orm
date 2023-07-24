

export class OrmOneToManyCollection<T>
{
    public elements: T[] = [];
    public removedElements: T[] = [];
    public persistedElements: T[] = [];

    async load()
    {
    }

    push(elem: T)
    {
        this.elements.push(elem);
        this.persistedElements.push(elem);
    }

    remove(elem: T)
    {
        const index = this.elements.indexOf(elem);
        if(index !== -1)
        {
            this.elements.splice(index, 1);
            this.removedElements.push(elem);
        }
    }

}
