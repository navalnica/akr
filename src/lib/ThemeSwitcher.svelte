<!--
    modified code from: 
    https://stackoverflow.com/questions/56300132/how-to-override-css-prefers-color-scheme-setting
-->

<script>
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
    Theme: 
    <select id="selectTheme" bind:value={themeSelected} on:change={switchTheme}>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
    </select>
</label>

<style>
    #labelThemeSelect > *, #labelThemeSelect {
        font-size: 0.9rem;
    }

    #selectTheme {
        max-width: 100px;
        padding: 5px;
        text-align: left;
    }
</style>