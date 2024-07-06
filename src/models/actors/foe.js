import { ClockField, FakeBoundedNumberField } from "../base";
import { ClassField } from "../items/job";
import { ActorModel } from "./actor";

const fields = foundry.data.fields;
export class ConditionsField extends fields.SchemaField {
    constructor(options = {}) {
        super({
            // Disable unless is this special class type (legend, etc)
            is_type: new fields.StringField({ nullable: true, initial: null }),
            // Disable unless isnt this special class type (legend, etc)
            isnt_type: new fields.StringField({ nullable: true, initial: null }),
            // Disable unless above this chapter
            above_chapter: new fields.ArrayField(new fields.StringField()),
            // Disable unless below this chapter
            below_chapter: new fields.ArrayField(new fields.StringField()),
        }, options);
    }
}


export class FoeModel extends ActorModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),

            // Tactics and description
            description: new fields.HTMLField(),
            setup: new fields.HTMLField(),

            // Metadata
            chapter: new fields.NumberField({ nullable: false, integer: true, initial: 1, min: 1, max: 3 }),
            template: new fields.StringField({ initial: "Normal", choices: [
                "Normal",
                "Elite",
                "Mob",
                "Legend",
            ] }),
            faction: new fields.StringField({ initial: "Folk" }),

            // Class is built directly into the foe
            class: new ClassField(),

            // If set & nonzero, use this instead of 4*VIT
            hp_max_override: new fields.NumberField({ nullable: false, integer: true, initial: 0, min: 0 }),

            // Mutable stats:
            hp: new FakeBoundedNumberField(),
            vigor: new FakeBoundedNumberField(),
            activations: new FakeBoundedNumberField(),
            combo: new fields.BooleanField({ initial: false }), // Combo token

            // Misc
            clocks: new fields.ArrayField(new ClockField())

            // For legends
        };
    }

    prepareDerivedData() {
        // Initialize our fields
        this.hp.max = this.hp_max_override || (this.class.vitality * 4);
        if (this._source.hp === null) {
            this.hp.value = this.hp.max;
        }
        this.vigor.max = this.class.vitality;
        this.bloodied = this.hp.value <= this.hp.max / 2;
    }
}
