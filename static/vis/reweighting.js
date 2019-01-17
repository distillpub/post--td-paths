(function() {
	// State
	let state = {
		testOpacity: 1.0,
	}

	// Setup
	let root = d3.select("#reweighting-full");
	console.log(root);

	let svg = root.select("svg");
	let slider = root.append("input");
	slider
		.attr("type", "range")
		.attr("min", 0)
		.attr("max", 1.0)
		.attr("step", 0.01);

	let background = root.select("#background");
	let up_path = root.select("#up-path");


	// Render
	let render = () => {
		slider.attr("value", state.testOpacity)
		background.style("opacity", state.testOpacity)
	}

	// Events
	slider.on("input", (event) => {
		let value = slider.property("value");
		state.testOpacity = value;
		render();
	});

	// Initialize
	render();

})()