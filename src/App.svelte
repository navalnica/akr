<script>
	import ThemeSwitcher from "./lib/ThemeSwitcher.svelte";

	let visibleTask = true;
	let visibleGuess = false;
	
	let guess = '';
	let resultText = 'default';  // default value not to leave <p> tag blank and to occupy space in layout
	let solved = false;
	let nCorrect = 0;
	let nMistakes = 0;
	
	let numberLength = 6;
	
	let toSeparateSeq = true;
	let separateStep = 3;
	let sequenceSeparator = ' ';
	let separators = [
		{id: " ", text: "Space"},
		{id: "'", text: "Apostrophe"},
	]
	// match any separator or space character
	let regexpNormalizeGuess = new RegExp(separators.map(x => x.id).join("|") + '|\\s', 'g')

	let targetSeq;
	generateSequence();
	$: targetSeqSeparated = separateSequence(targetSeq);
	
	let targetSeqCopy;
	let targetSeqSeparatedCopy;

	function randIntUniform(length){
		// low is inclusive, high is exclusive
		let low = 10 ** (length - 1);
		let high = 10 ** length;
		let num = Math.floor(Math.random() * (high - low) + low);
		return num.toString();
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

	function generateSequence() {
		targetSeq = randIntUniform(numberLength);
	}
	function reseparateSequence() {
		targetSeqSeparated = separateSequence(targetSeq);
	}
	
	function readyToGuess() {
		visibleTask = false;
		visibleGuess = true;

		// we store target sequence in a copy to allow user to adjust setting while guessing current sequence
		targetSeqCopy = targetSeq;
		targetSeqSeparatedCopy = targetSeqSeparated;
	}
	function checkGuess() {
		let paragraphResult = document.getElementById('paragraphResult');
		paragraphResult.style.visibility = "visible";
		
		let inputGuess = document.getElementById('input-guess');

		let guessNorm = guess.replace(regexpNormalizeGuess, '');  // remove space characters
		
		console.log("Check guess ", guessNorm, " to be equal to target ", targetSeqCopy)
		
		if (guessNorm === targetSeqCopy){
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
		let paragraphResult = document.getElementById('paragraphResult');
		paragraphResult.style.visibility = "hidden";
	}
	
	function restart() {
		generateSequence();
		visibleGuess = false;
		visibleTask = true;
		guess = '';
		solved = false;

		let paragraphResult = document.getElementById('paragraphResult');
		paragraphResult.style.visibility = "hidden";
	}

	function showAnswer() {
		resultText = targetSeqSeparatedCopy;
		solved = true;

		let inputGuess = document.getElementById('input-guess');
		inputGuess.readOnly = true;

		let paragraphResult = document.getElementById('paragraphResult');
		paragraphResult.style.visibility = "visible";
	}

	let modes = [
		{id: "custom", text: "Custom"},
		{id: "passport", text: "Passport"},
		{id: "iban", text: "IBAN"},
	]
	let selectedMode = 'custom';

	function changeMode() {

	}
</script>

<hgroup id="header">
	<h2>OCD fighter</h2>
	<h3>Fight Obsessive–compulsive disorder by solving simple tasks</h3>
</hgroup>

<div id="appForm">
	<div id="controls">
		<p id="scoreCounter">Correct: {nCorrect}. Mistakes: {nMistakes}</p>
		
		<details id="detailsAccordion">
			<summary id="detailsAccordionSummary">Settings</summary>

			<select id="selectMode" bind:value={selectedMode} on:change={changeMode}>
				{#each modes as mode}
					<option value={mode.id}>{mode.text}</option>
				{/each}
			</select>

			<label id="controlLength">Sequence length: {numberLength}
				<input type="range" min=4 max=20 bind:value={numberLength} on:input={generateSequence}>
			</label>
			
			<label>
				<input type="checkbox" role="switch" bind:checked={toSeparateSeq} on:change={reseparateSequence}>
				Separate sequence
			</label>

			<div id="controlGroupSeparator">

				<label id="controlSeparator">Separator
					<select disabled={!toSeparateSeq} bind:value={sequenceSeparator} on:change={reseparateSequence}>
						{#each separators as sep}
							<option value={sep.id}>{sep.text}</option>
						{/each}
					</select>
				</label>
				
				<label id="controlSeparatorStep">Step: {separateStep}
					<input type="range" min=2 max=5 disabled={!toSeparateSeq} bind:value={separateStep} on:input={reseparateSequence}>
				</label>
		

			</div>
		</details>		
	</div>
	
	<article id="taskDescription">
		{#if visibleTask}
			<p>Number: <strong>{targetSeqSeparated}</strong></p>
			<button id="buttonReady" on:click={readyToGuess}>Ready</button>
		{/if}

		{#if visibleGuess}
			<label for='input-guess'>Your guess</label>
			<!-- TODO: restrict input to numbers and separators only -->
			<input type='text' id='input-guess' bind:value={guess} on:input={() => hideResult()}/>
			<div id="guessButtonRow">
				<button id='button-restart' class='contrast outline' on:click={restart}>Restart</button>	
				<button id='button-show-answer' class='contrast outline' on:click={showAnswer} disabled={solved}>Show Answer</button>	
				<button id='button-check' on:click={checkGuess} disabled={solved}>Check</button>
			</div>
			<p id="paragraphResult">{resultText}</p>
	{/if}
	</article>
</div>

<div id="footer">
	<ThemeSwitcher />

	<!-- TODO: not visible on default startup screen -->
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
		display: flex;
		flex-direction: column;
		gap: 1em;
	}

	#selectMode {
		flex: 1;
	}
	#scoreCounter {
		text-align: left;
	}

	#detailsAccordion {
		margin-bottom: 1rem;
		border: none;
	}
	#detailsAccordionSummary {
		width: clamp(90px, 20%, 20%);
	}

	#controlGroupSeparator {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		align-items: start;
	}

	#controlSeparator {
		max-width: 200px;
	}

	#controlSeparatorStep > input {
		margin-top: 0.75rem;
	}

	#taskDescription {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: stretch;
		height: 250px;
		margin-top: 0;
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
	#paragraphResult {
		visibility: hidden;
	}

	label {
		text-align: left;
	}

	input[type='range'] {
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