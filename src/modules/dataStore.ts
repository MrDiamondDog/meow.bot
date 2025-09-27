import fs from "fs";

export type DataStore<T> = {
    name: string;
    data: T;

    save(): void;
    load(): void;
}

export function createStore<T>(name: string, defaultData: T) {
    return {
        name,
        data: defaultData,

        save() {
            fs.writeFileSync(`./data/${name}.json`, JSON.stringify(this.data, null, 4));
        },

        load() {
            if (!fs.existsSync(`./data/${name}.json`)) {
                console.error(`Data file for ${name} does not exist, creating`);
                fs.writeFileSync(`./data/${name}.json`, JSON.stringify({}, null, 4));
            }

            try {
                this.data = JSON.parse(fs.readFileSync(`./data/${name}.json`, "utf-8"));
            } catch (e) {
                console.error(`Failed to load data for ${name}: ${e}`);
            }
        },
    };
}
