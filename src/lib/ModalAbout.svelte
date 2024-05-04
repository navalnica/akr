<script>
    import { tr } from "./i18n";

    const isOpenClass = "modal-is-open";
    const openingClass = "modal-is-opening";
    const closingClass = "modal-is-closing";
    const scrollbarWidthCssVar = "--pico-scrollbar-width";
    const animationDuration = 400; // ms
    let visibleModal = null;

    function toggleModal() {
        const modal = document.getElementById("modal-about");
        // if (modal instanceof HTMLDialogElement) {
        // 	modal.showModal();
        // }
        modal.open ? closeModal(modal) : openModal(modal);
        modal.showModal();

        const article = document.getElementById("modal-about-article");
        article.scrollTop = 0;
    }

    function openModal(modal) {
        const { documentElement: html } = document;
        html.classList.add(isOpenClass, openingClass);
        setTimeout(() => {
            visibleModal = modal;
            html.classList.remove(openingClass);
        }, animationDuration);
        modal.showModal();
    }

    function closeModal(modal) {
        visibleModal = null;
        const { documentElement: html } = document;
        html.classList.add(closingClass);
        setTimeout(() => {
            html.classList.remove(closingClass, isOpenClass);
            html.style.removeProperty(scrollbarWidthCssVar);
            modal.close();
        }, animationDuration);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && visibleModal) {
            event.preventDefault();
            closeModal(visibleModal);
        }
    });
</script>

<button
    id="button-open-modal"
    class="outline contrast"
    data-target="modal-about"
    on:click={toggleModal}
>
    {$tr("about.button")}
</button>

<dialog id="modal-about">
    <article id="modal-about-article">
        <header>
            <button
                on:click={toggleModal}
                class="contrast outline"
                style="
                position: absolute;
                right: 1rem;
                top: 0.5rem;
                max-width: 2rem;
                font-size: 1.5rem;
                padding: 0;
                margin: 0;
                border-width: 0.08rem;
                "
            >
                &times;
            </button>
            <h4>{$tr("about.title")}</h4>
        </header>
        <div id="modal-about-description">
            <h5>{$tr("about.description.header1")}</h5>
            <p>{$tr("about.description.paragraph1")}</p>

            <h5>{$tr("about.description.header2")}</h5>
            <ul>
                {#each Array.from({ length: 4 }, (x, i) => i + 1) as index}
                    <li>{$tr(`about.description.paragraph2.li${index}`)}</li>
                {/each}
            </ul>

            <h5>{$tr("about.description.header3")}</h5>
            <p>{$tr("about.description.paragraph3")}</p>

            <h5>{$tr("about.description.header4")}</h5>
            <p>{@html $tr("about.description.paragraph4")}</p>
        </div>
        <button data-target="modal-example" on:click={toggleModal}>
            {$tr("button.close")}
        </button>
    </article>
</dialog>

<style>
    #button-open-modal {
        /* mute the color a little bit */
        color: rgba(var(--contrast), 0.7);
    }

    #modal-about-article {
        padding-bottom: 1rem;
        padding-top: 0;
        max-width: 28em;
        max-height: 35rem;
        position: relative;
    }

    #modal-about header {
        margin-bottom: 0;
        padding-top: 0.7em;
        padding-bottom: 0.7em;
        position: sticky;
        top: 0px;
    }

    #modal-about header>button:hover {
        background-color: var(--contrast);
        color: var(--contrast-inverse);
    }

    #modal-about-description {
        margin-top: 2.5rem;
        margin-bottom: 1rem;
        overflow: scroll;
    }

    #modal-about h4 {
        margin: 0;
    }

    #modal-about h5 {
        margin-bottom: 0.5rem;
        margin-top: 1rem;
        text-align: left;
    }

    #modal-about p,
    li {
        text-align: left;
        font-size: 0.95rem;
        margin-bottom: 0.4rem;
    }

    #modal-about button {
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
</style>
