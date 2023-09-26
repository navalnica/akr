<!--
    modified code from: 
    https://stackoverflow.com/questions/56300132/how-to-override-css-prefers-color-scheme-setting
-->

<script>
    import { tr } from "./i18n";

    function detectColorScheme(){
        //determine if the theme was already set either by system (browser theme) or by user

        var theme="light";    //default to light

        if(localStorage.getItem("theme")){
            //local storage is used to override OS theme settings
            if(localStorage.getItem("theme") == "dark"){
                var theme = "dark";
            }
        } else if(!window.matchMedia) {
            //matchMedia method not supported
            return theme;
        } else if(window.matchMedia("(prefers-color-scheme: dark)").matches) {
            //OS theme setting detected as dark
            var theme = "dark";
        }

        return theme;
    }

    let themeSelected = detectColorScheme();
    document.documentElement.setAttribute("data-theme", themeSelected);
    
    function switchTheme() {
        localStorage.setItem("theme", themeSelected);
        document.documentElement.setAttribute("data-theme", themeSelected);
    }
</script>

<label id="labelThemeSelect" for="selectTheme">
    &nbsp&nbsp{$tr("theme")}&nbsp&nbsp<i class="fa-solid fa-circle-half-stroke"></i>
    <select id="selectTheme" bind:value={themeSelected} on:change={switchTheme}>
        <option value="dark">{$tr("theme.dark")}</option>
        <option value="light">{$tr("theme.light")}</option>
    </select>
</label>

<style>
    #labelThemeSelect {
        text-align: left;
    }
</style>