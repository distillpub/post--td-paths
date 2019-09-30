(function() {
	// State
	let state = {
		pathOneWeight: 0.5,
	}

	// Setup
	let root = d3.select("#reweighting-full");
	// var C = d3.scale.linear()
 //      .domain([-2, 0, 2])
 //      .range([ "#AA1E00", "#CCC", "#001EAA"]);

    var C = d3.scale.linear()
      .domain([-2, -1.2, -.5, 0, .5, 1.2, 2])
      .range(['#8a181a','#b54d24','#d08b66','#cccccc','#788cda','#394bbd','#2a2d7c']);

	let svg = root.select("svg");
	let slider = d3.select("#q-value-slider")

	let background = root.select("#background");
	let up_path = root.select("#up-path");
	let right_path = root.select("#right-path");
	let downstream = root.select("#downstream");

	let label = d3.select("#q-value-label");


	// Render
	let render = () => {
		slider.attr("value", state.pathOneWeight);
		downstream.selectAll('circle').style("fill", C(3*state.pathOneWeight-1));
		downstream.selectAll('polyline').style("stroke", C(3*state.pathOneWeight-1));
		downstream.selectAll('path').style("stroke", C(3*state.pathOneWeight-1));
		label.text(d3.format(".2f")(state.pathOneWeight));
		up_path.selectAll('polyline').style("stroke-width", state.pathOneWeight*20);
		right_path.selectAll('line').style("stroke-width", 20 - state.pathOneWeight*20);
	}

	slider.on("input", (event) => {
		let value = slider.property("value");
		state.pathOneWeight = value;
		render();
	});

	// Initialize
	render();

})()