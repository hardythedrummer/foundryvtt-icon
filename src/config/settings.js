import { ICON } from "../consts";

/**
 * Registers all system settings
 */
export function setupSettings() {
    // So we can migrate :)
    game.settings.register(game.system.id, ICON.settings.migration, {
        name: "System Migration Version",
        scope: "world",
        config: false,
        type: String,
        default: "0",
    });

    // Public hp?
    game.settings.register(game.system.id, ICON.settings.show_foe_hp, {
        name: "Show Foe HP",
        hint: "By default, should foe hp bars be visible?",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
    });
}