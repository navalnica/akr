<script>
	import ThemeSwitcher from "./lib/ThemeSwitcher.svelte";

	let visibleTask = true;
	let visibleGuess = false;
	let visibleResult = false;
	
	let guess = '';
	let resultText = '';
	let solved = false;
	let nCorrect = 0;
	let nMistakes = 0;
	
	let numberLength = 6;
	let separateStep = 3;
	
	let separators = [
		{id: '', text: "Do not separate"},
		{id: ' ', text: "Space"},
		{id: "'", text: "Apostrophe"},
	]
	let sequenceSeparator = '';

	let numberInt;
	let targetSequence;
	generateNumber();

	function randIntUniform(length){
		// low is inclusive, high is exclusive
		let low = 10 ** (length - 1);
		let high = 10 ** length;
		return Math.floor(Math.random() * (high - low) + low);
	}

	function separateSequence() {
		let numStr = numberInt.toString();

		if (sequenceSeparator == '') {
			targetSequence = numStr;
			return;
		}

		let arr = [];
		let i = numStr.length - separateStep;
		while (i >= 0){
			arr.push(numStr.slice(i, i + separateStep));
			i -= separateStep
		}
		if (i < 0 && i > - separateStep){
			arr.push(numStr.slice(0, numStr.length % separateStep))
		}

		targetSequence = arr.reverse().join(sequenceSeparator);
	}

	function generateNumber() {
		numberInt = randIntUniform(numberLength);
		separateSequence();
	}
	
	function readyToGuess() {
		visibleTask = false;
		visibleGuess = true;
		visibleResult = false;
	}
	function checkGuess() {
		visibleResult = true;
		let inputGuess = document.getElementById('input-guess');
		
		// forbid input field to accept non-digits except for separator
		let guessInt = guess.replace(/\D/g, '');  // remove non-digit characters
		guessInt = parseInt(guessInt, 10);

		console.log("Check guess ", guess, " to be equal to target ", numberInt)

		if (guessInt === numberInt){
			resultText = 'Correct';
			nCorrect += 1;
			solved = true;
			inputGuess.setAttribute('aria-invalid', 'false');
			inputGuess.readOnly = true;
		}
		else{
			resultText = 'Mistake';
			nMistakes += 1;
			inputGuess.setAttribute('aria-invalid', 'true');
		}
	}
	function hideResult() {
		visibleResult = false;
	}
	
	function restart() {
		generateNumber();
		visibleGuess = false;
		visibleTask = true;
		guess = '';
		solved = false;
	}

	let modes = [
		{id: "int", text: "Number"},
		{id: "passport", text: "Passport"},
		{id: "iban", text: "IBAN"},
	]
	let selectedMode = 'int';

	function changeMode() {

	}

	$: separateLabel = `Separate each ${separateStep} digits`
</script>

<hgroup id="header">
	<h2>OCD fighter</h2>
	<h3>Fight Obsessive–compulsive disorder by solving simple tasks</h3>
</hgroup>

<div id="appForm">
	<div id="controls">
		<select id="selectMode" bind:value={selectedMode} on:change={changeMode}>
			{#each modes as mode}
				<option value={mode.id}>{mode.text}</option>
			{/each}
		</select>

		<p id="scoreCounter">Correct: {nCorrect}. Mistakes: {nMistakes}</p>
	
		<label id="controlLength">Number length: {numberLength}
			<input type="range" min=4 max=20 bind:value={numberLength} on:change={generateNumber}>
		</label>
		<label id="controlSeparator">Separator
			<select bind:value={sequenceSeparator} on:change={separateSequence}>
				{#each separators as sep}
					<option value={sep.id}>{sep.text}</option>
				{/each}
			</select>
		</label>
		<label id="controlSeparatorStep">{separateLabel}
			<input type="range" min=2 max=5 disabled={sequenceSeparator == ''} bind:value={separateStep} on:change={separateSequence}/>
		</label>
	</div>
	
	{#if visibleTask}
		<p>Number: <strong>{targetSequence}</strong></p>
		<button id="buttonReady" on:click={readyToGuess}>Ready</button>
	{/if}

	{#if visibleGuess}
		<label for='input-guess'>Your guess</label>
		<div id="inputRow">
			<input type='text' id='input-guess' bind:value={guess} on:input={(e) => hideResult()}/>
			<button id='button-check' on:click={checkGuess} disabled={solved}>Check</button>
			<button id='button-restart' on:click={restart}>Restart</button>	
		</div>
		{#if visibleResult}
			<p>{resultText}</p>
		{/if}
	{/if}
</div>

<div id="footer">
	<ThemeSwitcher />

	<a href="https://github.com/navalnica/akr" target="_blank" rel="noreferrer">
		<i class="fa-brands fa-github" style='font-size:18px'></i> GitHub
	</a>
</div>

<style>
	#appForm {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	#controls {
		display: grid;
		grid-template-columns: 1fr, 1fr;
		grid-template-rows: repeat(3, 100px);
		gap: 1em;
	}

	#selectMode {
		grid-area: 1 / 1 / 1 / 2;
	}
	#scoreCounter {
		grid-area: 2 / 1 / 2 / 2;
	}
	#controlLength {
		grid-area: 1 / 2 / 1 / 3;
	}
	#controlSeparator {
		grid-area: 2 / 2 / 2 / 3;
	}
	#controlSeparatorStep {
		grid-area: 3 / 2 / 3 / 3;
	}

	/* #subcontrols {
		display: flex;
		gap: 1em;
		justify-content: space-around;
	} */

	#inputRow {
		display: flex;
		gap: 0.5em;
	}

	#inputRow > input {
		flex: 7;
	}
	#inputRow > button {
		flex: 1;
	}

	#buttonReady {
		width: 30%;
		align-self: center;
	}

	label {
		text-align: left;
	}
</style>