<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";

    let actor = getContext("tjs_actor");
    let item = getContext("tjs_item");
    let doc = item; // Alias
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />

        <div style="grid-area: name">
            <label for="name"><h3>Group Name:</h3></label>
            <input name="name" type="text" use:updateDoc={{ doc, path: "name" }} />
        </div>

        <div>
            <section style="grid-area: pCost">
                <label for="purchaseCost">Purchase Cost:</label>
                <input name="purchaseCost" type="number" use:updateDoc={{ doc, path: "purchaseCost" }} /> dust.
            </section>
            <section style="grid-area: uCost">
                <label for="purchaseCost">Upgrade Cost:</label>
                <input name="upgradeCost" type="number" use:updateDoc={{ doc, path: "upgradeCost" }} /> dust.
            </section>
        </div>
    </header>
</main>

<style lang="scss">
    main {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
    }

    header {
        display: grid;
        padding: 10px;
        grid: "pic name name"
              "pic pCost uCost" 1fr/1fr 2fr 2fr;
    }
</style>