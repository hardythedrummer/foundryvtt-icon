import { ItemModel } from "./item";
import { ClockField } from "../base";

const fields = foundry.data.fields;

export class CampModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            ambitions: new fields.SchemaField({
                c1: new ClockField({ }, { initial: () => ({ name: "Ambition 1" }) }),
                c2: new ClockField({ }, { initial: () => ({ name: "Ambition 2" }) }),
                c3: new ClockField({ }, { initial: () => ({ name: "Ambition 3" }) })
            }),
            // An array of compendium uuids
            // Ideally you don't edit typically this, and only show it when in a special unlock menu
            fixtures: new foundry.data.fields.ArrayField(new foundry.data.fields.StringField()),
        };
    }
}