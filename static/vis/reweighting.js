(function() {
	// State
	let state = {
		circleOpacity: 0.5,
	}

	// Setup
	let root = d3.select("#reweighting-full");
	root.style("width", "200px");
	let svg = root.select("svg");
	let slider = root.append("input");
	slider
		.attr("type", "range")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.1);

	let circle = root.select("#circle circle");
	let square = root.select("#square rect");



	// Render
	let render = () => {
		slider.attr("value", state.circleOpacity)
		circle.style("opacity", state.circleOpacity)
		circle.style("fill", "orange")
		square.style("fill", "blue")
	}

	// Events
	slider.on("input", (event) => {
		let value = slider.property("value");
		state.circleOpacity = value;
		render();
	});

	// Initialize
	render();

})()