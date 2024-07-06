<script>
    import { getContext } from "svelte";
    import { updateDoc } from "../actions/update";
    import Portrait from "../components/Portrait.svelte";
    // import EditableDocArray from "../components/generic/EditableDocArray.svelte";
    // import ProseMirrorEditor from "../components/generic/ProseMirrorEditor.svelte";

    let item = getContext("tjs_item");
    let doc = item; // Alias
</script>

<main>
    <!-- Sheet Header -->
    <header>
        <Portrait style="grid-area: pic" />

        <div style="grid-area: name">
            <label for="group_name"><h3>Group Name:</h3></label>
            <input name="group_name" type="text" use:updateDoc={{ doc, path: "group_name" }} />
        </div>
    </header>

    <!-- Sheet Tab Navigation -->

    <!-- Sheet Body -->
    <section class="sheet-body">
        <div class="flexcol">
           
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
        display: grid;
        grid-template: "pic options name" 90px / 90px 1fr 1fr;
    }

    .sheet-body {
        padding: 5px;
        flex: 1 0 auto;
        max-height: calc(100% - 140px);
    }
</style>
