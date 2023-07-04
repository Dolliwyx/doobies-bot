import type { ArrayString } from "@skyra/env-utilities";
import type { Settings } from "../lib/structures/Settings";

declare module '@skyra/env-utilities' {
	interface Env {
		OWNERS: ArrayString;
	}
}

declare module '@sapphire/pieces' {
    interface Container {
        settings: Settings;
    }
}