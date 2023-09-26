<script>
    import { localeStore, localesList, tr } from "./i18n";

    function detectLocale(){
        //determine if locale was already set

        var defaultLocale = "en";
        var localStorageLocale =localStorage.getItem("locale");
        var browserLocale = navigator.language;

        if(localStorageLocale){
            console.log(`found locale in localStorage: "${localStorageLocale}". setting it as current locale.`)
            return localStorageLocale;
        } else if(browserLocale) {
            var shortLocale = browserLocale.substring(0, 2).toLowerCase();
            if (shortLocale == "be" || shortLocale == "ru" || shortLocale == "ua"){
                console.log(`detected "${browserLocale}" as browser language. setting locale to "be"`);
                return "be";
            }
        } else {
            console.log(`could not determine locale. using default: "${defaultLocale}"`);
            return defaultLocale;
        }
    }

    function onLocaleChange() {
        localStorage.setItem("locale", $localeStore);
    }

    $localeStore = detectLocale();
</script>

<label id="labelLanguageSelect">
    {$tr("language")}&nbsp&nbsp<i class="fa-solid fa-globe"></i>
    <select id="selectLanguage" bind:value={$localeStore} on:change={onLocaleChange}>
        {#each localesList as loc}
            <option value={loc}>{loc}</option>
        {/each}
    </select>
</label>

<style>
    #labelLanguageSelect > *, #labelLanguageSelect {
        font-size: 0.9rem;
    }

    #selectLanguage {
        max-width: 120px;
        padding: 5px;
        text-align: left;
    }

    #labelLanguageSelect {
        text-align: left;
    }
</style>