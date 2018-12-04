(function() {
  var stage = d3.select("#hero")

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      width = 300,
      height = 300,
      grid_size = 5;


  var outer = stage.append("div")
    .style("width", "100%");

  var svg1 = outer
      .append("svg")
        .attr("class", "column")
        .attr("id", "svg1")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

  var main1 = svg1.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var X = d3.scale.linear().domain([0, grid_size]).range([0, width]);
  var Y = d3.scale.linear().domain([0, grid_size]).range([0, height]);
  var S = d3.scale.linear().domain([0, grid_size]).range([0, width]);
  var Qscale = d3.scale.linear().domain([-1, 0, 1]).range(["#f22", "#aaa", "#22f"]);
  var Pscale = d3.scale.linear().domain([0, 1]).range(["#d8d0d0", "#000"]);

  var line = d3.svg.line().x(d => X(d[0])).y(d => Y(d[1]));

  // environment
  //==============


  var grid1 = main1.append("g").attr("class", "grid");

  var cell_data1 = [];
  _.range(grid_size).forEach( y =>
    _.range(grid_size - 1 ).forEach(x =>
      cell_data1.push({x: x, y: y}) ))
  cell_data1.splice(grid_size-2, 1); // remove the cell beneath the goal square

  var actions = [ {name: "up", x: 0, y: 1},   {name: "down", x: 0, y: -1},
                  {name: "left", x: -1, y: 0}, {name: "right", x: 1, y: 0}, ];

  var cell1 = grid1.selectAll("g").data(cell_data1);

  cell_enter = cell1.enter().append("g")
    .attr("class", d => "cell pos-" + d.x + "-" + d.y)
    .attr("transform", d => "translate(" + X(d.x) + "," + Y(d.y) + ")" );

  cell_enter.append("rect").attr("class", "background")
    .attr("width", S(0.95))
    .attr("height", S(0.95));

  function add_triangles_eq(g) {
    actions.forEach(a =>
      g.append("path").attr("class", "triangle " + a.name)
        .attr("transform", "translate(" + X(0.15*a.x) + "," + Y(0.15*a.y) + ")")
        .attr("d", function() {
            if (a.name == "down")  ps = [[-0.1, 0], [0, -0.15], [0.1, 0]];
            if (a.name == "up")    ps = [[-0.1, 0], [0, 0.15], [0.1, 0]];
            if (a.name == "left")  ps = [[0,-0.1], [-0.15, 0], [0, 0.1]];
            if (a.name == "right") ps = [[0,-0.1], [0.15, 0], [0, 0.1]];
            return line(ps);
          })
        );
  }

  function add_triangles(g) {
    actions.forEach(a =>
      g.append("path").attr("class", "triangle " + a.name)
        .attr("transform", "translate(" + X(0.25*a.x) + "," + Y(0.25*a.y) + ")")
        .attr("d", function() {
          var b = 0.0, f = 0.15, s = 0.18;
          if (a.name == "down")  ps = [[-s, -b], [0, -f], [s, -b]];
          if (a.name == "up")    ps = [[-s, b], [0, f], [s, b]];
          if (a.name == "left")  ps = [[-b,-s], [-f, 0], [-b, s]];
          if (a.name == "right") ps = [[b,-s], [f, 0], [b, s]];
            return line(ps);
          })
        );
  }

  Vg = cell_enter.append("g").attr("class", "V").style("display", "none")
      .attr("transform", "translate("+X(0.475)+","+Y(0.475)+")");
  Vg.append("circle").attr("r", S(0.3));

  Qg = cell_enter.append("g").attr("class", "Q")
      .attr("transform", "translate("+X(0.475)+","+Y(0.475)+")")
      .call(add_triangles);

  Pg = cell_enter.append("g").attr("class", "P").style("display", "none")
      .attr("transform", "translate("+X(0.475)+","+Y(0.475)+")")
      .call(add_triangles);

  function display() {
    displayQ(Q_table1);
    displayV(V_table1);
    displayP(Q_table1);
  }

  function displayQ(Q_table) {
    actions.forEach(a =>
      Qg.select("."+a.name).style("fill", d => Qscale(Q([d.x, d.y], a, Q_table)))
    );
  }

  function displayV(V_table) {
    Vg.select("circle").style("fill", d => Qscale(V([d.x, d.y], V_table)));
  }

  function displayP(Q_table){
    //var epsilon=0.25;
    actions.forEach(a =>
      Pg.select("."+a.name).style("fill", d => {
        var s = [d.x, d.y];
        var good_as = greedy_as(s, Q_table);
        if (_.contains(good_as, a)){
          return Pscale( (1- epsilon)/good_as.length + epsilon/actions.length);
        } else {
          return Pscale(epsilon/actions.length);
        }
      })
    );
  }

  cliff = grid1.append("rect").attr("class", "cliff")
    .attr("width", S(0.85))
    .attr("height", S(4.85))
    .attr("data-x", 4)
    .attr("data-y", 0)
    .attr("transform", d => "translate(" + X(4+0.05) + "," + Y(0+0.05) + ")" );

  goal = grid1.append("rect").attr("class", "goal")
      .attr("width", S(0.85))
      .attr("height", S(0.85))
      .attr("data-x", 3)
      .attr("data-y", 0)
      .attr("transform", d => "translate(" + X(3+0.05) + "," + Y(0+0.05) + ")" );

  agent_layer = grid1.append("g");

  cell1.exit().remove();


  // USER INTERFACE
  //================

  var epsilon=0.2;
  var discount=0.8;


  var control_panel = outer.append("div")
      .attr("class", "column")



  var policy_div = control_panel.append("div")
    .attr("class", "control-panel")
    .style("width", "260px")
    .style("padding", "5px")
    .style("height", "90px")
  policy_div.append("h2").text("Policy: epsilon-greedy")
    .style("margin-top", "0px")
  policy_div.append("p").text("explore")
    .attr('class', 'label')
    .style("position", "absolute")
    .style("left", "202px")
    .style("top", "70px")
  policy_div.append("p").text("exploit")
    .attr('class', 'label')
    .style("position", "absolute")
    .style("left", "10px")
    .style("top", "70px")

  policy_div.append("button")
      .text("Run Episode")
      .on("click", () => run_episode(epsilon_greedy_policy, Q_table1) )
      .style("position", "absolute")
      .style("left", "90px")
      .style("top", "30px")

  policy_div.append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", 1)
    .attr("step", 0.01)
    .on("mousemove", function () {epsilon=this.value; display();} )
    .style("position", "absolute")
    .style("left", "30px")
    .style("width", "200px")
    .style("top", "60px")
    .attr("value", epsilon)


  var learning_div = control_panel.append("div")
      .attr("class", "control-panel")
      .style("top", "130px")
      .style("width", "260px")
      .style("padding", "5px")

  learning_div.append("h2")
    .text("Learning Algorithm")
    .style("margin-top", "0px")
  var vis_select = learning_div.append("select");
  vis_select.append("option")
    .attr("value", "MC")
    .text("Monte-Carlo (on-policy)");
  vis_select.append("option")
    .attr("value", "SARSA")
    .text("SARSA (on-policy TD)");
  vis_select.append("option")
    .attr("value", "SARSA_V")
    .text("special V SARSA (on-policy TD)");
  vis_select.append("option")
    .attr("value", "Q")
    .text("Q-Learning (off-policy TD)")
    .attr("selected", "selected");
  vis_select.on("change", function() {
    if (this.value == "MC") {
      learning_algorithm = update_Q_MC;
    } else if (this.value == "SARSA") {
      learning_algorithm = update_Q_SARSA;
    } else if (this.value == "SARSA_V") {
      learning_algorithm = update_Q_SARSA_V;
    } else if (this.value == "Q") {
      learning_algorithm = update_Q_Q;
    }
    run_update();
  });

  function run_update() {
    _.range(50).forEach(() => learning_algorithm(episode_histories));
  }

  learning_div.append("button")
      .text("Update Q")
      .on("click", run_update);



  var visualize_div = control_panel.append("div")
      .attr("class", "control-panel")
      .style("top", "240px")
      .style("padding", "5px")
      .style("width", "260px");

  visualize_div.append("h2")
    .text("Visualization")
    .style("margin-top", "0px");

  var vis_select = visualize_div.append("select");
  vis_select.append("option").attr("value", "policy").text("policy")
  vis_select.append("option").attr("value", "Q").text("Q(s,a)")
    .attr("selected", "selected")
  vis_select.append("option").attr("value", "V").text("V(s)")
  vis_select.on("change", function() {
    if (this.value == "policy") {
      Pg.style("display", "");
      Vg.style("display", "none");
      Qg.style("display", "none");
    } else if (this.value == "Q") {
      Pg.style("display", "none");
      Vg.style("display", "none");
      Qg.style("display", "");
    }else if (this.value == "V") {
      Pg.style("display", "none");
      Vg.style("display", "");
      Qg.style("display", "none");
    }
  });

  function randInt(n) {
    return Math.floor(n*Math.random());
  }

  function randSelect(l) {
    return l[randInt(l.length)];
  }

  function new_episode() {

    function random_agent_position(){
      var x = randInt(grid_size), y = randInt(grid_size);
      if (x == JSON.parse(goal.attr("data-x")) && y == JSON.parse(goal.attr("data-y")) || 
          x == JSON.parse(cliff.attr("data-x")) ) {
        return random_agent_position();
      }
      return [x,y];
    }

    var x_init, y_init;
    [x_init, y_init] = random_agent_position();
    var agent = agent_layer.append("circle").attr("class", "agent")
        .attr("r", S(0.12))
        .attr("data-x", x_init).attr("cx", X(x_init + 0.475))
        .attr("data-y", y_init).attr("cy", Y(y_init + 0.475));

    function step(a, T) {
      T = T == undefined? 1000 : T;
      //debugger
      var x = JSON.parse(agent.attr("data-x"));
      var y = JSON.parse(agent.attr("data-y"));
      var x2 = x + a.x, y2 = y + a.y;

      if (x2 == goal.attr("data-x") && y2 == goal.attr("data-y")) {
        agent
          .attr("data-x", "")
          .attr("data-y", "")
          .transition(0.6*T)
            .attr("cx", X(x2+0.475))
            .attr("cy", Y(y2+0.475))
            .remove();
        goal.transition(0.4*T).delay(0.4*T).style("fill", "#ccf");
        goal.transition(0.1*T).delay(0.8*T).style("fill", "")
        return {reward: 1, end: true, state: ""};

      } else if (x2 == cliff.attr("data-x")) {
        agent
          .attr("data-x", "")
          .attr("data-y", "")
          .transition(0.6*T)
            .attr("cx", X(x2+0.475))
            .attr("cy", Y(y2+0.475))
            .remove();
        cliff.transition(0.4*T).delay(0.4*T).style("fill", "#fcc");
        cliff.transition(0.1*T).delay(0.8*T).style("fill", "")
        return {reward: -1, end: true, state: ""};

      } else if (0 <= x2 && x2 < grid_size && 0 <= y2 && y2 < grid_size) {
        agent
          .attr("data-x", x2)
          .attr("data-y", y2)
          .transition(0.6*T)
            .attr("cx", X(x2+0.45))
            .attr("cy", Y(y2+0.45));
        return {reward: 0, end: false, state: [x2, y2] };

      } else {
        x2 = 0.3*x2 + 0.7*x;
        y2 = 0.3*y2 + 0.7*y;
        agent.transition(0.4*T).ease("bounce")
            .attr("cx", X(x2+0.45))
            .attr("cy", Y(y2+0.45));
        agent.transition(0.2*T).delay(0.2*T)
            .attr("cx", X(x+0.45))
            .attr("cy", Y(y+0.45));
        return {reward: 0, end: false, state: [x, y] };
      }

    }

    return {s0: [x_init, y_init], step: step};
  }



  Q_table1 = {};
  V_table1 = {};

  var episode_histories = [];

  function run_episode(policy, Q_table) {
    var history = [];
    var episode = new_episode();
    var s = episode.s0;
    var act_interval = setInterval(() => {
      var a = policy(s, Q_table);
      info = episode.step(a, 300);
      history.push({state: s, action: a, reward: info.reward});
      s = info.state;
      if (info.end) {
        clearInterval(act_interval);
        episode_histories.push(history);
        run_update();
      }
    }, 500);
  }

  function random_policy(s) {
    return randSelect(actions);
  }

  function greedy_as(s, Q_table) {
    var optimal_as = [];
    var max_reward = -1;
    actions.forEach(a => {
      if (Q(s,a, Q_table) > max_reward) {
        max_reward = Q(s,a, Q_table);
        optimal_as = [a];
      } else if (Q(s,a, Q_table) == max_reward){
        optimal_as.push(a);
      }});
      return optimal_as;
  }

  function greedy_policy(s, Q_table) {
    return randSelect(greedy_as(s, Q_table));
  }

  function epsilon_greedy_policy(s, Q_table) {
    //var epsilon = 0.25;
    if (Math.random() < epsilon) {
      return randSelect(actions);
    } else {
      return greedy_policy(s, Q_table);
    }
  }

  function Q(s, a, Q_table) {
    var v = Q_table[[s, a.name]];
    return v == undefined? 0 : v;
  }

  function V(s, V_table) {
    var v = V_table[[s]];
    return v == undefined? 0 : v;
  }

  function Qmax(s, Q_table) {
    var v = -1;
    for (var i in actions) {
      var a = actions[i];
      var q = Q(s,a, Q_table);
      v = v < q? q : v;
    }
    return v;
  }

  function update_Q_MC(histories, V_table, Q_table){
    var R = 0;
    for (var n in histories){
      var history = histories[n];
      for (var i = history.length-1; i >= 0; i--) {
        var r = history[i].reward, s = history[i].state, a = history[i].action;
        var v = Q_table[[s, a.name]];
        R = discount*R + r;
        if (v == undefined) v = 0;
        Q_table[[s, a.name]] = v + 0.1*(R-v);
        var v = V(s, V_table);
        V_table[[s]] = v + 0.1*(R-v);
      }
    }
    display()
  }

  function update_Q_Q(histories, V_table, Q_table){
    var R = 0;
    for (var n in histories){
      var history = histories[n];
      for (var i = history.length-1; i >= 0; i--) {
        var r = history[i].reward, s = history[i].state, a = history[i].action;
        if (i != history.length-1){
          R = discount*Qmax(history[i+1].state) + r;
        } else {
          R = r;
        }
        var q = Q(s,a, Q_table);
        Q_table[[s, a.name]] = q + 0.1*(R-q);
        var v = V(s, V_table);
        V_table[[s]] = v + 0.1*(R-v);
      }
    }
    display()
  }

  function update_Q_SARSA(histories, V_table, Q_table){
    var R = 0;
    for (var n in histories){
      var history = histories[n];
      for (var i = history.length-1; i >= 0; i--) {
        var r = history[i].reward, s = history[i].state, a = history[i].action;
        var v = Q_table[[s, a.name]];
        if (i != history.length-1){
          R = discount*Q(history[i+1].state, history[i+1].action, Q_table) + r;
        } else {
          R = r;
        }
        if (v == undefined) v = 0;
        Q_table[[s, a.name]] = v + 0.1*(R-v);
        var v = V(s, V_table);
        V_table[[s]] = v + 0.1*(R-v);
      }
    }
    display()
  }

  function update_Q_SARSA_V(histories, V_table, Q_table){
    var R = 0;
    for (var n in histories){
      var history = histories[n];
      for (var i = history.length-1; i >= 0; i--) {
        var r = history[i].reward, s = history[i].state, a = history[i].action;
        var q = Q(s,a, Q_table);
        var v = 0;
        if (i != history.length-1){
          v = V(history[i+1].state, V_table);
          R = discount*v + r;
        } else {
          R = r;
        }
        Q_table[[s, a.name]] = q + 0.1*(R-q);
        v = V(s, V_table);
        V_table[[s]] = v + 0.1*(R-v);
      }
    }
    display()
  }

  var learning_algorithm = update_Q_Q;

  display();
  run_episode(epsilon_greedy_policy, Q_table1);

})()