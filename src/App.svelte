<script>
    import { tick } from "svelte";
	import ThemeSwitcher from "./lib/ThemeSwitcher.svelte";


	// ***** state ***** //

	let digits = "0123456789";
	let allowedLetters = "ABCDEFGHIJKLMNPQRSTUVWXYZ";  // don't include "O" since it may be confused with 0
	
	// if you change this value,
	// you MUST change "max" value of "inputLettersMin" and "inputLettersMax" sliders.
	// look how letters variables are used for details.
	let sequenceLength = 8;

	// Letters variables.
	//
	// we want to preserver letters/sequenceLength ratio.
	// by separating letters variables into display and calculation variables,
	// we eliminate slider jitter when sequence length gets updated.
	//
	// variables used to display
	let lettersMinDisplay = 0;
	let lettersMaxDisplay = 0;
	// variables used in calculations
	let lettersMin = 0;
	let lettersMax = 0;
	let lettersMinFrac = 0;
	let lettersMaxFrac = 0;
	
	let toSeparateSeq = true;
	let separateStep = 4;
	let sequenceSeparator = " ";
	let separators = [
		{id: " ", text: "Space"},
		{id: "'", text: "Apostrophe"},
	]
	// match any separator or space character
	let regexpNormalizeGuess = new RegExp(separators.map(x => x.id).join("|") + "|\\s", "g")

	let blockUpdatingSequence = false;
	let targetSeq;
	generateSequence();
	$: targetSeqSeparated = separateSequence(targetSeq);

	let formats = [
		{id: "custom", text: "Custom"},
		{id: "iban", text: "IBAN"},
		{id: "swift", text: "Swift"},
	]
	let selectedFormat = "custom";

	let selectedMode = "rewrite";
	let taskDescription;
	$: taskDescription = selectedMode === "rewrite" ? "Rewrite" : "Memorize";
	let visibleTask = true;
	let visibleGuess = true;

	let guess = "";
	let statusText = "default";  // default value not to leave <p> tag blank and to occupy space in layout
	let guessInputsDisabled = false;
	let nCorrect = 0;
	let nMistakes = 0;

	switchModes();

	// ***** functions ***** //

	function randIntUniform(low, high){
		// low is inclusive, high is exclusive
		return Math.floor(Math.random() * (high - low) + low);
	}

	function randomChoice(array) {
		var ix = Math.floor(Math.random() * array.length);
		return array[ix];
	}

	function randomChoiceMultiple(array, nChoices) {
		// random choice with repetitions
		let choices = [];
		for (let i = 0; i < nChoices; ++i){
			choices.push(randomChoice(array));
		}
		return choices;
	}

	function shuffleArrayInplace(arr) {
		// Fisher-Yates inplace shuffle. O(n) complexity.
		// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
		for (let i = arr.length - 1; i > 0; --i){
			const j = Math.floor(Math.random() * (i + 1));
			const tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
	}

	function generateSequence() {
		if (!blockUpdatingSequence) {
			let nDigits = 0;
			let nLetters = 0;

			if (lettersMax === 0){
				nDigits = sequenceLength;
				nLetters = 0;
			} else if (lettersMin === sequenceLength){
				nDigits = 0;
				nLetters = sequenceLength;
			} else {
				nLetters = randIntUniform(lettersMin, lettersMax + 1);
				nDigits = sequenceLength - nLetters;
			}

			let digitsArr = randomChoiceMultiple(digits, nDigits);
			let lettersArr = randomChoiceMultiple(allowedLetters, nLetters);
			let seq = digitsArr.concat(lettersArr);
			shuffleArrayInplace(seq);

			targetSeq = seq.join("");
		}
	}

	function separateSequence(sequence) {
		if (!toSeparateSeq) {
			return sequence;
		}

		let arr = [];
		let i = sequence.length - separateStep;
		while (i >= 0){
			arr.push(sequence.slice(i, i + separateStep));
			i -= separateStep
		}
		if (i < 0 && i > - separateStep){
			arr.push(sequence.slice(0, sequence.length % separateStep))
		}

		return arr.reverse().join(sequenceSeparator); 
	}

	function separateTargetSequence() {
		if (!blockUpdatingSequence) {
			targetSeqSeparated = separateSequence(targetSeq);
		}
	}
	
	function readyToGuess() {
		blockUpdatingSequence = true;  // prevent modifying target sequence with controls while in guess mode

		visibleTask = false;
		visibleGuess = true;
	}

	function checkGuess() {
		let guessNorm = guess.replace(regexpNormalizeGuess, "");  // remove space characters
		guessNorm = guessNorm.toUpperCase();

		console.log("Check guess ", guessNorm, " to be equal to target ", targetSeq)
		
		if (guessNorm === targetSeq){
			statusText = "Correct";
			nCorrect += 1;
			document.getElementById("inputGuess").setAttribute("aria-invalid", "false");
			guessInputsDisabled = true;
		}
		else{
			statusText = "Mistake";
			nMistakes += 1;
			document.getElementById("inputGuess").setAttribute("aria-invalid", "true");
		}
		toggleStatusVisibility(true);
	}

	function toggleStatusVisibility(toShow) {
		let paragraphStatus = document.getElementById("paragraphStatus");
		paragraphStatus.style.visibility = toShow ? "visible" : "hidden";
	}
	
	function restart() {
		guess = "";
		guessInputsDisabled = false;
		
		blockUpdatingSequence = false;  // allow modifying targetSequence
		generateSequence();

		if (selectedMode === "memorize"){
			visibleGuess = false;
			visibleTask = true;
		}
	}

	function showAnswer() {
		guessInputsDisabled = true;
		statusText = targetSeqSeparated;
		toggleStatusVisibility(true);
	}

	function changeFormat() {

	}

	async function switchModes() {
		if (selectedMode === "rewrite") {
			activateRewriteMode();
		}
		else if (selectedMode === "memorize") {
			activateMemorizeMode();
		}

		guessInputsDisabled = false;
		guess = "";

		blockUpdatingSequence = false;
		generateSequence();
	}

	async function activateRewriteMode() {
		visibleTask = true;
		visibleGuess = true;
		await tick();

		let mainCard = document.getElementById("mainCard");
		mainCard.style.height = "350px";
		mainCard.style.justifyContent = "space-between";

		// hide nodes
		document.getElementById("buttonReady").style.display = "none";
		document.getElementById("labelGuess").style.display = "none";
		document.getElementById("buttonShowAnswer").style.display = "none";

		toggleStatusVisibility(false);
		document.getElementById("inputGuess").removeAttribute("aria-invalid");
	}

	async function activateMemorizeMode() {
		visibleTask = true;
		visibleGuess = false;
		await tick()
		
		let mainCard = document.getElementById("mainCard");
		mainCard.style.height = "250px";
		mainCard.style.justifyContent = "center";
		
		document.getElementById("buttonReady").style.display = "";
	}

	function inputGuessOnInput() {
		toggleStatusVisibility(false);
		document.getElementById("inputGuess").removeAttribute("aria-invalid");
		document.getElementById("inputGuess").removeAttribute("aria-invalid");
	}

	function seqLenOnInput() {
		// calculate letters variables from updated sequence length and previous letters/seqLen ratio.

		lettersMin = Math.round(lettersMinFrac * sequenceLength);
		if (lettersMinFrac > 0 && lettersMin === 0){
			lettersMin = 1;
		}
		if (lettersMinFrac < 1 && lettersMin === sequenceLength){
			lettersMin--;
		}

		lettersMax = Math.round(lettersMaxFrac * sequenceLength);
		if (lettersMaxFrac > 0 && lettersMax === 0){
			lettersMax = 1;
		}
		if (lettersMaxFrac < 1 && lettersMax === sequenceLength){
			lettersMax--;
		}
		
		generateSequence();
	}

	function seqLenOnChange() {
		// update min, max sliders for letters count.
		// actual letter values used in calculcations were updated previously (on input),
		// we update sliders in the very end (when mouse is released) to avoid sliders jitter.
		lettersMinDisplay = lettersMin;
		lettersMaxDisplay = lettersMax;
		document.getElementById("inputLettersMin").max = sequenceLength;
		document.getElementById("inputLettersMax").max = sequenceLength;
	}

	function lettersMinOnInput() {
		lettersMaxDisplay = Math.max(lettersMinDisplay, lettersMaxDisplay);
		lettersMinDisplay = Math.min(lettersMinDisplay, lettersMaxDisplay);

		// sliders are bound to display variables. copy their value to variables used in calculations.
		lettersMin = lettersMinDisplay;
		lettersMax = lettersMaxDisplay;

		// now we can generate a new sequence
		generateSequence();

		// recalculate ratio
		lettersMinFrac = lettersMin / sequenceLength;
		lettersMaxFrac = lettersMax / sequenceLength;
	}

	function lettersMaxOnInput() {
		lettersMinDisplay = Math.min(lettersMinDisplay, lettersMaxDisplay);
		lettersMaxDisplay = Math.max(lettersMinDisplay, lettersMaxDisplay);

		// sliders are bound to display variables. copy their value to variables used in calculations.
		lettersMin = lettersMinDisplay;
		lettersMax = lettersMaxDisplay;
		
		// now we can generate a new sequence
		generateSequence();

		// recalculate ratio
		lettersMinFrac = lettersMin / sequenceLength;
		lettersMaxFrac = lettersMax / sequenceLength;
	}
</script>

<hgroup id="header">
	<h2>OCD fighter</h2>
	<h3>Fight Obsessive–compulsive disorder by solving simple tasks</h3>
</hgroup>

<div id="appForm">
	
	<p id="paragraphScore">Correct: {nCorrect}. Mistakes: {nMistakes}</p>

	<details id="controls">
		<!-- TODO: width of details container varies depending on the open status -->
		<summary id="controlsSummary">Settings</summary>

		<div class="divFlexHorizontal">
			<label class="flex-1">Format
				<select bind:value={selectedFormat} on:change={changeFormat}>
					{#each formats as format}
						<option value={format.id}>{format.text}</option>
					{/each}
				</select>
			</label>

			<label class="flex-1">Mode
				<select bind:value={selectedMode} on:change={switchModes}>
					<option value="rewrite">Rewrite</option>
					<option value="memorize">Memorize</option>
				</select>
			</label>
		</div>

		<label>Sequence length: {sequenceLength}
			<input type="range" min=4 max=20 bind:value={sequenceLength} on:input={seqLenOnInput} on:change={seqLenOnChange}>
		</label>

		<div class="divFlexHorizontal">
			<label class="max-width-250px">Min letters: {lettersMin}
				<input id="inputLettersMin" type="range" min=0 max=8 step=1 bind:value={lettersMinDisplay} on:input={lettersMinOnInput}>
			</label>

			<label class="max-width-250px">Max letters: {lettersMax}
				<input id="inputLettersMax" type="range" min=0 max=8 step=1 bind:value={lettersMaxDisplay} on:input={lettersMaxOnInput}>
			</label>
		</div>
		
		<label>
			<input type="checkbox" role="switch" bind:checked={toSeparateSeq} on:change={separateTargetSequence}>
			Separate sequence
		</label>

		<div class="divFlexHorizontal">
			<label id="inputSeparator">Separator
				<select disabled={!toSeparateSeq} bind:value={sequenceSeparator} on:change={separateTargetSequence}>
					{#each separators as sep}
						<option value={sep.id}>{sep.text}</option>
					{/each}
				</select>
			</label>
			
			<label id="inputSeparatorStep">Step: {separateStep}
				<input type="range" min=2 max=5 disabled={!toSeparateSeq} bind:value={separateStep} on:input={separateTargetSequence}>
			</label>
		</div>

	</details>		

	<article id="mainCard">
		{#if visibleTask}
			<div id="task">
				<p>{taskDescription}<br><strong>{targetSeqSeparated}</strong></p>
				<button id="buttonReady" on:click={readyToGuess}>Ready</button>
			</div>
		{/if}

		{#if visibleGuess}
			<div id="guess">
				<label id="labelGuess" for="inputGuess">Your guess</label>
				<input id="inputGuess" type="text" readonly={guessInputsDisabled} bind:value={guess} on:input={inputGuessOnInput}/>
				
				<div id="guessButtonRow">
					<button id="buttonRestart" class="contrast outline" on:click={restart}>Restart</button>	
					<button id="buttonShowAnswer" class="contrast outline" on:click={showAnswer} disabled={guessInputsDisabled}>Show Answer</button>	
					<button id="buttonCheck" on:click={checkGuess} disabled={guessInputsDisabled}>Check</button>
				</div>
				
				<p id="paragraphStatus">{statusText}</p>
			</div>
		{/if}
	</article>
</div>

<div id="footer">
	<ThemeSwitcher />

	<!-- TODO: not visible on default startup screen -->
	<a href="https://github.com/navalnica/akr" target="_blank" rel="noreferrer">
		<i class="fa-brands fa-github" style="font-size:18px"></i> GitHub
	</a>
</div>

<style>
	#appForm {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	#paragraphScore {
		text-align: left;
	}

	#controls {
		margin-bottom: 1rem;
		border: none;
	}

	/* `#controls *` allows to ovveride default pico-css selector for select. Thus we can modify font-size. */
	#controls * {
		font-size: 0.8rem;
	}

	/* We can't use `#controlsSummary` as selector, 
	because it has lower priority than `#controls > summary` (?) 
	and gets overridden by other selector. Font size gets wrong.
	*/
	#controls > summary {
		font-size: 1rem;
	}

	/* Now we can use simple id as `#controlsSummary` a selector */
	#controlsSummary {
		width: clamp(90px, 20%, 20%);
	}

	.flex-1 {
		flex: 1;
	}

	.max-width-250px {
		max-width: 250px;
	}

	.divFlexHorizontal {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		align-items: start;
	}

	.divFlexHorizontal > * {
		flex: 1;
	}
	
	#inputSeparatorStep > input {
		margin-top: 0.75rem;
	}

	#mainCard {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: stretch;
		height: 350px;
		margin-top: 0;
	}

	#task {
		display: flex;
		flex-direction: column;
	}

	#buttonReady {
		width: 30%;
		align-self: center;
	}

	#guessButtonRow {
		display: flex;
		gap: 0.5rem;
	}

	#guessButtonRow > button {
		flex: 1;
	}
	#paragraphStatus {
		visibility: hidden;
	}

	label {
		text-align: left;
	}

	input[type="range"] {
		margin-bottom: calc(var(--spacing) * .25);
	}

	select {
		padding-top: calc(var(--spacing) * .25);
		padding-bottom: calc(var(--spacing) * .25);
	}

	details[open] summary ~ * {
		animation: sweep .7s ease-in-out;
	}

	@keyframes sweep {
		0%    {opacity: 0; }
		100%  {opacity: 1; }
	}

	button {
		border-radius: 7px;
		font-weight: 370;
		font-size: 0.8rem;
	}
</style>