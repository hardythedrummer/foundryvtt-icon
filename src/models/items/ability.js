import { removeAllUUIDRefs } from "../../util/misc";
import { CastingStringField, ControlledLengthArrayField, titleCaseString } from "../base";
import { ItemModel } from "./item";

const fields = foundry.data.fields;

/** For combo and other similar multiple-choice abilities */
export class AbilityChoiceField extends fields.SchemaField {
    constructor(options = {}) {
        super({
            // What is this sub-ability called? Leave null for default choice, typically
            name: new fields.StringField({ nullable: true, initial: null }),
            // Its description
            description: new fields.HTMLField(),
            // How many actions does it take? Null if not an action (e.x. a trait description)
            actions: new fields.NumberField({ nullable: true, integer: true, min: 0, max: 2, initial: 1 }),
            // Is it a round action?
            round_action: new fields.BooleanField({ initial: false }),
            // What is/are its listed range(s)?
            ranges: new fields.ArrayField(new CastingStringField({cast: titleCaseString})),
                // validate: (val) => {
                    // return !!val.match(/(Range \d+|Line \d+|Arc \d+|Small Blast|Medium Blast|Large Blast)/i)
                // }
            // UUIDs of any summons it might have
            summons: new fields.ArrayField(new fields.StringField()),


            // ------- TAGS ---------------
            tags: new fields.ArrayField(new CastingStringField({cast: titleCaseString})),

            // As an interrupt, what's its trigger?
            trigger: new fields.StringField(),

            // ------- COSTS ---------------
            // Costs / generates a combo token
            combo: new fields.NumberField({ initial: 0, choices: [-1, 0, 1] }),
            // Costs X resolve
            resolve: new fields.NumberField({ nullable: false, integer: true, min: 0, initial: 0 }),

            // ------- What's it actually do? Hit, miss, charge, etc --------
            effects: new fields.ArrayField(new fields.StringField())
        }, options);
    }

    initialize(value, model, options = {}) {
        let rv = super.initialize(value, model, options);

        // Super in the name/ability
        rv.ability ||= model.parent;
        rv.name ||= model.parent.name;

        // Add in any derived data
        rv.actionPips = this.actionPips(rv);
        rv.derived = {};
        this.populateTags(rv);

        return rv;
    }

    /**
     * Yields a string that represents the action cost of this ability
     * // TODO: End turn, limit break
     * @param {object} data The raw choice data
     * @returns {string} A simple unicode string
     */
    actionPips(data) {
        // Traits have nothing
        if(data.actions === null) return "";

        // Interrupts look special
        if (data.interrupt) {
            return "⧰".repeat(data.interrupt);
        } else if (data.actions == 0) {
            return "⟡"; // It's free
        }
        let first_action_pip;
        if (data.combo == -1) {
            // Costs a combo
            first_action_pip = "⬗";
        } else if (data.combo == 1) {
            // Generates a combo
            first_action_pip = "⬖";
        } else {
            first_action_pip = "◆";
        }
        return first_action_pip + (data.actions == 2 ? "◆" : "");
    }

    populateTags(data) {
        // Is it an attack?
        data.attack = false;
        // Does it have true strike?
        data.true_strike = false;
        // Does it have unerring? (Ignore cover and stealth)
        data.unerring = false;
        // Is it an interrupt, and if so how often can it be used?
        data.interrupt = 0;
        // Does it end your turn
        data.end_turn = false;
        // Does it apply a mark
        data.mark = false;
        // Does it grant a stance
        data.stance = false;
        // Does it apply a terrain effect
        data.terrain_effect = false;
        // Does it have a delay effect
        data.delay = false;
        for(let tag of data.tags) {
            let m;
            if(m = tag.match(/attack/i)) data.is_attack = true;
            if(m = tag.match(/true strike/i)) data.is_true_strike = true;
            if(m = tag.match(/unerring/i)) data.is_unerring = true;
            if(m = tag.match(/interrupt (\d)/i)) data.is_interrupt = parseInt(m[1]);
            if(m = tag.match(/end turn/i)) data.is_end_turn = true;
            if(m = tag.match(/mark/i)) data.is_mark = true;
            if(m = tag.match(/stance/i)) data.is_stance = true;
            if(m = tag.match(/terrain effect/i)) data.is_terrain_effect = true;
            if(m = tag.match(/delay/i)) data.is_delay = true;
        }
    }
}

/** For talents and masteries. WIP */
export class AbilityAugmentationField extends fields.SchemaField {
    constructor(options = {}) {
        super({
            text: new fields.HTMLField()
        }, options);
    }
}

export class AbilityModel extends ItemModel {
    static defineSchema() {
        return {
            ...super.defineSchema(),
            // Choices inherent to an abilities
            choices: new ControlledLengthArrayField(new AbilityChoiceField(), { length: 1, overflow: true }),

            // Minimum chapter it is allowed in
            chapter: new fields.NumberField({ nullable: false, initial: 1, integer: true, min: 1, max: 3}),

            // Special rules for it
            special_requirements: new fields.ArrayField(new fields.StringField()),

            // Is it actually a trait? 
            // This really doesn't end up meaning much considering some traits are abilities, etc
            trait: new fields.BooleanField({initial: false}),

            // Upgrades for player abilities
            talents: new fields.ArrayField(new AbilityAugmentationField()),
            mastery: new AbilityAugmentationField({ nullable: true })
        };
    }


    static convertSWB(data) {
        data.type = "ability";
        /** @type {string} */
        let name = data.name;

        // Establish some values. SWB values code abilities one at a time
        let description = removeAllUUIDRefs(data.system.description);
        let effects = description.replaceAll("<p>", "").split("</p>");
        effects = effects.map(p => p.replaceAll(/<\/? ?(strong|em)>/g, ""));
        let dc = {
            ranges: [],
            tags: [],
            description: description,
            effects: effects
        }; // Short for default choice
        data.system.choices = [dc];

        // Extract the subcomponents from the name
        let parenthetical_regex = /\((.*?)\)/;
        let parts = name.match(parenthetical_regex)?.[1]?.split(",") ?? [];
        name = name.replace(parenthetical_regex, "");
        for (let part of parts) {
            const action_match = part.match(/(\d)\s+actions?/i);
            if (action_match) {
                dc.actions = Number.parseInt(action_match[1]);
                continue;
            }

            const resolve_match = part.match(/(\d)\s+resolve?/i);
            if (resolve_match) {
                dc.resolve = Number.parseInt(resolve_match[1]);
                continue;
            }

            let range_match = part.match(/(Range|Arc|Line) (\d)+/);
            if (range_match) {
                dc.ranges.push(range_match[0]);
                continue;
            }

            const interrupt_match = part.match(/(\d)\s+interrupt?/i);
            if (interrupt_match) {
                dc.interrupt = Number.parseInt(interrupt_match[1]);
                continue;
            }

            let combo_match = part.match(/combo (\d)/i);
            if (combo_match) {
                dc.combo = combo_match[1] == "1" ? 1 : -1;
                continue;
            }

            // Otherwise generic tag
            dc.tags.push(part);
        }

        // Deduce if it's a trait
        data.system.trait = data.flags.icon_data?.isTrait ?? false;

        // Remove empty parens from the name & re-assign
        name = name.replaceAll(/\([ ,]*\)/g, "");
        name = name.trim();
        data.name = name;

        // Extract talents
        data.system.talents = [];
        data.system.mastery = null;
        for (let talent_val of Object.values(data.system.attributes?.Talents ?? {})) {
            // talent_key tends to be something akin to Talent1
            if (talent_val.value?.includes("Mastery")) {
                data.system.mastery = {
                    text: talent_val.value
                };
            } else if (talent_val.value?.trim()) {
                data.system.talents.push({
                    text: talent_val.value
                });
            }
        }
    }
}
