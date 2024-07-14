import { ItemModel } from "./item";

const fields = foundry.data.fields;
export class FixtureModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            description: new fields.HTMLField(),
            purchaseCost: new fields.NumberField({ positive: true, integer: true }),
            upgradeCost: new fields.NumberField({ positive: true, integer: true }),
            upgrades: new fields.ArrayField(new fields.SchemaField({
                description: new fields.HTMLField(),
                upgradeCostOverride: new fields.NumberField({ positive: true, integer: true }),
            })),
        };
    }
}

