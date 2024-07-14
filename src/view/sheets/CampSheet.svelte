<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    import DocClock from "../components/generic/DocClock.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item");
    let doc = item; // Alias
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="padding: 0 0 0 10px" />

        <div style="flex: 1; margin: 0 0 0 10px;">
            <label for="name"><h3>Group Name:</h3></label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>
    </header>

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="ambitions">
            <h2>Ambitions</h2>
            {#each Object.entries($item.system.ambitions) as [key, _clock]}
                <DocClock clock_width="60px" path={`system.ambitions.${key}`} />
            {/each}
        </div>
        <div class="fixtures">
            <h2>Fixtures</h2>
        </div>
    </section>
</main>

<style lang="scss">
    main {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    header {
        display: flex;
        padding: 10px;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 1 auto;
        max-height: calc(100% - 140px);
    }
</style>
