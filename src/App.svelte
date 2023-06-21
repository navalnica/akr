<script>
	let visibleTask = true;
	let visibleGuess = false;
	let visibleResult = false;
	
	let guess = '';
	let resultText = '';
	let solved = false;
	let nCorrect = 0;
	let nMistakes = 0;
	
	const low = 100000;
	const high = 1000000;
	let number = randIntUniform(low, high);
	
	function readyToGuess() {
		visibleTask = false;
		visibleGuess = true;
		visibleResult = false;
	}
	function checkGuess() {
		visibleResult = true;
		if (guess == number){
			resultText = 'Correct';
			nCorrect += 1;
			solved = true;
		}
		else{
			resultText = 'Mistake';
			nMistakes += 1;
		}
	}
	function hideResult() {
		visibleResult = false;
	}
	
	function restart() {
		number = randIntUniform(low, high);
		visibleGuess = false;
		visibleTask = true;
		guess = '';
		solved = false;
	}
	
	function randIntUniform(low, high){
		// low is inclusive, high is exclusive
		return Math.floor(Math.random() * (high - low) + low);
	}
</script>

{#if visibleTask}
	<p>Number: {number}</p>
	<button on:click={readyToGuess}>Ready</button>
{/if}

{#if visibleGuess}
	<label for='input-guess'>Your guess</label>
	<input type='text' id='input-guess' bind:value={guess} on:input={(e) => hideResult()}/>
	<button id='button-check' on:click={checkGuess} disabled='{solved}'>Check</button>
	<button id='button-restart' on:click={restart}>Restart</button>
	{#if visibleResult}
		<p>{resultText}</p>
	{/if}
{/if}

<p>Correct: {nCorrect}. Mistakes: {nMistakes}</p>

<a href="https://github.com/navalnica/akr" target="_blank" rel="noreferrer">
	<i class="fa-brands fa-github" style='font-size:18px'></i> GitHub
</a>