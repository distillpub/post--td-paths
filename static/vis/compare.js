
function compare_vis(main_div, config, callback){

  config = config || {};
  var grid_size = 5;
  var algs = config.algs || ["MC", "TD", "Q"] ;
  var goals = [{x: 3, y: 0, reward: 2},
               {x: 4, y: 0, reward: -1},
               {x: 4, y: 1, reward: -1},
               {x: 4, y: 2, reward: -1},
               {x: 4, y: 3, reward: -1},
               {x: 4, y: 4, reward: -1},];
  var env = new GridWorld.Env({grid_size: grid_size, goals: goals});
  var svg = main_div.append("svg")
    .attr("width", 900)
    .attr("height", 380)
    .attr("viewBox", "0 0 900 380")
    .style("width", "100%");

  var S = _.range(algs.length).map(n =>
    svg.append("g").attr("width", 280).attr("height", 280)
      .attr("transform", "translate("+(310 * n)+",0)"));

  function make_label(pos_x, name, latex, latex2) {
    var label1 = main_div.append("div")
      .style("position", "absolute")
      .style("top", "280px")
      .style("left", (310*pos_x) + "px")
      .style("width", "300px")
      .style("text-align", "left");

    label1.append("div")
      .text(name)
      .style("font-weight", "bold")
      .style("margin", "8px 0 4px");

    label1.append("d-math")
      .style("font-size", "90%")
      .html(latex);

    if (latex2) {
      label1.append("d-math")
        .style("font-size", "85%")
        .html(latex2);
    }

  }

  label_data = {
     MC: {name: "Monte Carlo", eq: "V(s_t) ~\\hookleftarrow~ R_t"},
     TD: {name: "Temporal Difference", eq: "V(s_t) ~\\hookleftarrow~ r_t ~+~ \\gamma V(s_{t+1})"},
     Q:  {
      name: "Q-Learning", 
      eq: "Q(s_t, a_t) ~\\hookleftarrow~ r_t ~+~ \\gamma V(s_{t+1})",
      eq2: "V(s) ~=~ \\mathop{\\textrm{max}} \\limits_a ~ Q(s,a)",
     }
   }

  setTimeout(() => {
     _.range(algs.length).map(n => {
        name_info = label_data[algs[n]];
        make_label(n, name_info.name, name_info.eq, name_info.eq2);
     });
    }, 200);

  var V = S.map(s => new env.View(s));

  let compare_running = false;

  function update(histories){
    compare_running = true;
    discount = 1.0;
    learn_MC(histories, {name: "MC", steps: 100});
    learn_TD(histories, {name: "TD", steps: 500});
    learn_Q(histories, {name: "Q", steps: 500});
    _.range(algs.length).map(n => {
       V[n].show_info("V", algs[n], histories);
    });
  }

  function visualize(){
    var agent1 = new env.Agent({start: {x: 0, y: 2}, trail: true});
    action_names = ["right", "up", "right", "up", "right", "right"];
    mapP(action_names, a_name => {
      var a = _.findWhere(agent1.state.actions, {name: a_name});
      if (agent1.history.length != 0) {
        update([agent1.history]);
      }
      var P = agent1.step(a, 500);
      return P;
    }).then(() => {
      var agent2 = new env.Agent({start: { x:2, y: grid_size-1}, trail: true});
      action_names = ["up", "up", "up", "right", "right", "up", "up"];
      return mapP(action_names, a_name => {
        var a = _.findWhere(agent2.state.actions, {name: a_name});
        update([agent1.history, agent2.history]);
        var P = agent2.step(a, 500);
        return P;
      })
      .then(() => {
        compare_running = false;

        callback();
      });

    });
  }
  return function() {

    env.states.forEach(s => {
      for (var k in s.V) {s.V[k] = undefined;}
      s.actions.forEach(a => {
        for (var k in a.Q) {a.Q[k] = undefined;}
      });
    });

    [].forEach.call(document.querySelectorAll('.trail'), function (el) {
      el.style.visibility = 'hidden';
    });

    update([]); // clear history first from previous git commit.
    visualize();
  };
}
