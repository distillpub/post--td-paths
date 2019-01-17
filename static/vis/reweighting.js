(function() {
	// State
	let state = {
		pathOneWeight: 0.5,
	}

	// Setup
	let root = d3.select("#reweighting-full");
	var C = d3.scale.linear()
      .domain([-2, 0, 2])
      .range([ "#AA1E00", "#CCC", "#001EAA"]);

	let svg = root.select("svg");
	let slider = root.append("input")
					 .style("position", "relative")
					 .style("width", "210px")
					 .style("top", "0px")
					 .style("left", "0px");
	slider
		.attr("type", "range")
		.attr("min", 0)
		.attr("max", 1)
		.attr("step", 0.01);

	let background = root.select("#background");
	let up_path = root.select("#up-path");
	let right_path = root.select("#right-path");
	let downstream = root.select("#downstream");


	// Render
	let render = () => {
		slider.attr("value", state.pathOneWeight);
		downstream.selectAll('circle').style("fill", C(3*state.pathOneWeight-1));
		downstream.selectAll('polyline').style("stroke", C(3*state.pathOneWeight-1));
		downstream.selectAll('path').style("stroke", C(3*state.pathOneWeight-1));

		up_path.selectAll('polyline').style("stroke-width", state.pathOneWeight*20);
		right_path.selectAll('line').style("stroke-width", 20 - state.pathOneWeight*20);
	}

	// Events
	slider.on("input", (event) => {
		let value = slider.property("value");
		state.pathOneWeight = value;
		render();
	});

	// Initialize
	render();

})()