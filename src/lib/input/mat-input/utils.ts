export class SelectionElement {
    public value: any;
    public print: string;

    public constructor(value: any, print: string) {
        this.value = value;
        this. print = print;
    }

    public toString = () : string => {
        return this.print;
    };
}
