<script>
    import { tr } from "./lib/i18n";
	import { tick } from "svelte";
	import ThemeSwitcher from "./lib/ThemeSwitcher.svelte";
	import ModalAbout from "./lib/ModalAbout.svelte";
	import LanguageSwitcher from "./lib/LanguageSwitcher.svelte";
	import { swiftCodes } from "./lib/SwiftCodes"
	import {ISOCountryCodes} from "./lib/ISOCountryCodes"


	// ***** state ***** //

	let digits = "0123456789";
	// capital latin letters.
	// don't include "O" since it may be confused with 0
	let allowedLetters = "ABCDEFGHIJKLMNPQRSTUVWXYZ";
	
	// if you change this value,
	// you MUST change "max" value of "inputLettersMin" and "inputLettersMax" sliders.
	// look how letters variables are used for details.
	let sequenceLength = 16;

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
	let separators = {space: " ", apostrophe: "'"};
	let selectedSeparator = "space";
	// match any separator or space character
	const regexpNormalizeGuess = new RegExp(Object.values(separators).join("|") + "|\\s", "g");
	const regexpCapitalLetter = /^[A-Z]$/;
	const regexpLetter = /[A-Za-z]/;

	const Modes = Object.freeze({
		COPY: 'copy',
		MEMORIZE: 'memorize',
	});
	let modesList = [Modes.COPY, Modes.MEMORIZE];
	let selectedMode = Modes.COPY;

	const Formats = Object.freeze({
		CUSTOM: 'custom',
		IBAN: 'iban',
		SWIFT: 'swift',
	});
	let formatsList = [Formats.CUSTOM, Formats.IBAN, Formats.SWIFT];
	let selectedFormat = Formats.CUSTOM;

	$: customSequenceControlsBlocked = (selectedFormat !== Formats.CUSTOM);
	$: separateSequenceControlsBlocked = (selectedFormat === Formats.SWIFT);

	let blockUpdatingSequence = false;
	let targetSeq;
	generateSequence();
	$: targetSeqSeparated = separateSequence(targetSeq, selectedFormat !== Formats.IBAN);
	$: sequenceInputType = regexpLetter.test(targetSeq) ? "text" : "numeric";

	let visibleTask = true;
	let visibleGuess = true;

	const StatusHelper = Object.freeze({
		// use some special characters to avoid confusion with generated sequence value
		correct: '!@#correct',
		mistake: '!@#mistake',
	});
	// set default value not to leave <p> tag blank and to occupy space in layout
	let statusHelperValue = "default";
	// if value is not correct or mistake, show it as is.
	// use dynamic svelte property to always use text from the current locale.
	$: statusText = statusHelperValue === StatusHelper.correct 
		? $tr("status.correct") 
		: (statusHelperValue === StatusHelper.mistake 
			? $tr("status.mistake") 
			: statusHelperValue);

	let guess = "";
	let guessInputsDisabled = false;
	// use dynamic svelte property to always use text from the current locale
	$: buttonRestartContent = guessInputsDisabled ? $tr("button.next") : $tr("button.restart");
	let nCorrect = 0;
	let nMistakes = 0;
	$: statsPercent = (nCorrect + nMistakes) === 0 ? 0 : Math.round(nCorrect / (nCorrect + nMistakes) * 100);

	// task on the first screen
	$: taskDescription = $tr(`task.${selectedMode}`) + " " + $tr(`task.format.${selectedFormat}`);
	// task on the second screen. currently, it's always write by memory task.
	$: taskDescriptionScreen2 = 
		$tr("task.write_from_memory_1") + 
		" " + 
		$tr(`task.format.${selectedFormat}`) +
		" " + 
		$tr("task.write_from_memory_2");

	console.log(`loaded ${swiftCodes.length} swift codes. sample codes: ${randomChoiceMultiple(swiftCodes, 5)}`);
	console.log(`loaded ${ISOCountryCodes.length} ISO country codes. sample codes: ${randomChoiceMultiple(ISOCountryCodes, 5)}`);

	activateLayoutFromSelectedMode();

	// ***** functions ***** //

	function randomFloatCrypto() {
		// get cryptographically strong random float in range [0; 1), 1 is exclusive.
		// a better alternative to Math.random().

		const randomBuffer = new Uint32Array(1);
		window.crypto.getRandomValues(randomBuffer);

		// (2 ** 32 - 1) or 0xffffffff (which is the same) is the max value for uint32 variable.
		// dividing by 2 ** 32 gets random float in [0; 1) range (right border is exclusive).
		const randomFloat = randomBuffer[0] / 2 ** 32;
		return randomFloat;
	}

	function randIntUniform(low, high){
		// random integer in the range [low; high) - low is inclusive, high is exclusive
		return Math.floor(randomFloatCrypto() * (high - low) + low);
	}

	function randomChoice(array) {
		var ix = randIntUniform(0, array.length);
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
			const j = randIntUniform(0, i + 1);
			const tmp = arr[i];
			arr[i] = arr[j];
			arr[j] = tmp;
		}
	}

	function IBANExpandLetters(str) {
		// Replace the letters in the string with digits, expanding the string as necessary, 
		// such that A = 10, B = 11, and Z = 35. 
		// Each alphabetic character is therefore replaced by 2 digits
		
		str = str.toUpperCase();
		let res = [];

		for (let i = 0; i < str.length; ++i){
			if (regexpCapitalLetter.test(str[i])){
				let letterCode = 10 + str[i].charCodeAt(0) - "A".charCodeAt(0);
				res.push(letterCode.toString());
			}
			else {
				res.push(str[i]);
			}
		}
		res = res.join("");

		return res;
	}

	function longMathModulo97(numStr) {
		// piece-wise modulo 97 operation that handles arbitrary large integer (written as string) as input.
		// refer to https://en.wikipedia.org/wiki/International_Bank_Account_Number#Modulo_operation_on_IBAN
		// possibly need to modify the function to be able to generalize to divisors other than 97.

		const divisor = 97;

		let i = 9;
		let num = parseInt(numStr.slice(0, i), 10);
		let remainder = num % divisor;

		while (i < numStr.length) {
			if (remainder < 10) {
				num = remainder.toString() + numStr.slice(i, i + 8);
				i += 8;
			}
			else {
				num = remainder.toString() + numStr.slice(i, i + 7);
				i += 7;
			}
			remainder = num % divisor;
		}

		return remainder;
	}

	function generateIBAN() {
		// generate pseudo IBAN:
		// a sequence that looks like IBAN, has valid ISO country code,
		// but does not follow contry specific rules for Basic Bank Account Number (BBAN).
		// refer to: https://en.wikipedia.org/wiki/International_Bank_Account_Number#Structure

		let seqLen = randIntUniform(26, 31);
		let nLetters = randIntUniform(0, 5);
		let nDigits = seqLen - nLetters;
		
		let seq = randomChoiceMultiple(digits, nDigits);
		seq = seq.join("");
	
		if (nLetters > 0){
			// insert letters as a continuous chunk at a random position
			let letters = randomChoiceMultiple(allowedLetters, nLetters);
			letters = letters.join("");

			let lettersPosition = randIntUniform(0, nDigits);
			seq = seq.slice(0, lettersPosition) + letters + seq.slice(lettersPosition);
		}

		let countryCode = randomChoice(ISOCountryCodes);

		// now we need to generate IBAN check digits. refer to:
		// https://en.wikipedia.org/wiki/International_Bank_Account_Number#Generating_IBAN_check_digits

		let seqExpanded = IBANExpandLetters(seq + countryCode + "00");
		
		let checkDigits = 98 - longMathModulo97(seqExpanded);
		checkDigits = checkDigits.toString();
		if (checkDigits.length < 2) {
			checkDigits = "0" + checkDigits;
		}

		seq = countryCode + checkDigits + seq;

		return seq;
	}

	// random functions. end

	function generateSequence() {
		if (blockUpdatingSequence) {
			return;
		}

		if (selectedFormat === Formats.CUSTOM) {
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
		else if (selectedFormat === Formats.SWIFT){
			targetSeq = randomChoice(swiftCodes);
		}
		else if (selectedFormat === Formats.IBAN) {
			targetSeq = generateIBAN();
		}
	}

	function separateSequence(sequence, rightToLeft) {
		// if rightToLeft is true, than will leave dangling portion that is shorter than separateStep in left,
		// otherwise - in right of the sequence.

		if (!toSeparateSeq) {
			return sequence;
		}

		let res;
		let arr = [];

		if (rightToLeft){
			let i = sequence.length - separateStep;
			while (i >= 0){
				arr.push(sequence.slice(i, i + separateStep));
				i -= separateStep
			}
			if (i < 0 && i > -separateStep){
				arr.push(sequence.slice(0, sequence.length % separateStep))
			}
			res = arr.reverse().join(separators[selectedSeparator]);
		}
		else {
			let i = 0;
			while (i < sequence.length){
				arr.push(sequence.slice(i, i + separateStep));
				i += separateStep;
			}
			res = arr.join(separators[selectedSeparator]);
		}

		return res;
	}

	function separateTargetSequence() {
		if (!blockUpdatingSequence) {
			targetSeqSeparated = separateSequence(targetSeq, selectedFormat !== Formats.IBAN);
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

		console.log("Check guess", guessNorm, "to be equal to target", targetSeq)
		
		if (guessNorm === targetSeq){
			statusHelperValue = StatusHelper.correct;
			nCorrect += 1;
			document.getElementById("inputGuess").setAttribute("aria-invalid", "false");
			guessInputsDisabled = true;
		}
		else{
			statusHelperValue = StatusHelper.mistake;
			nMistakes += 1;
			document.getElementById("inputGuess").setAttribute("aria-invalid", "true");
		}
		toggleStatusVisibility(true);
	}

	function toggleStatusVisibility(toShow) {
		let paragraphStatus = document.getElementById("paragraphStatus");
		paragraphStatus.style.visibility = toShow ? "visible" : "hidden";
	}

	function showAnswer() {
		guessInputsDisabled = true;
		statusHelperValue = targetSeqSeparated;
		toggleStatusVisibility(true);
	}

	function changeFormat() {
		if (selectedFormat === Formats.CUSTOM) {
			toSeparateSeq = true;
		}
		else if (selectedFormat === Formats.IBAN) {
			toSeparateSeq = true;
			separateStep = 4;
		}
		else if (selectedFormat === Formats.SWIFT){
			toSeparateSeq = false;
		}

		buttonRestartOnClick();
	}
	
	function buttonRestartOnClick() {
		restartState();

		if (selectedMode === Modes.MEMORIZE){
			visibleGuess = false;
			visibleTask = true;
		} else {
			toggleStatusVisibility(false);
			document.getElementById("inputGuess").removeAttribute("aria-invalid");
		}
	}

	function selectModeOnChange() {
		activateLayoutFromSelectedMode();
		restartState();
	}

	function restartState() {
		guess = "";
		guessInputsDisabled = false;
		
		blockUpdatingSequence = false;  // allow modifying targetSequence
		generateSequence();
	}

	async function activateLayoutFromSelectedMode() {
		if (selectedMode === Modes.COPY) {
			activateCopyLayout();
		}
		else if (selectedMode === Modes.MEMORIZE) {
			activateMemorizeLayout();
		}

		// this function is first called before the layout is rendered.
		// so we need to check here if element exists.
		const input = document.getElementById("inputGuess")
		if (input) {
			input.removeAttribute("aria-invalid");
		}
	}

	async function activateCopyLayout() {
		visibleTask = true;
		visibleGuess = true;
		await tick();

		let mainCard = document.getElementById("mainCard");
		mainCard.style.justifyContent = "space-between";

		// hide nodes
		document.getElementById("buttonReady").style.display = "none";
		document.getElementById("labelGuess").style.display = "none";
		document.getElementById("buttonShowAnswer").style.display = "none";

		toggleStatusVisibility(false);
	}

	async function activateMemorizeLayout() {
		visibleTask = true;
		visibleGuess = false;
		await tick()
		
		let mainCard = document.getElementById("mainCard");
		mainCard.style.justifyContent = "space-between";
		
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

<div id="header">
	<hgroup>
		<h2>{$tr("title.text")} 🔥</h2>
		<h3>{$tr("title.description")}</h3>
	</hgroup>

	<ModalAbout/>
</div>

<div id="appForm">
	<p id="paragraphScore">✅ {$tr("correct")}: {nCorrect} / {nCorrect + nMistakes} &nbsp&nbsp&nbsp📝 {$tr("percent")}: {statsPercent}%</p>

	<details id="controls">
		<!-- can alternatively use following emojis 🛠 🔧 -->
		<summary id="controlsSummary">⚙️ {$tr("settings")}</summary>

		<div class="divFlexHorizontal">
			<label class="flex-1">{$tr("settings.mode")}
				<select bind:value={selectedMode} on:change={selectModeOnChange}>
					{#each modesList as key}
						<option value={key}>{$tr("settings.mode." + key)}</option>
					{/each}
				</select>
			</label>

			<label class="flex-1">{$tr("settings.format")}
				<select bind:value={selectedFormat} on:change={changeFormat}>
					{#each formatsList as key}
						<option value={key}>{$tr("settings.format." + key)}</option>
					{/each}
				</select>
			</label>
		</div>

		<label>{$tr("settings.seqLen")}: {sequenceLength}
			<input type="range" min=4 max=40 bind:value={sequenceLength} 
			 on:input={seqLenOnInput} on:change={seqLenOnChange} disabled={customSequenceControlsBlocked}
			>
		</label>

		<div class="divFlexHorizontal">
			<label>{$tr("settings.minLetters")}: {lettersMin}
				<input id="inputLettersMin" type="range" min=0 max=8 step=1 bind:value={lettersMinDisplay} 
				 on:input={lettersMinOnInput} disabled={customSequenceControlsBlocked}
				>
			</label>

			<label>{$tr("settings.maxLetters")}: {lettersMax}
				<input id="inputLettersMax" type="range" min=0 max=8 step=1 bind:value={lettersMaxDisplay}
				 on:input={lettersMaxOnInput} disabled={customSequenceControlsBlocked}>
			</label>
		</div>
		
		<label>
			<input type="checkbox" role="switch" bind:checked={toSeparateSeq}
			 on:change={separateTargetSequence} disabled={separateSequenceControlsBlocked}
			>
			{$tr("settings.separateSeq")}
		</label>

		<div class="divFlexHorizontal">
			<label id="inputSeparator">{$tr("settings.separator")}
				<select disabled={!toSeparateSeq || separateSequenceControlsBlocked}
				 bind:value={selectedSeparator} on:change={separateTargetSequence}
				>
					{#each Object.keys(separators) as sep}
						<option value={sep}>{$tr("settings.separator." + sep)}</option>
					{/each}
				</select>
			</label>
			
			<label id="inputSeparatorStep">{$tr("settings.separatorStep")}: {separateStep}
				<input type="range" min=2 max=8 disabled={!toSeparateSeq || separateSequenceControlsBlocked}
				 bind:value={separateStep} on:input={separateTargetSequence}
				>
			</label>
		</div>

	</details>		

	<article id="mainCard">
		{#if visibleTask}
			<p>{taskDescription}</p>
			<p id="taskContent"><strong>{targetSeqSeparated}</strong></p>
			<button id="buttonReady" on:click={readyToGuess}>{$tr("button.ready")}</button>
		{/if}

		{#if visibleGuess}
			<p id="labelGuess">{taskDescriptionScreen2}</p>
			<input id="inputGuess" type="text" inputmode={sequenceInputType} readonly={guessInputsDisabled} bind:value={guess} on:input={inputGuessOnInput}/>
			
			<div id="guessButtonRow">
				<button id="buttonRestart" class="contrast outline" on:click={buttonRestartOnClick}>{buttonRestartContent}</button>	
				<button id="buttonShowAnswer" class="contrast outline" on:click={showAnswer} disabled={guessInputsDisabled}>{$tr("button.showAnswer")}</button>	
				<button id="buttonCheck" on:click={checkGuess} disabled={guessInputsDisabled}>{$tr("button.check")}</button>
			</div>
			
			<p id="paragraphStatus">{statusText}</p>
		{/if}
	</article>
</div>

<div id="footer">
	<div id="footerLanguageThemePickers">
		<div class="footerSelect"><LanguageSwitcher /></div>
		<div class="footerSelect"><ThemeSwitcher /></div>
	</div>

	<a href="https://github.com/navalnica/akr" target="_blank" rel="noreferrer">
		<i class="fa-brands fa-github" style="font-size:18px"></i> GitHub
	</a>

</div>

<style>
	#appForm {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 1rem;
		/*
		use 'flex-grow' to make #appForm grow
		and the rest of parent container (header and footer) remain fixed in height - "sticky".
		NOTE: the page would need to have a height that’s equal to the height of the viewport, 
		or more. We set that in app.css.
		refer to: https://tympanus.net/codrops/css_reference/flexbox/ - "Sticky Footer" section.
		*/
		flex-grow: 1;
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
		font-size: 0.9rem;
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
		/* 'display: flex' is required to limit item's width and align it to the left */
		display: flex;
		font-weight: 500;
	}

	.flex-1 {
		flex: 1;
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
		margin-top: 0;
		padding-top: 16px;
		padding-bottom: 16px;
		padding-left: 12px;
		padding-right: 12px;
	}

	#taskContent {
		font-family: monospace;
	}

	button {
		border-radius: 7px;
		font-weight: 420;
		padding-right: 0.25em;
		padding-left: 0.25em;
		height: 1.9rem;
		padding-top: 0;
		padding-bottom: 0;
	}
	#buttonReady {
		width: 10rem;
		align-self: center;
	}
	#guessButtonRow {
		display: flex;
		gap: 0.4em;
	}
	/* 'width: fit-content' is crucial for correct flex grow and shrink! */
	#buttonRestart, #buttonCheck {
		width: fit-content;
		flex: 1 1 auto;
	}
	#buttonShowAnswer{
		width: fit-content;
		flex: 1	1 auto;
	}

	#paragraphStatus {
		visibility: hidden;
		margin-bottom: 10px;
	}

	#footerLanguageThemePickers {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 0.5rem;
		font-size: 0.9rem;
	}
	.footerSelect {
		flex: 1;
		max-width: 9rem;
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

	/* 
	match everything after <summary> within the open <details>
	reference: https://developer.mozilla.org/en-US/docs/Web/CSS/Subsequent-sibling_combinator
	*/
	details[open] summary ~ * {
		animation: sweep .7s ease-in-out;
	}

	@keyframes sweep {
		0%    {opacity: 0; }
		100%  {opacity: 1; }
	}
</style>