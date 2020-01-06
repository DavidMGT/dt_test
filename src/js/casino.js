var $KEYCODE_MODULE = {
  CAMBODIA: 'cambodia',
  NUMPAD: 'numpad',
  SETTING: 'setting',
  HISTORY: 'history'
};

var $model_vietnam = function (uri_, table_no_, callback_) {
  var _REQ_IN_RIGSTER = '01040201', // ask server to bind shuffler
    _MSG_IN_REGISTER = '01040001'; // MSG_IN_REGISTER, app server restarted and ask all client to register again

  var _uri = uri_,
    _table_no = table_no_,
    _callback = callback_;

  var _ws = _websocket({
    uri: _uri,
    connect_timeout: $config.websocket.connect_timeout,
    reconnect_interval: $config.websocket.reconnect_interval,
    ping_timeout: $config.websocket.ping_timeout,
    ping_interval: $config.websocket.ping_interval,
    data_cb: function (cmd_, data_) {
      switch (cmd_) {
        case _MSG_IN_REGISTER:
          _ws_register();
          break;
      }
      ;
    },
    status_cb: function (status_, statistic_) {
      _callback({
        code: 'vietnam_shuffler',
        status: status_
      });
      if (status_ !== 0) {
        _ws_register();
      }
      ;
    }
  });
  _ws.start();

  var _ws_register = function () {
    _ws(_REQ_IN_RIGSTER, table_no_, function (err_, cmd_, data_) {
      _callback({
        code: 'vietnam_register',
        data: JSON.parse(data_)
      });
    });
  };
};

var $model_russia = function (uri_, table_no_, callback_) {
  var _uri = uri_,
    _table_no = table_no_,
    _callback = callback_;

  var _ws = _websocket({
    uri: 'ws://127.0.0.1:80',
    connect_timeout: $config.websocket.connect_timeout,
    reconnect_interval: $config.websocket.reconnect_interval,
    ping_timeout: $config.websocket.ping_timeout,
    ping_interval: $config.websocket.ping_interval,
    data_cb: function (cmd_, data_) {
      _handler(cmd_, data_);
    },
    status_cb: function (status_, statistic_) {
      _callback({
        code: 'russia_shuffler',
        status: status_
      });
    }
  });

  var _CMD = {
    REQ_IN_PING: '01040101',
    RES_IN_PING: '01040102',
    MSG_IN_SERIALPORT: '01049901',
    MSG_IN_GAME: '01049902',
    REQ_IN_SERIALPORT: '01040201',
    RES_IN_SERIALPORT: '01040202'
  };

  var _handler = function (cmd_, data_) {
    switch (cmd_) {
      case _CMD.MSG_IN_GAME:
        _callback(_game(data_));
      case _CMD.MSG_IN_SERIALPORT:
        _callback(_serialport(data_));
        break;
    }
    ;
  };

  var _game = function (data_) {
    return {
      code: 'russia_game',
      data: JSON.parse(data_)
    };
  };

  var _serialport = function (data_) {
    return {
      code: 'russia_serialport',
      data: JSON.parse(data_)
    };
  };

  var _switch_serialport = function (serialport_) {
    _ws(_CMD.REQ_IN_SERIALPORT, serialport_, function (data_) {
      console.log(data_);
    });
  };

  _ws.start();

  return {
    switch_serialport: _switch_serialport
  };
};

var $model = function (ws_callback_) {
  var _http_callback = null,
    _ws_callback = ws_callback_;

  var _get_gameset = function (callback_) {
    if (_http_callback !== null) {
      return;
    }
    ;
    _http_callback = callback_;

    var json = {
      'table_no': _uri.table_no,
      'computer_name': _uri.table_no.toString()
    };

    $ajax(_uri.http + '/get_gameset', json, function (err_, json_) {
      var callback = _http_callback;
      _http_callback = null;

      callback(err_, json_);
    });
  };

  var _get_gameset_history = function (val_, callback_) {
    if (_http_callback !== null) {
      return;
    }
    ;
    _http_callback = callback_;

    var json = {
      'table_no': _uri.table_no,
      'computer_name': _uri.table_no.toString(),
      'history': val_.toString()
    };

    $ajax(_uri.http + '/get_gameset_history', json, function (err_, json_) {
      var callback = _http_callback;
      _http_callback = null;

      callback(err_, json_);
    });
  };

  var _insert_game = function (win_, banker_pair_, player_pair_, callback_) {
    if (_http_callback !== null) {
      return;
    }
    ;
    _http_callback = callback_;

    var json = {
      'table_no': _uri.table_no,
      'computer_name': _uri.table_no.toString(),
      'win': win_,
      'banker_pair': banker_pair_,
      'player_pair': player_pair_
    };

    $ajax(_uri.http + '/insert_game', json, function (err_, json_) {
      var callback = _http_callback;
      _http_callback = null;

      callback(err_, json_);
    });
  };

  var _cancel_game = function (callback_) {
    if (_http_callback !== null) {
      return;
    }
    ;
    _http_callback = callback_;

    var json = {
      'table_no': _uri.table_no,
      'computer_name': _uri.table_no.toString()
    };

    $ajax(_uri.http + '/cancel_game', json, function (err_, json_) {
      var callback = _http_callback;
      _http_callback = null;

      callback(err_, json_);
    });
  };

  var _insert_shoe = function (callback_) {
    if (_http_callback !== null) {
      return;
    }
    ;
    _http_callback = callback_;

    var json = {
      'table_no': _uri.table_no,
      'computer_name': _uri.table_no.toString()
    };

    $ajax(_uri.http + '/insert_shoe', json, function (err_, json_) {
      var callback = _http_callback;
      _http_callback = null;

      callback(err_, json_);
    });
  };

  var _cancel_shoe = function (callback_) {
    if (_http_callback !== null) {
      return;
    }
    ;
    _http_callback = callback_;

    var json = {
      'table_no': _uri.table_no,
      'computer_name': _uri.table_no.toString()
    };

    $ajax(_uri.http + '/cancel_shoe', json, function (err_, json_) {
      var callback = _http_callback;
      _http_callback = null;

      callback(err_, json_);
    });
  };

  var _parse_uri = function () {
    var uri = window.location.href,
      table_no = uri.substr(uri.length - 4),
      domain,
      port = 80,
      slash = -1,
      colon = -1;

    var ws_uri,
      ws_port;

    if (!/^\d{4}$/.test(table_no)) {
      return {
        http: '',
        ws: '',
        table_no: 0
      };
    }
    ;

    table_no = parseInt(table_no);

    if ($config.model.table.indexOf(table_no) === -1) {
      return {
        http: '',
        ws: '',
        table_no: 0
      };
    }
    ;

    uri = uri.replace('http://', '');

    slash = uri.indexOf('/');
    if (slash !== -1) {
      uri = uri.substr(0, slash);
    }
    ;

    colon = uri.indexOf(':');
    if (colon !== -1) {
      domain = uri.substr(0, colon);
      port = uri.substr(colon + 1);
    } else {
      domain = uri;
    }
    ;

    var http_domain = domain,
      http_port = 80,
      ws_domain = domain,
      ws_port = 80;

    if (domain === 'backend.xpxyaba.com') {
      // client test environment
      if ((table_no >= 2500) && (table_no <= 2599)) {
        http_port = 19011; // philippines
      } else if ((table_no >= 2900) && (table_no <= 2999)) {
        http_port = 19014; // russia
        ws_domain = '127.0.0.1';
      } else if ((table_no >= 2700) && (table_no <= 2799)) {
        http_port = 19013; // vietnam
        ws_port = 19030;
      } else if ((table_no >= 2800) && (table_no <= 2899)) {
        http_port = 19012; // cambodia
      } else if ((table_no >= 3500) && (table_no <= 3599)) {
        http_port = 19015; // redstar
        ws_domain = '127.0.0.1';
      }
      ;
    } else if (port === 80) {
      // client live environment
      http_port = 19011;
      if ((table_no >= 2500) && (table_no <= 2599)) {
        // philippines
      } else if ((table_no >= 2900) && (table_no <= 2999)) {
        ws_domain = '127.0.0.1'; // russia
      } else if ((table_no >= 2700) && (table_no <= 2799)) {
        ws_port = 19030; // vietnam
      } else if ((table_no >= 2800) && (table_no <= 2899)) {
        // cambodia
      } else if ((table_no >= 3500) && (table_no <= 3599)) {
        http_port = 19012; // redstar
        ws_domain = '127.0.0.1';
      }
      ;
    } else {
      // development environment
      if ((table_no >= 2500) && (table_no <= 2599)) {
        http_port = parseInt('1' + port.toString().substr(0, 1) + '010'); // philippines
      } else if ((table_no >= 2900) && (table_no <= 2999)) {
        http_port = parseInt('1' + port.toString().substr(0, 1) + '013'); // russia
        ws_domain = '127.0.0.1';
      } else if ((table_no >= 2700) && (table_no <= 2799)) {
        http_port = parseInt('1' + port.toString().substr(0, 1) + '012'); // vietnam
      } else if ((table_no >= 2800) && (table_no <= 2899)) {
        http_port = parseInt('1' + port.toString().substr(0, 1) + '011');
        ; // cambodia
      } else if ((table_no >= 3500) && (table_no <= 3599)) {
        http_port = parseInt('1' + port.toString().substr(0, 1) + '014');
        ; // redstar
        ws_domain = '127.0.0.1';
      }
      ;
    }
    ;

    return {
      http: 'http://' + http_domain + ':' + http_port,
      table_no: table_no,
      ws: 'ws://' + ws_domain + ':' + ws_port,
    };
  };

  var _uri = _parse_uri(),
    closure = {
      get_gameset: _get_gameset,
      insert_game: _insert_game,
      cancel_game: _cancel_game,
      insert_shoe: _insert_shoe,
      cancel_shoe: _cancel_shoe,
      table_no: _uri.table_no,
      get_gameset_history: _get_gameset_history,
      http: _uri.http,
      ws: _uri.ws
    };

  if ($config.model.vietnam === 1) {
    closure.vietnam = $model_vietnam(_uri.ws, _uri.table_no, function (data_) {
      _ws_callback(data_);
    });
  }
  ;

  if ($config.model.russia === 1) {
    closure.russia = $model_russia(_uri.ws, _uri.table_no, function (data_) {
      _ws_callback(data_);
    });
  }
  ;

  return closure;
};

var $view = function (controller_callback_, inner_width_, inner_height_) {
  var _timer = 0;

  var _table_no = function (table_no_) {
    $('#table_no').html(table_no_);
  };

  var _shoe = function (shoe_) {
    $('#shoe_cnt').html(shoe_);
  };

  var _sync_sys_info = function (game_set_, shoe_of_the_day_, sys_time_) {
    /*
		var sys_time = new Date(sys_time_),
				sync_time = new Date();
		_sys_timestamp = sys_time.getTime();
		_sync_timestamp = sync_time.getTime();
		*/
    $('#shoe_cnt').html(shoe_of_the_day_);
  };

  var _limit = function () {
    var cookie_input_limit = $cookie($cookie.NAME.INPUT_LIMIT);

    var limit_min = '$' + $money($config.limit[cookie_input_limit].limit_min, true),
      limit_max = '$' + $money($config.limit[cookie_input_limit].limit_max, true),
      tie_min = '$' + $money($config.limit[cookie_input_limit].tie_min, true),
      tie_max = '$' + $money($config.limit[cookie_input_limit].tie_max, true),
      tie_limit = tie_min + '/' + tie_max,
      pair_min = '$' + $money($config.limit[cookie_input_limit].pair_min, true),
      pair_max = '$' + $money($config.limit[cookie_input_limit].pair_max, true),
      pair_limit = pair_min + '/' + pair_max;

    _header.limit_min.html(limit_min);
    _header.limit_max.html(limit_max);
    _header.tie_limit.html(tie_limit);
    _header.pair_limit.html(pair_limit);
  };

  var _blur = function () {
    // $('#mask').css('display', 'block');
    $('#enable').css('display', 'none');
    $('#disable').css('display', 'block');
  };

  var _focus = function () {
    //$('#mask').css('display', 'none');
    $('#enable').css('display', 'block');
    $('#disable').css('display', 'none');
  };

  var _resize = function (inner_width_, inner_height_) {
  };

  var _disable = function () {
    _body.$.css('display', 'none');
  };

  var _bptp = function (bptp_, flash_type_) {
    _big.roadmap.draw_big(bptp_, flash_type_);
    _eye.roadmap.draw_eye(bptp_, flash_type_);
    _small.roadmap.draw_small(bptp_, flash_type_);
    _bug.roadmap.draw_bug(bptp_, flash_type_);
    _bead.roadmap.draw_bead(bptp_, flash_type_);
    _ask.bkr.draw(bptp_);
    _ask.plr.draw(bptp_);

    if (_timer !== 0) {
      clearTimeout(_timer);
      _timer == 0;
      $('#timer').css('display', 'none');
      for (var i = 1; i <= 3; i++) {
        $('#timer_' + i).css('display', 'none');
      }
      ;
    }
    ;

    if (flash_type_ === 1) {
      if (bptp_.length > 0) {
        var bptp = bptp_[bptp_.length - 1],
          bpt;
        switch (bptp) {
          case 1:
          case 4:
          case 5:
          case 6:
            bpt = 1;
            break;
          case 2:
          case 7:
          case 8:
          case 9:
            bpt = 2;
            break;
          case 3:
          case 10:
          case 11:
          case 12:
            bpt = 3;
            break;
        }
        ;
        $('#timer').css('display', 'block');
        $('#timer_' + bpt).css('display', 'block');
        _timer = setTimeout(function () {
          clearTimeout(_timer);
          _timer == 0;
          $('#timer').css('display', 'none');
          for (var i = 1; i <= 12; i++) {
            $('#timer_' + i).css('display', 'none');
          }
          ;
        }, $config.view.timer);
      }
      ;
    }
    ;

    var game_cnt = 0,
      game_bkr = 0,
      game_plr = 0,
      game_tie = 0,
      game_bpair = 0,
      game_ppair = 0;

    for (var i = 0; i < bptp_.length; i++) {
      game_cnt++;
      switch (bptp_[i]) {
        //banker win
        case 1 :
          game_bkr++;
          break;
        case 4 : //banker pair
          game_bkr++;
          game_bpair++;
          break;
        case 5 : //player pair
          game_bkr++;
          game_ppair++;
          break;
        case 6 : //two pair
          game_bkr++;
          game_bpair++;
          game_ppair++;
          break;
        //player win
        case 2 :
          game_plr++;
          break;
        case 7 :
          game_plr++;
          game_bpair++;
          break;
        case 8 :
          game_plr++;
          game_ppair++;
          break;
        case 9 :
          game_plr++;
          game_bpair++;
          game_ppair++;
          break;
        case 3 :
          game_tie++;
          break;
        case 10 :
          game_tie++;
          game_bpair++;
          break;
        case 11 :
          game_tie++;
          game_ppair++;
          break;
        case 12 :
          game_tie++;
          game_bpair++;
          game_ppair++;
          break;
      }
      ;
    }
    ;

    $('#game_cnt').html(game_cnt);
    $('#game_bkr').html(game_bkr);
    $('#game_plr').html(game_plr);
    $('#game_tie').html(game_tie);
    $('#game_bpair').html(game_bpair);
    $('#game_ppair').html(game_ppair);
  };

  var _get_viewport_no_border_height = function () {
    var height = _viewport.height;
    for (var i in $config.border) {
      height -= $config.border[i];
    }
    ;
    return height;
  };

  var _draw_body = function () {
    var body = $('body');
    body.css('position', 'absolute')
      .css('padding', '0')
      .css('margin', '0')
      .css('overflow', 'hidden');

    return {$: body};
  };

  var _draw_casino = function () {
    var casino = $('#casino');
    casino.css('position', 'absolute')
      .css('width', _viewport.width + 'px')
      .css('height', _viewport.height + 'px')
      .css('top', '0px')
      .css('left', '0px')
      .css('background-color', $config.view.bgcolor);

    return {$: casino};
  };

  var _draw_mask = function () {
    $('#mask').css('position', 'absolute')
      .css('width', _viewport.width + 'px')
      .css('height', _viewport.height + 'px')
      .css('top', '0px')
      .css('left', '0px')
      .css('text-align', 'center')
      .css('vertical-align', 'middle')
      .css('font-size', '40px')
      .css('color', 'white')
      .css('line-height', _viewport.height + 'px')
      .css('display', 'none')
      .css('background-color', 'rgba(0, 0, 0, 0.9)');
  };

  var _draw_header = function () {
    var width = _viewport.width,
      height_ratio = $config.view.ratio.header / 100,
      height = Math.floor(_viewport_no_border_height * height_ratio);

    var header = $('#header');
    header.css('position', 'absolute')
      .css('width', width + 'px')
      .css('height', height + 'px')
      .css('top', '0px')
      .css('left', '0px');

    var head_width_ratio = $config.view.header.head.width / 100,
      head_height_ratio = $config.view.header.head.height / 100,
      head_width = Math.floor(width * head_width_ratio),
      head_height = Math.floor(height * head_height_ratio),
      head_x = Math.floor((width - head_width) / 2),
      head_y = Math.floor((height - head_height) / 2);

    var head = $('#head');
    head.css('position', 'absolute')
      .css('border-collapse', 'collapse')
      .css('table-layout', 'fixed')
      .css('margin', 0)
      .css('border', 0)
      .css('padding', 0)
      .css('width', head_width + 'px')
      .css('height', head_height + 'px')
      .css('top', head_y + 'px')
      .css('left', head_x + 'px');

    var bet_limit_width_ratio = $config.view.header.bet_limit.ratio / 100,
      bet_limit_width = Math.floor(head_width * bet_limit_width_ratio);

    var bet_limit = $('#bet_limit');
    bet_limit.css('width', bet_limit_width + 'px');

    var bet_limit_space = $('#bet_limit_space');
    bet_limit_space.html($space($config.view.header.bet_limit.font.space));

    var bet_limit_title_font_ratio = $config.view.header.bet_limit.font.title / 100,
      bet_limit_font_ratio = $config.view.header.bet_limit.font.text / 100;

    var limit_min_title = $('#limit_min_title');
    limit_min_title.css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * bet_limit_title_font_ratio) + 'px');

    var limit_min_space = $('#limit_min_space');
    limit_min_space.html($space($config.view.header.bet_limit.font.min_space));

    var limit_min = $('#limit_min');
    limit_min.css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * bet_limit_font_ratio) + 'px');

    var limit_max_title = $('#limit_max_title');
    limit_max_title.css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * bet_limit_title_font_ratio) + 'px');

    var limit_max_space = $('#limit_max_space');
    limit_max_space.html($space($config.view.header.bet_limit.font.max_space));

    var limit_max = $('#limit_max');
    limit_max.css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * bet_limit_font_ratio) + 'px');

    var other_limit_title_font_ratio = $config.view.header.other_limit.title / 100,
      other_limit_font_ratio = $config.view.header.other_limit.text / 100;

    var tie_limit_title = $('#tie_limit_title');
    tie_limit_title.css('text-align', 'right')
      .css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * other_limit_title_font_ratio) + 'px');

    var tie_limit_space = $('#tie_limit_space');
    tie_limit_space.html($space($config.view.header.other_limit.space));

    var tie_limit = $('#tie_limit');
    tie_limit.css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * other_limit_font_ratio) + 'px');

    var pair_limit_title = $('#pair_limit_title');
    pair_limit_title.css('text-align', 'right')
      .css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * other_limit_title_font_ratio) + 'px');

    var pair_limit_space = $('#pair_limit_space');
    pair_limit_space.html($space($config.view.header.other_limit.space));

    var pair_limit = $('#pair_limit');
    pair_limit.css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(head_height * other_limit_font_ratio) + 'px');

    return {
      height: height,
      limit_min: limit_min,
      limit_max: limit_max,
      tie_limit: tie_limit,
      pair_limit: pair_limit
    };
  };

  var _draw_big = function () {
    var rows = 6,
      cols_min = 30,
      cols_max = 105,
      border = 1,
      height_ratio = $config.view.ratio.road / 100 / 2,
      height = Math.floor(_viewport_no_border_height * height_ratio),
      cell_height = $div(height, rows),
      down_cell_height = Math.floor(cell_height / 2);
    cell_height = down_cell_height * 2;

    var info = $.extend(
      true,
      {b_big: $config.view.big.line},
      $big_info(cell_height,
        rows,
        cols_min,
        cols_max,
        _viewport.width)
    );

    var bg = $('#big_bg');
    bg.css('position', 'absolute')
      .css('width', _viewport.width + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', '0px')
      .css('background-color', '#ffffff');

    var padding = Math.floor((_viewport.width - info.w_roadmap) / 2);
    var jq = $('#big');
    jq.css('position', 'absolute')
      .css('width', info.w_roadmap + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', '0px')
      .css('left', padding + 'px');

    var canvas = jq.get(0);
    canvas.width = info.w_roadmap;
    canvas.height = info.h_roadmap;

    var big = $roadmap(canvas, info);
    big.draw_big([]);

    return {
      width: info.w_roadmap,
      height: info.h_roadmap,
      padding: padding,
      roadmap: big,
      down_cell_height: down_cell_height
    };
  };

  var _draw_eye = function (width_limit_, cell_height_) {
    var rows = 6,
      cols_min = 30,
      cols_max = 105,
      border = 1,
      height_ratio = $config.view.ratio.road / 100 / 4;

    var info = $.extend(
      true,
      {b_eye: $config.view.down.line},
      $eye_info(
        cell_height_,
        rows,
        cols_min,
        cols_max,
        width_limit_)
    );

    height = Math.floor(_viewport_no_border_height * height_ratio);

    var bg = $('#eye_bg');
    bg.css('position', 'absolute')
      .css('width', _viewport.width + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', '0px')
      .css('background-color', '#ffffff');

    var padding = Math.floor((_viewport.width - info.w_roadmap) / 2);
    var jq = $('#eye');
    jq.css('position', 'absolute')
      .css('width', info.w_roadmap + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', '0px')
      .css('left', padding + 'px');

    var canvas = jq.get(0);
    canvas.width = info.w_roadmap;
    canvas.height = info.h_roadmap;

    var eye = $roadmap(canvas, info);
    eye.draw_eye([]);

    return {
      width: info.w_roadmap,
      height: info.h_roadmap,
      y: _viewport_next_y,
      x: padding,
      roadmap: eye
    };
  };

  var _draw_small = function (cell_height_) {
    var rows = 6,
      cols_min = 30,
      cols_max = 105,
      border = 1,
      height_ratio = $config.view.ratio.road / 100 / 4;

    var width_limit = Math.floor(_viewport.width / 2);

    var info = $small_info(
      cell_height_,
      rows,
      cols_min,
      cols_max,
      width_limit);

    height = Math.floor(_viewport_no_border_height * height_ratio);

    var remain_space = _viewport.width - info.w_roadmap * 2,
      remain_space_max = Math.floor(cell_height_ / 2);
    if ((remain_space > 3) && (remain_space <= remain_space_max)) {
      remain_space = 3;
    } else if (remain_space > remain_space_max) {
      remain_space = remain_space_max;
    }
    ;
    width_limit = Math.floor((_viewport.width - remain_space) / 2);
    var padding = Math.floor((width_limit - info.w_roadmap) / 2);
    /*
		if ((padding >= 2) && (padding <= 3)) {
			padding = 1;
		} else if (padding > 3) {
			padding = 3;
		};

		width_limit = info.w_roadmap + padding * 2;
		*/
    var bg = $('#small_bg');
    bg.css('position', 'absolute')
      .css('width', width_limit + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', '0px')
      .css('background-color', '#ffffff');

    var jq = $('#small');
    jq.css('position', 'absolute')
      .css('width', info.w_roadmap + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', '0px')
      .css('left', padding + 'px');

    var canvas = jq.get(0);
    canvas.width = info.w_roadmap;
    canvas.height = info.h_roadmap;

    var small = $roadmap(canvas, info);
    small.draw_small([]);

    return {
      width: info.w_roadmap,
      height: info.h_roadmap,
      y: _viewport_next_y,
      x: padding,
      roadmap: small
    };
  };

  var _draw_bug = function (cell_height_) {
    var rows = 6,
      cols_min = 30,
      cols_max = 105,
      border = 1,
      height_ratio = $config.view.ratio.road / 100 / 4;

    var width_limit = Math.floor(_viewport.width / 2);

    var info = $.extend(
      true,
      {b_bug: $config.view.down.line},
      $bug_info(
        cell_height_,
        rows,
        cols_min,
        cols_max,
        width_limit)
    );

    height = Math.floor(_viewport_no_border_height * height_ratio);

    var remain_space = _viewport.width - info.w_roadmap * 2,
      remain_space_max = Math.floor(cell_height_ / 2);
    if ((remain_space > 3) && (remain_space <= remain_space_max)) {
      remain_space = 3;
    } else if (remain_space > remain_space_max) {
      remain_space = remain_space_max;
    }
    ;
    width_limit = Math.floor((_viewport.width - remain_space) / 2);
    var padding = Math.floor((width_limit - info.w_roadmap) / 2);
    /*
		if ((padding >= 2) && (padding <= 3)) {
			padding = 1;
		} else if (padding > 3) {
			padding = 3;
		};

		width_limit = info.w_roadmap + padding * 2;
		*/

    var bg = $('#bug_bg');
    bg.css('position', 'absolute')
      .css('width', width_limit + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', _viewport.width - width_limit + 'px')
      .css('background-color', '#ffffff');

    var jq = $('#bug');
    jq.css('position', 'absolute')
      .css('width', info.w_roadmap + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', '0px')
      .css('left', padding + 'px');

    var canvas = jq.get(0);
    canvas.width = info.w_roadmap;
    canvas.height = info.h_roadmap;

    var bug = $roadmap(canvas, info);
    bug.draw_bug([]);

    return {
      width: info.w_roadmap,
      height: info.h_roadmap,
      y: _viewport_next_y,
      x: padding,
      roadmap: bug
    };
  };

  var _draw_timer = function (width_, height_, x_, y_) {
    var timer = $('#timer');
    timer.css('position', 'absolute')
      .css('display', 'none')
      .css('width', width_ + 'px')
      .css('height', height_ + 'px')
      .css('top', y_ + 'px')
      .css('left', x_ + 'px');

    for (var i = 1; i <= 3; i++) {
      $('#timer_' + i).css('position', 'absolute')
        .css('display', 'none')
        .css('width', width_ + 'px')
        .css('height', height_ + 'px')
        .css('line-height', height_ + 'px')
        .css('text-align', 'center')
        .css('font-family', 'Microsoft YaHei')
        .css('font-size', Math.floor(height_ * 0.8) + 'px');
    }
    ;
    $('#timer_1').css('color', '#ff0000');
    $('#timer_2').css('color', '#0000ff');
    $('#timer_3').css('color', '#006000');

    return {
      $: timer
    };
  };

  var _draw_bead = function () {
    var width_ratio = 100;
    for (var i in $config.view.bottom.ratio) {
      width_ratio -= $config.view.bottom.ratio[i];
    }
    ;
    width_ratio = width_ratio / 100;

    var height_ratio = $config.view.ratio.bottom / 100,
      height = Math.floor(_viewport_no_border_height * height_ratio);

    var rows = 6,
      cols_min = 10,
      cols_max = 105,
      cell_height = Math.floor(height / rows),
      width = Math.floor(_bottom_no_border_width * width_ratio),
      info = $.extend(
        true,
        {b_bead: $config.view.bead.line},
        $bead_info(
          cell_height,
          rows,
          cols_min,
          cols_max,
          width
        )
      );

    if (info.h_roadmap > height) {
      height = info.h_roadmap;
    }
    ;

    var bg = $('#bead_bg');
    bg.css('position', 'absolute')
      .css('width', width + 'px')
      .css('height', height + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', '0px')
      .css('background-color', '#ffffff');

    var jq = $('#bead');
    jq.css('position', 'absolute')
      .css('width', info.w_roadmap + 'px')
      .css('height', info.h_roadmap + 'px')
      .css('top', '0px')
      .css('left', Math.floor((width - info.w_roadmap) / 2) + 'px');
    console.log('jq:',jq,':canvas:',jq.get(0));
    var canvas = jq.get(0);
    canvas.width = info.w_roadmap;
    canvas.height = info.h_roadmap;

    var bead = $roadmap(canvas, info);
    bead.draw_bead([]);

    return {
      width: width,
      height: height,
      roadmap: bead,
      side: info.s_bead,
      line: info.b_bead
    };
  };

  var _draw_game_bead = function (ctx_, color_, text_, pair_, side_, line_, font_size_) {
    var radius = $div(side_, 2);
    ctx_.beginPath();
    ctx_.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx_.fillStyle = color_;
    ctx_.fill();

    ctx_.lineWidth = line_;

    if (text_ !== '') {
      ctx_.font = font_size_ + 'px ' + 'Arial';
      ctx_.textBaseline = 'top';

      var font_size = $mul(font_size_, 1.20),
        text_size = ctx_.measureText(text_),
        text_x = Math.floor($div(side_ - text_size.width, 2)),
        text_y = side_ - Math.floor(font_size);

      ctx_.fillStyle = '#ffffff';
      ctx_.fillText(text_, text_x, text_y);
    }
    ;

    var bpair = pair_ & 1,
      ppair = pair_ >> 1 & 1;

    var pair_side = $div(side_, 4),
      pair_half = $div(pair_side, 2),
      pair_radius = $sub(pair_half, $div(line_, 2));

    if (bpair) {
      ctx_.beginPath();
      ctx_.arc(pair_half, pair_half, pair_radius, 0, 2 * Math.PI);
      ctx_.fillStyle = '#ff0000';
      ctx_.fill();
      ctx_.strokeStyle = '#ffffff';
      ctx_.stroke();
    }
    ;

    var ppair_center = $sub(side_, pair_half);
    if (ppair) {
      ctx_.beginPath();
      ctx_.arc(ppair_center, ppair_center, pair_radius, 0, 2 * Math.PI);
      ctx_.fillStyle = '#0000ff';
      ctx_.fill();
      ctx_.strokeStyle = '#ffffff';
      ctx_.stroke();
    }
    ;
  };

  var _draw_game = function (height_, bead_side_, bead_line_) {
    var line = 1,
      width_ratio = $config.view.bottom.ratio.game / 100,
      width = Math.floor(_bottom_no_border_width * width_ratio);

    var bg = $('#game_bg');
    bg.css('position', 'absolute')
      .css('width', width + 'px')
      .css('height', height_ + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', _bottom_next_x + 'px')
      .css('background-color', '#ffffff');

    var table_width = Math.floor(width * $config.view.game.width / 100),
      table_padding = Math.floor((width - table_width) / 2),
      table_height = height_ - line;

    var table = $set_no_space_table('#game_table');
    table.css('position', 'absolute')
      .css('width', table_width + 'px')
      .css('height', table_height + 'px')
      .css('top', '0px')
      .css('left', table_padding + 'px');

    var td_height_ratio = $config.view.game.ratio.td.height / 100,
      td_height = Math.floor(table_height * td_height_ratio),
      td_title_font_ratio = $config.view.game.font.title / 100;

    var title_height = table_height - td_height * 5,
      title_font_ratio = $config.view.game.font.game / 100,
      title_width_ratio = $config.view.game.ratio.td.width / 100,
      title_width = Math.floor(table_width * title_width_ratio);

    var game = $('#game_title');
    game.css('font-family', 'Arial')
      .css('height', title_height + 'px')
      .css('width', title_width + 'px')
      .css('color', '#00ff00')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(title_height * title_font_ratio) + 'px');

    $('#game_line').css('border-bottom', line + 'px solid #000000');

    var title_bkr = $('#game_title_bkr');
    title_bkr.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_title_font_ratio) + 'px');

    var title_plr = $('#game_title_plr');
    title_plr.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_title_font_ratio) + 'px');

    var title_tie = $('#game_title_tie');
    title_tie.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_title_font_ratio) + 'px');

    var title_bpair = $('#game_title_bpair');
    title_bpair.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_title_font_ratio) + 'px');

    var title_ppair = $('#game_title_ppair');
    title_ppair.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_title_font_ratio) + 'px');

    var font_size = bead_side_ * 0.8;

    var icon_bkr = $('#game_icon_bkr'),
      canvas_bkr = icon_bkr.get(0),
      ctx_bkr = canvas_bkr.getContext('2d');

    icon_bkr.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', 0);
    canvas_bkr.width = bead_side_;
    canvas_bkr.height = bead_side_;
    _draw_game_bead(ctx_bkr, '#ff0000', 'B', 0, bead_side_, bead_line_, font_size);

    var icon_plr = $('#game_icon_plr'),
      canvas_plr = icon_plr.get(0),
      ctx_plr = canvas_plr.getContext('2d');

    icon_plr.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', 0);
    canvas_plr.width = bead_side_;
    canvas_plr.height = bead_side_;
    _draw_game_bead(ctx_plr, '#0000ff', 'P', 0, bead_side_, bead_line_, font_size);

    var icon_tie = $('#game_icon_tie'),
      canvas_tie = icon_tie.get(0),
      ctx_tie = canvas_tie.getContext('2d');

    icon_tie.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', 0);
    canvas_tie.width = bead_side_;
    canvas_tie.height = bead_side_;
    _draw_game_bead(ctx_tie, '#008800', 'T', 0, bead_side_, bead_line_, font_size);

    var icon_bpair = $('#game_icon_bpair'),
      canvas_bpair = icon_bpair.get(0),
      ctx_bpair = canvas_bpair.getContext('2d');

    icon_bpair.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', 0);
    canvas_bpair.width = bead_side_;
    canvas_bpair.height = bead_side_;
    _draw_game_bead(ctx_bpair, '#ff8000', '', 1, bead_side_, bead_line_, font_size);

    var icon_ppair = $('#game_icon_ppair'),
      canvas_ppair = icon_ppair.get(0),
      ctx_ppair = canvas_ppair.getContext('2d');

    icon_ppair.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', 0);
    canvas_ppair.width = bead_side_;
    canvas_ppair.height = bead_side_;
    _draw_game_bead(ctx_ppair, '#ff8000', '', 2, bead_side_, bead_line_, font_size);

    var td_text_font_ratio = $config.view.game.font.text / 100;

    var game_cnt = $('#game_cnt'),
      game_cnt_width_ratio = $config.view.game.ratio.cnt / 100,
      game_cnt_width = Math.floor(table_width * game_cnt_width_ratio);

    game_cnt.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('width', game_cnt_width + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_text_font_ratio) + 'px')
      .css('text-align', 'right');

    var game_bkr = $('#game_bkr');
    game_bkr.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_text_font_ratio) + 'px')
      .css('text-align', 'right');

    var game_plr = $('#game_plr');
    game_plr.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_text_font_ratio) + 'px')
      .css('text-align', 'right');

    var game_tie = $('#game_tie');
    game_tie.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_text_font_ratio) + 'px')
      .css('text-align', 'right');

    var game_bpair = $('#game_bpair');
    game_bpair.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_text_font_ratio) + 'px')
      .css('text-align', 'right');

    var game_ppair = $('#game_ppair');
    game_ppair.css('font-family', 'Arial')
      .css('height', td_height + 'px')
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(td_height * td_text_font_ratio) + 'px')
      .css('text-align', 'right');

    return {
      width: width,
      title_height: title_height
    };
  };

  var _draw_ask = function (height_, title_height_, bead_side_, bead_line_) {
    var line = 1,
      width_ratio = $config.view.bottom.ratio.ask / 100,
      width = Math.floor(_bottom_no_border_width * width_ratio);

    var bg_height_ratio = $config.view.ask.ratio / 100,
      bg_height = Math.floor(height_ * bg_height_ratio);

    var bg = $('#ask_bg');
    bg.css('position', 'absolute')
      .css('width', width + 'px')
      .css('height', bg_height + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', _bottom_next_x + 'px')
      .css('background-color', '#ffffff');

    var table_width = Math.floor(width * $config.view.ask.width / 100),
      table_padding = Math.floor((width - table_width) / 2),
      table_height = bg_height - line;
    var table = $set_no_space_table('#ask_table');
    table.css('position', 'absolute')
      .css('width', table_width + 'px')
      .css('height', table_height + 'px')
      .css('top', '0px')
      .css('left', table_padding + 'px');

    var bkr_width = Math.floor(table_width / 2),
      plr_width = table_width - bkr_width,
      ask_height = table_height - title_height_,
      icon_left = Math.floor((bkr_width - bead_side_) / 2);

    var title_bkr = $('#ask_title_bkr');
    title_bkr.css('height', title_height_ + 'px')
      .css('width', bkr_width + 'px');

    var title_plr = $('#ask_title_plr');
    title_plr.css('height', title_height_ + 'px')
      .css('width', plr_width + 'px');

    var font_size = bead_side_ * 0.8;

    var icon_bkr = $('#ask_icon_bkr'),
      canvas_bkr = icon_bkr.get(0),
      ctx_bkr = canvas_bkr.getContext('2d');

    icon_bkr.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', icon_left + 'px');
    canvas_bkr.width = bead_side_;
    canvas_bkr.height = bead_side_;
    _draw_game_bead(ctx_bkr, '#ff0000', 'B', 0, bead_side_, bead_line_, font_size);

    var icon_plr = $('#ask_icon_plr'),
      canvas_plr = icon_plr.get(0),
      ctx_plr = canvas_plr.getContext('2d');

    icon_plr.css('position', 'relative')
      .css('display', 'block')
      .css('width', bead_side_ + 'px')
      .css('height', bead_side_ + 'px')
      .css('top', 0)
      .css('left', icon_left + 'px');
    canvas_plr.width = bead_side_;
    canvas_plr.height = bead_side_;
    _draw_game_bead(ctx_plr, '#0000ff', 'P', 0, bead_side_, bead_line_, font_size);

    $('#ask_line').css('border-bottom', line + 'px solid #000000');

    var canvas_bkr = $('#ask_bkr_canvas'),
      bkr = $ask();
    var info_bkr = bkr.init(1, canvas_bkr.get(0), bkr_width, ask_height, 6, 30, 3, 5);
    canvas_bkr.css('position', 'relative')
      .css('width', info_bkr.width + 'px')
      .css('height', info_bkr.height + 'px')
      .css('top', info_bkr.top + 'px')
      .css('left', info_bkr.left + 'px');
    canvas_bkr.get(0).width = info_bkr.width;
    canvas_bkr.get(0).height = info_bkr.height;

    var canvas_plr = $('#ask_plr_canvas'),
      plr = $ask();
    var info_plr = plr.init(2, canvas_plr.get(0), plr_width, ask_height, 6, 30, 3, 5);
    canvas_plr.css('position', 'relative')
      .css('width', info_plr.width + 'px')
      .css('height', info_plr.height + 'px')
      .css('top', info_plr.top + 'px')
      .css('left', info_plr.left + 'px');
    canvas_plr.get(0).width = info_plr.width;
    canvas_plr.get(0).height = info_plr.height;

    var shoe_height = height_ - bg_height,
      shoe_title_font_ratio = $config.view.ask.shoe.title / 100,
      shoe_font_ratio = $config.view.ask.shoe.text / 100,
      shoe_title_width_ratio = $config.view.ask.shoe.ratio / 100,
      shoe_title_width = Math.floor(table_width * shoe_title_width_ratio),
      shoe_cnt_width = table_width - shoe_title_width;

    var shoe_info = $set_no_space_table('#shoe_info');
    shoe_info.css('position', 'absolute')
      .css('width', table_width + 'px')
      .css('height', shoe_height + 'px')
      .css('top', table_height + 'px')
      .css('left', table_padding + 'px');

    var shoe_title = $('#shoe_title');
    shoe_title.css('width', shoe_title_width + 'px')
      .css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(shoe_height * shoe_title_font_ratio) + 'px');

    var shoe_cnt = $('#shoe_cnt');
    shoe_cnt.css('width', shoe_cnt_width + 'px')
      .css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(shoe_height * shoe_font_ratio) + 'px')
      .css('text-align', 'right');

    return {
      width: width,
      shoe_height: shoe_height,
      bkr: bkr,
      plr: plr,
      shoe: shoe_cnt
    };
  };

  var _draw_logo = function (height_, table_height_) {
    var width_ratio = $config.view.bottom.ratio.logo / 100,
      width = Math.floor(_bottom_no_border_width * width_ratio);

    var bg = $('#logo');
    bg.css('position', 'absolute')
      .css('width', width + 'px')
      .css('height', height_ + 'px')
      .css('top', _viewport_next_y + 'px')
      .css('left', _bottom_next_x + 'px');

    var table_title_font_ratio = $config.view.ask.shoe.title / 100,
      table_font_ratio = $config.view.ask.shoe.text / 100;

    var table_info = $set_no_space_table('#table_info');
    table_info.css('position', 'absolute')
      .css('width', width + 'px')
      .css('height', table_height_ + 'px')
      .css('top', '0px')
      .css('left', '0px');

    var table_title = $('#table_title');
    table_title.css('width', width + 'px')
      .css('text-align', 'right')
      .css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(table_height_ * table_title_font_ratio) + 'px');

    var table_no = $('#table_no');
    table_no.css('position', 'absolute')
      .css('top', '0px')
      .css('left', '0px')
      .css('line-height', height_ + 'px')
      .css('text-align', 'center')
      .css('width', width + 'px')
      .css('font-family', 'Arial')
      .css('color', '#ffffff')
      .css('font-weight', 'bold')
      .css('font-size', Math.floor(height_ * table_font_ratio) + 'px');

    return {
      width: width,
      height: height_,
      x: _bottom_next_x,
      y: _viewport_next_y
    };
  };

  var _draw_setting = function (width_, height_, x_, y_) {
    var text = '<br>';
    $('#setting_info').css('position', 'absolute')
      .css('display', 'none')
      .css('top', y_ + 'px')
      .css('left', x_ + 'px')
      .css('width', width_ + 'px')
      .css('height', height_ + 'px')
      .css('font-family', 'Arial')
      .css('font-size', '20px')
      .css('font-weight', 'bold')
      .css('background-color', 'rgba(0,0,0,0.8)')
      .css('color', '#ffffff');
    var max_length = $config.limit.length;
    var index = $config.limit_page.per_page * ($config.limit_page.default_page - 1);
    var length = $config.limit_page.default_page * $config.limit_page.per_page;
    if (length > max_length) {
      length = max_length;
    }
    for (var i = index; i < length; i++) {
      text += '&nbsp;&nbsp;&nbsp;' + i + ')&nbsp;' +
        'MIN BET:' + $money($config.limit[i].limit_min, true) +
        '; MAX BET:' + $money($config.limit[i].limit_max, true) +
        '; TIE MIN:' + $money($config.limit[i].tie_min, true) +
        '; TIE MAX:' + $money($config.limit[i].tie_max, true) +
        '; PAIR MIN:' + $money($config.limit[i].pair_min, true) +
        '; PAIR MAX:' + $money($config.limit[i].pair_max, true) + '<br>';
    }
    ;
    $('#setting_info').html(text);
  };

  var _draw_icon = function (width_, height_, x_, y_) {
    var icon = $('#icon');
    icon.css('position', 'relative')
      .css('width', width_ + 'px')
      .css('height', height_ + 'px')
      .css('top', y_ + 'px')
      .css('left', x_ + 'px')
      .css('border-radius', '3px')
      .css('background-color', '#ffffff')
      .css('display', 'none');

    var table_width = Math.floor(width_ * 0.9),
      table_height = Math.floor(height_ * 0.9),
      table_x = Math.floor((width_ - table_width) / 2),
      table_y = Math.floor((height_ - table_height) / 2);

    var table = $set_no_space_table('#icon_table');
    table.css('position', 'absolute')
      .css('width', table_width + 'px')
      .css('height', table_height + 'px')
      .css('top', table_y + 'px')
      .css('left', table_x + 'px');

    var tr = table.find('tr'),
      td_height = Math.floor(table_height / tr.length);

    table.find('td').css('font-family', 'Arial')
      .css('height', td_height)
      .css('color', '#000000')
      .css('font-weight', 'bold')
      .css('font-size', '9px');

    if ($config.model.cambodia) {
      $('#icon_cambodia').css('color', 'red');
    } else {
      $('#icon_cambodia').css('color', 'gray');
    }
    ;

    if ($config.model.vietnam) {
      $('#icon_vietnam').css('color', 'red');
    } else {
      $('#icon_vietnam').css('color', 'gray');
    }
    ;

    if ($config.model.russia) {
      $('#icon_russia').css('color', 'red');
    } else {
      $('#icon_russia').css('color', 'gray');
    }
    ;

    $('#icon_shuffler').css('color', 'gray');
    $('#icon_status').css('color', 'red')
      .css('text-align', 'right');
    $('#history_info').css('text-align', 'right');
    $('#table_limit_info').css('text-align', 'right');
    $('#serialport_info').css('text-align', 'right');

    $('#serialport').css('font-family', 'Arial')
      .css('font-size', '9px');

    _icon();

  };

  var _fullscreen = function () {
    var casino = _casino.$.get(0);
    if ((document.fullScreenElement !== undefined && document.fullScreenElement === null) ||
      (document.msFullscreenElement !== undefined && document.msFullscreenElement === null) ||
      (document.mozFullScreen !== undefined && !document.mozFullScreen) ||
      (document.webkitIsFullScreen !== undefined && !document.webkitIsFullScreen)) {
      if (casino.requestFullScreen) {
        casino.requestFullScreen();
      } else if (casino.mozRequestFullScreen) {
        casino.mozRequestFullScreen();
      } else if (casino.webkitRequestFullScreen) {
        casino.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
      } else if (casino.msRequestFullscreen) {
        casino.msRequestFullscreen();
      }
      ;
    } else {
      if (document.cancelFullScreen) {
        document.cancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    ;
  };

  var _icon = function (args_) {
    var icon = args_;
    if (typeof args_ === 'object') {
      icon = args_.icon;
    }
    ;

    $('#icon_history').css('color', 'gray');
    $('#icon_delete_game').css('color', 'gray');
    $('#icon_gameset').css('color', 'gray');
    $('#icon_delete_gameset').css('color', 'gray');
    $('#icon_table_limit').css('color', 'gray');
    $('#icon_status').html('');

    switch (icon) {
      case 'history':
        $('#icon_history').css('color', 'red');
        break;
      case 'delete_game':
        $('#icon_delete_game').css('color', 'red');
        break;
      case 'gameset':
        $('#icon_gameset').css('color', 'red');
        break;
      case 'delete_gameset':
        $('#icon_delete_gameset').css('color', 'red');
        break;
      case 'setting':
        $('#icon_table_limit').css('color', 'red');
        break;
      case 'load':
        $('#icon_status').html('loading');
        break;
      case 'error':
        $('#icon_status').html(args_.reason);
        break;
    }
    ;

    return;
    switch (icon) {
      case 'bptp':
        if ((args_.win === 'B') && (args_.banker_pair !== 1) && (args_.player_pair !== 1)) {
          _icon_status('bptp1');
        } else if ((args_.win === 'B') && (args_.banker_pair === 1) && (args_.player_pair !== 1)) {
          _icon_status('bptp4');
        } else if ((args_.win === 'B') && (args_.banker_pair !== 1) && (args_.player_pair === 1)) {
          _icon_status('bptp5');
        } else if ((args_.win === 'B') && (args_.banker_pair === 1) && (args_.player_pair === 1)) {
          _icon_status('bptp6');
        } else if ((args_.win === 'P') && (args_.banker_pair !== 1) && (args_.player_pair !== 1)) {
          _icon_status('bptp2');
        } else if ((args_.win === 'P') && (args_.banker_pair === 1) && (args_.player_pair !== 1)) {
          _icon_status('bptp7');
        } else if ((args_.win === 'P') && (args_.banker_pair !== 1) && (args_.player_pair === 1)) {
          _icon_status('bptp8');
        } else if ((args_.win === 'P') && (args_.banker_pair === 1) && (args_.player_pair === 1)) {
          _icon_status('bptp9');
        } else if ((args_.win === 'T') && (args_.banker_pair !== 1) && (args_.player_pair !== 1)) {
          _icon_status('bptp3');
        } else if ((args_.win === 'T') && (args_.banker_pair === 1) && (args_.player_pair !== 1)) {
          _icon_status('bptp10');
        } else if ((args_.win === 'T') && (args_.banker_pair !== 1) && (args_.player_pair === 1)) {
          _icon_status('bptp11');
        } else if ((args_.win === 'T') && (args_.banker_pair === 1) && (args_.player_pair === 1)) {
          _icon_status('bptp12');
        }
        ;
        break;
    }
    ;
  };

  var _setting = function (args_) {
    console.log(args_);
    $('#table_limit_info').html('');
    if (args_.exit) {
      _icon();
      $('#setting_info').css('display', 'none');
      if (typeof(args_.limit) !== 'undefined') {
        if (typeof($config.limit[args_.limit]) !== 'undefined') {
          $cookie($cookie.NAME.INPUT_LIMIT, args_.limit);
          _limit();
        }
        ;
      }
      ;
    } else {
      if (typeof(args_.limit) === 'undefined') {
        $('#table_limit_info').html('No.--');
        $('#setting_info').css('display', 'block');
      } else {
        $('#table_limit_info').html('No.' + args_.limit);
      }
      ;
    }
    ;
  };

  var _history = function (args_) {
    $('#history_info').html('');
    if (args_.exit) {
      _icon();
    } else {
      var t = '----/--/-- No.---';
      if (typeof args_.date === 'undefined') {
        $('#history_info').html(t);
      } else {
        if (isNaN(args_.date)) {
          $('#history_info').html(args_.date);
        } else {
          var v = args_.date,
            y, m, d, s = 0;

          if ((v.length >= 1 && v.length <= 8)) {
            for (var i = 0; i < v.length; i++) {
              t = t.replace('-', v.substr(i, 1));
            }
            ;
          } else if (v.length > 8) {
            for (var i = 0; i < 8; i++) {
              t = t.replace('-', v.substr(i, 1));
            }
            ;

            var no = v.substr(8);
            switch (no.length) {
              case 1:
                no = '  ' + no;
                break;
              case 2:
                no = ' ' + no;
                break;
            }
            ;

            for (var i = 0; i < no.length; i++) {
              t = t.replace('-', no.substr(i, 1));
            }
            ;
          }
          ;
        }
        ;
        $('#history_info').html(t);
      }
      ;
    }
    ;

    /*
		if ((args_.display) && (typeof(args_.date) === 'undefined')) {
			_icon_status();
			return false;
		};

		if ((args_.display) && (typeof(args_.date) === 'string')) {
			if (isNaN(args_.date)) {
				$('#history_info').html(args_.date);
			} else {
				var v = args_.date,
						y, m, d, s = 0;

				if ((v.length >= 1) && (v.length <= 4)) {
					$('#history_info').html(v);
				} else if ((v.length >= 5) && (v.length <= 6)) {
					$('#history_info').html(v.substr(0, 4) + '-' + v.substr(4));
				} else if ((v.length >= 7) && (v.length <= 8)) {
					$('#history_info').html(v.substr(0, 4) + '-' + v.substr(4, 2) + '-' + v.substr(6));
				} else if (v.length <= 11) {
					$('#history_info').html(v.substr(0, 4) + '-' + v.substr(4, 2) + '-' + v.substr(6, 2) + ' ' + v.substr(8));
				};
			};

			return false;
		};

		return true;
		*/
  };

  var _enable = function () {
    if (document.hasFocus()) {
      // $('#mask').css('display', 'none');
      $('#enable').css('display', 'block');
      $('#disable').css('display', 'none');
    } else {
      // $('#mask').css('display', 'block');
      $('#enable').css('display', 'none');
      $('#disable').css('display', 'block');
    }
    ;
  };

  var _panel = function () {
    if ($('#icon').css('display') === 'none') {
      $('#icon').css('display', 'block');
      $('#shoe').css('display', 'block');
    } else {
      $('#icon').css('display', 'none');
      $('#shoe').css('display', 'none');
    }
    ;
  };

  var _shuffler = function (status_) {
    if (status_) {
      $('#icon_shuffler').css('color', 'red');
    } else {
      $('#icon_shuffler').css('color', 'gary');
    }
    ;
  };

  var _serialport = function (com_name_, selected_) {
    var serialport = $('#serialport');
    for (var i = 0; i < com_name_.length; i++) {
      var option = $('<option value="' + com_name_[i] + '">' + com_name_[i] + '</option>');
      serialport.append(option);
    }
    ;

    if (selected_) {
      serialport.val(selected_);
    }
    ;

    serialport.on('change', function () {
      controller_callback_({
        code: 'switch_serialport',
        com_name: this.value
      });
    });
  };

  var _clear_status = function () {
    $('#icon_status').html('');
  };

  var _viewport = $viewport();
  var _viewport_no_border_height = _get_viewport_no_border_height();
  var _viewport_next_y = 0;

  var _body = _draw_body();
  var _casino = _draw_casino();
  var _header = _draw_header();
  _viewport_next_y += _header.height;
  var _big = _draw_big();
  _viewport_next_y += _big.height + $config.view.border.big;
  var _eye = _draw_eye(_big.width, _big.down_cell_height);
  _viewport_next_y += _eye.height + $config.view.border.eye;

  var _small = _draw_small(_big.down_cell_height);
  var _bug = _draw_bug(_big.down_cell_height);
  _viewport_next_y += _small.height + $config.view.border.down;

  var timer_height = _eye.height + _small.height + $config.view.border.eye;
  var _timer = _draw_timer(_viewport.width, timer_height, _eye.x, _eye.y);

  var _bottom_no_border_width = _viewport.width;
  for (var i in $config.view.bottom.border) {
    _bottom_no_border_width -= $config.view.bottom.border[i];
  }
  ;

  var _bottom_next_x = 0;
  var _bead = _draw_bead();
  _bottom_next_x += _bead.width + $config.view.bottom.border.bead;
  var _game = _draw_game(_bead.height, _bead.side, _bead.line);
  _bottom_next_x += _game.width + $config.view.bottom.border.game;
  var _ask = _draw_ask(_bead.height, _game.title_height, _bead.side, _bead.line);
  _bottom_next_x += _ask.width + $config.view.bottom.border.ask;
  var _logo = _draw_logo(_bead.height, _ask.shoe_height);

  _draw_icon(_logo.width, _logo.height, _logo.x, _logo.y);
  _draw_setting(_viewport.width, timer_height, _eye.x, _eye.y);
  _draw_mask();

  _limit();
  return {
    icon: _icon,
    bptp: _bptp,
    disable: _disable,
    resize: _resize,
    focus: _focus,
    blur: _blur,
    limit: _limit,
    shoe: _shoe,
    table_no: _table_no,
    fullscreen: _fullscreen,
    setting: _setting,
    history: _history,
    enable: _enable,
    panel: _panel,
    shuffler: _shuffler,
    serialport: _serialport,
    clear_status: _clear_status,
    draw_setting: _draw_setting
  };
};

var $controller = function () {
  var _keycode_callback = function (args_) {
    _keycode.lock();
    _view.clear_status();
    switch (args_.code) {
      case $KEYCODE_MODULE.CAMBODIA:
        _game(args_);
        break;
      case $KEYCODE_MODULE.NUMPAD:
        switch (args_.reason) {
          case 'panel':
            _view.panel();
            _keycode.lock(false);
            break;
          case 'icon':
            _view.icon(args_);
            _keycode.lock(false);
            break;
          case 'delete_game':
            _delete_game();
            break;
          case 'game':
            _game(args_);
            break;
          case 'gameset':
            _gameset();
            break;
          case 'delete_gameset':
            _delete_gameset();
            break;
          case 'fullscreen':
            _view.fullscreen();
            _keycode.lock(false);
            break;
          case 'print':
            window.print();
            _keycode.lock(false);
            break;
          case $KEYCODE_MODULE.SETTING:
            if (args_.change_page) {
              _view.draw_setting();
              _view.setting(args_);
            } else {
              _view.setting(args_);
            }
            _keycode.lock(false);
            break;
          case $KEYCODE_MODULE.HISTORY:
            _view.history(args_);
            _keycode.lock(false);
            break;
        }
        ;
        break;
      case $KEYCODE_MODULE.SETTING:
        if (args_.change_page) {
          _view.draw_setting();
          _view.setting(args_);
        } else {
          _view.setting(args_);
        }
        _keycode.lock(false);
        break;
      case $KEYCODE_MODULE.HISTORY:
        _view.history(args_);
        if (args_.query) {
          _history(args_);
        } else {
          _keycode.lock(false);
        }
        ;
        break;
    }
    ;
  };

  var _history = function (args_) {
    _view.icon('load');
    if (args_.exit) {
      _model.get_gameset(function (err_, json_) {
        _keycode.lock(false);
        if (err_) {
          $log(err_);
          _view.icon({
            icon: 'error',
            reason: err_.message
          });
        } else {
          $log(json_);
          if (json_.return_code === 0) {
            _view.icon();
            _view.bptp($bptp(json_.result));
            _view.shoe(json_.shoe_of_the_day);
          } else {
            _view.icon({
              icon: 'error',
              reason: json_.return_msg
            });
          }
          ;
        }
        ;
      });
    } else {
      _model.get_gameset_history(args_.date, function (err_, json_) {
        _keycode.lock(false);
        if (err_) {
          $log(err_);
          _view.icon({
            icon: 'error',
            reason: err_.message
          });
        } else {
          $log(json_);
          if (json_.return_code === 0) {
            _view.bptp($bptp(json_.result));
            _view.shoe(json_.shoe_of_the_day);
          } else {
            _view.icon({
              icon: 'error',
              reason: (isNaN(json_.return_msg) ? json_.return_msg : 'Gameset Not Found!!!')
            });
          }
          ;
        }
        ;
      });
    }
    ;
  };

  var _game = function (args_) {
    _view.icon('load');
    _model.insert_game(args_.win, args_.banker_pair, args_.player_pair, function (err_, json_) {
      _keycode.lock(false);
      if (err_) {
        $log(err_);
        _view.icon({
          icon: 'error',
          reason: err_.message
        });
      } else {
        $log(json_);
        if (json_.return_code === 0) {
          _view.icon();
          _view.bptp($bptp(json_.result), 1);
          _view.shoe(json_.shoe_of_the_day);
        } else {
          _view.icon({
            icon: 'error',
            reason: json_.return_msg
          });
        }
        ;
      }
      ;
    });
  };

  var _delete_game = function () {
    _view.icon('load');
    _model.cancel_game(function (err_, json_) {
      _keycode.lock(false);
      if (err_) {
        $log(err_);
        _view.icon({
          icon: 'error',
          reason: err_.message
        });
      } else {
        $log(json_);
        if (json_.return_code === 0) {
          _view.icon();
          _view.bptp($bptp(json_.result));
          _view.shoe(json_.shoe_of_the_day);
        } else {
          _view.icon({
            icon: 'error',
            reason: json_.return_msg
          });
        }
        ;
      }
      ;
    });
  };

  var _gameset = function () {
    _view.icon('load');
    _model.insert_shoe(function (err_, json_) {
      _keycode.lock(false);
      if (err_) {
        $log(err_);
        _view.icon({
          icon: 'error',
          reason: err_.message
        });
      } else {
        $log(json_);
        if (json_.return_code === 0) {
          _view.icon();
          _view.bptp([]);
          _view.shoe(json_.shoe_of_the_day);
        } else {
          _view.icon({
            icon: 'error',
            reason: json_.return_msg
          });
        }
        ;
      }
      ;
    });
  };

  var _delete_gameset = function () {
    _view.icon('load');
    _model.cancel_shoe(function (err_, json_) {
      _keycode.lock(false);
      if (err_) {
        $log(err_);
        _view.icon({
          icon: 'error',
          reason: err_.message
        });
      } else {
        $log(json_);
        if (json_.return_code === 0) {
          _view.icon();
          _view.bptp($bptp(json_.result));
          _view.shoe(json_.shoe_of_the_day);
        } else {
          _view.icon({
            icon: 'error',
            reason: json_.return_msg
          });
        }
        ;
      }
      ;
    });
  };

  var _focus = function () {
    _view.focus();

    if ($config.model.vietnam === 1) {
      _view.icon('load');
      _model.get_gameset(function (err_, json_) {
        if (err_) {
          $log(err_);
          _view.icon({
            icon: 'error',
            reason: err_.message
          });
        } else {
          $log(json_);
          if (json_.return_code === 0) {
            _view.icon();
            _view.bptp($bptp(json_.result));
            _view.shoe(json_.shoe_of_the_day);
          } else {
            _view.icon({
              icon: 'error',
              reason: json_.return_msg
            });
          }
          ;
        }
        ;
      });
    }
    ;
  };

  var _pageshow = function () {
    window.focus();
  };

  var _resize = function () {
    _view.resize(window.innerWidth, window.innerHeight);
  };

  var _serialport = function (args_) {
    var cookie_serialport = $cookie($cookie.NAME.SERIALPORT),
      server_serialport = args_.com_name,
      select_serialport;

    var is_sync_server_serialport = false;
    if (cookie_serialport === '') {
      $cookie($cookie.NAME.SERIALPORT, server_serialport);
      select_serialport = server_serialport;
    } else {
      if (args_.list.indexOf(cookie_serialport) === -1) {
        select_serialport = server_serialport;
      } else {
        if (cookie_serialport === server_serialport) {
          select_serialport = server_serialport;
        } else {
          select_serialport = cookie_serialport;
          is_sync_server_serialport = true;
        }
        ;
      }
      ;
    }
    ;

    _view.serialport(args_.list, select_serialport);

    if (is_sync_server_serialport) {
      if (_model.russia) {
        _model.russia.switch_serialport(select_serialport);
      }
      ;
    }
    ;
  };

  var russia_serialport_count = 0;
  var _model_callback = function (data_) {
    switch (data_.code) {
      case 'vietnam_shuffler':
      case 'russia_shuffler':
        _view.shuffler(data_.status);
        break;
      case 'vietnam_register':
        $log(data_.data);
        _view.bptp($bptp(data_.data.result));
        _view.shoe(data_.data.shoe_of_the_day);
        break;
      case 'russia_game':
        _game(data_.data);
        break;
      case 'russia_serialport':
        if (russia_serialport_count === 0) {
          _serialport(data_.data);
        }
        ;
        russia_serialport_count++;
        break;
    }
    ;
  };

  var _view_callback = function (data_) {
    switch (data_.code) {
      case 'switch_serialport':
        if (_model.russia) {
          $cookie($cookie.NAME.SERIALPORT, data_.com_name);
          _model.russia.switch_serialport(data_.com_name);
        }
        ;
        break;
    }
    ;
  };

  var _cookie_input_limit = $cookie($cookie.NAME.INPUT_LIMIT);
  var _model = $model(_model_callback);
  var _view = $view(_view_callback, window.innerWidth, window.innerHeight);
  var _keycode = $keycode(_keycode_callback);

  if (_model.table_no === 0) {
    _view.disable();
    return;
  }
  ;

  $log('log', 'input', 'start', _model.http, _model.ws, _model.table_no);

  // initialize view
  _view.table_no(_model.table_no);

  window.addEventListener('keydown', _keycode);
  window.addEventListener('resize', _resize);
  window.addEventListener('focus', _focus);
  window.addEventListener('blur', _view.blur);
  window.addEventListener('pageshow', _pageshow);

  _view.enable();
  _view.icon('load');
  _model.get_gameset(function (err_, json_) {
    let result='1;3;2;4;10;7;6;1'
    if (err_) {
      _view.icon();
      _view.bptp($bptp(result));
      _view.shoe(8);
    } else {
      $log(json_);
      if (json_.return_code === 0) {
        _view.icon();
        _view.bptp($bptp(result));
        _view.shoe(8);
      } else {

        _view.icon();
        _view.bptp($bptp(result));
        _view.shoe(8);
      }
      ;
    }
    ;
  });
};

var _controller;

$(document).ready(function () {
  _controller = $controller();
});

/*************************************************************************************
 **************************************************************************************
 **********   common function
 **************************************************************************************
 *************************************************************************************/
var $set_no_space_table = function (selector_) {
  var table = $(selector_);
  table.css('border-collapse', 'collapse')
    .css('table-layout', 'fixed')
    .css('margin', 0)
    .css('border', 0)
    .css('border-spacing', 0)
    .css('padding', 0);

  table.find('tbody, tr, td').css('margin', 0)
    .css('border', 0)
    .css('padding', 0);

  return table;
};

/**
 ?�援小數點�?�?
 */
var $add = function () {
  var formula = function (a, b) {
    var x = (typeof(a) === 'string' ? a : a.toString()),
      y = (typeof(b) === 'string' ? b : b.toString()),
      x1, y1, v, w, z;
    try {
      x1 = x.split('.')[1].length;
    } catch (e) {
      x1 = 0;
    }
    ;
    try {
      y1 = y.split('.')[1].length;
    } catch (e) {
      y1 = 0;
    }
    ;
    v = Math.abs(x1 - y1);
    w = Math.pow(10, Math.max(x1, y1));

    if (v > 0) {
      z = Math.pow(10, v);
      if (x1 > y1) {
        x = Number(x.toString().replace('.', ''));
        y = Number(y.toString().replace('.', '')) * z;
      } else {
        x = Number(x.toString().replace('.', '')) * z;
        y = Number(y.toString().replace('.', ''));
      }
      ;
    } else {
      x = Number(x.toString().replace('.', ''));
      y = Number(y.toString().replace('.', ''));
    }
    ;
    return (x + y) / w;
  };

  var r = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    r = formula(r, arguments[i]);
  }
  ;
  return r;
};

/**
 ?�援小數點�?�?
 */
var $sub = function (a, b) {
  var x = (typeof(a) === 'string' ? a : a.toString()),
    y = (typeof(b) === 'string' ? b : b.toString()),
    x1, y1, v, w, z;
  try {
    x1 = x.split('.')[1].length;
  } catch (e) {
    x1 = 0;
  }
  ;
  try {
    y1 = y.split('.')[1].length;
  } catch (e) {
    y1 = 0;
  }
  ;
  w = Math.pow(10, Math.max(x1, y1));
  v = (x1 >= y1) ? x1 : y1;
  return Number(((x * w - y * w) / w).toFixed(v));
};

/**
 ?�援小數點�?�?
 */
var $mul = function (a, b) {
  var x = (typeof(a) === 'string' ? a : a.toString()),
    y = (typeof(b) === 'string' ? b : b.toString()),
    z = 0;
  try {
    z += x.split('.')[1].length;
  } catch (e) {
  }
  ;
  try {
    z += y.split('.')[1].length;
  } catch (e) {
  }
  ;
  return Number(x.replace('.', '')) * Number(y.replace('.', '')) / Math.pow(10, z);
};

/**
 ?�援小數點除�?
 */
var $div = function (a, b) {
  var x = (typeof(a) === 'string' ? a : a.toString()),
    y = (typeof(b) === 'string' ? b : b.toString()),
    x1 = 0, x2,
    y1 = 0, y2;
  try {
    x1 = x.toString().split('.')[1].length;
  } catch (e) {
  }
  ;
  try {
    y1 = y.toString().split('.')[1].length;
  } catch (e) {
  }
  ;
  x2 = Number(x.toString().replace('.', ''));
  y2 = Number(y.toString().replace('.', ''));
  return (x2 / y2) * Math.pow(10, y1 - x1);
};

/**
 路�?�?
 */
var $roadmap = function (canvas_, info_) {
  var _canvas = canvas_,
    _info = $.extend(true, {}, info_),

    _BEAD = {
      UNDEFINED: 0,
      B: 1, P: 2, T: 3,
      BBP: 4, BPP: 5, BBPP: 6,
      PBP: 7, PPP: 8, PBPP: 9,
      TBP: 10, TPP: 11, TBPP: 12
    },
    _BIG = {
      UNDEFINED: 0,
      B: 1, P: 2, T: 3,
      BBP: 4, BPP: 5, BBPP: 6,
      PBP: 7, PPP: 8, PBPP: 9,
      TBP: 10, TPP: 11, TBPP: 12
    },
    _EYE = {UNDEFINED: 0, B: 1, P: 2},
    _SMALL = {UNDEFINED: 0, B: 1, P: 2},
    _BUG = {UNDEFINED: 0, B: 1, P: 2},
    _bkr_text = 'B',
    _plr_text = 'P',
    _tie_text = 'T',
    _flash_timer = 0,
    _flash_times = 10,
    _flash_count = 0,
    _flash_duration = 500,
    _flash_type,
    _flash_status = 0,
    _flash_bead,
    _flash_big,
    _flash_eye,
    _flash_small,
    _flash_bug,
    _flash_cb,
    _bptp,
    _border = 1,
    _snap = 0.5,
    _FLASH_CB = {
      FULL: 1,
      ROAD: 2,
      DOWN: 3,
      BEAD: 4,
      BIG: 5,
      EYE: 6,
      SMALL: 7,
      BUG: 8
    };

  var _flash = function () {
    clearTimeout(_flash_timer);
    _flash_timer = 0;
    _flash_status = (_flash_status === 0 ? 1 : 0);
    _flash_count++;

    var ctx = _canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';

    if (typeof(_flash_bead) !== 'undefined') {
      if (_flash_status === 1) {
        ctx.putImageData(_flash_bead, _flash_bead.x, _flash_bead.y);
      } else if (_flash_status === 0) {
        ctx.fillRect(_flash_bead.x, _flash_bead.y, _flash_bead.width, _flash_bead.height);
      }
      ;
    }
    ;
    if (typeof(_flash_big) !== 'undefined') {
      if (_flash_status === 1) {
        ctx.putImageData(_flash_big, _flash_big.x, _flash_big.y);
      } else if (_flash_status === 0) {
        ctx.fillRect(_flash_big.x, _flash_big.y, _flash_big.width, _flash_big.height);
      }
      ;
    }
    ;
    if (typeof(_flash_eye) !== 'undefined') {
      if (_flash_status === 1) {
        ctx.putImageData(_flash_eye, _flash_eye.x, _flash_eye.y);
      } else if (_flash_status === 0) {
        ctx.fillRect(_flash_eye.x, _flash_eye.y, _flash_eye.width, _flash_eye.height);
      }
      ;
    }
    ;
    if (typeof(_flash_small) !== 'undefined') {
      if (_flash_status === 1) {
        ctx.putImageData(_flash_small, _flash_small.x, _flash_small.y);
      } else if (_flash_status === 0) {
        ctx.fillRect(_flash_small.x, _flash_small.y, _flash_small.width, _flash_small.height);
      }
      ;
    }
    ;
    if (typeof(_flash_bug) !== 'undefined') {
      if (_flash_status === 1) {
        ctx.putImageData(_flash_bug, _flash_bug.x, _flash_bug.y);
      } else if (_flash_status === 0) {
        ctx.fillRect(_flash_bug.x, _flash_bug.y, _flash_bug.width, _flash_bug.height);
      }
      ;
    }
    ;

    if (_flash_count < _flash_times) {
      _flash_timer = setTimeout(_flash, _flash_duration);
    } else {
      if (_flash_type === 1) {
        if (_flash_status === 0) {
          _flash_timer = setTimeout(_flash, _flash_duration);
        }
        ;
      } else if (_flash_type === 0) {
        var bptp;
        _bptp.pop();
        bptp = _bptp.slice();
        switch (_flash_cb) {
          case _FLASH_CB.FULL:
            _draw_full(bptp, _info);
            break;
          case _FLASH_CB.DOWN:
            _draw_down(bptp, _info);
            break;
          case _FLASH_CB.EYE:
            _draw_eye(bptp, _info);
            break;
          case _FLASH_CB.SMALL:
            _draw_small(bptp, _info);
            break;
          case _FLASH_CB.BUG:
            _draw_bug(bptp, _info);
            break;
          case _FLASH_CB.BEAD:
            _draw_bead(bptp, _info);
            break;
          case _FLASH_CB.BIG:
            _draw_big(bptp, _info);
            break;
        }
        ;
      }
      ;
    }
    ;
  };

  var _grid = function (ctx_, x_, y_, r_, c_, s_, b_) {
    var w = c_ * (s_ + _border) + _border,
      h = r_ * (s_ + _border) + _border,
      x = x_,
      y = y_;

    ctx_.lineWidth = _border;
    ctx_.beginPath();
    for (var c = 0; c <= c_; c++) {
      if ((c !== 0) && (c !== c_)) {
        ctx_.moveTo(x + _snap, y_);
        ctx_.lineTo(x + _snap, y_ + h);
      }
      ;

      x += s_ + _border;
    }
    ;

    for (var r = 0; r <= r_; r++) {
      if ((r !== 0) && (r !== r_)) {
        ctx_.moveTo(x_, y + _snap);
        ctx_.lineTo(x_ + w, y + _snap);
      }
      ;
      y += s_ + _border;
    }
    ;
    ctx_.strokeStyle = '#c0c0c0';
    ctx_.stroke();


    if (!isNaN(b_)) {
      ctx_.beginPath();

      // draw top black line
      if ((b_ === 1) || (b_ === 2)) {
        ctx_.moveTo(x_, y_ + _snap);
        ctx_.lineTo(x_ + w, y_ + _snap);
      }
      ;

      // draw left black line
      if (b_ == 2) {
        ctx_.moveTo(x_ + _snap, y_);
        ctx_.lineTo(x_ + _snap, y_ + h);
      }
      ;

      ctx_.strokeStyle = '#000000';
      ctx_.stroke();
    }
    ;
  };

  var _grid2 = function (ctx_, x_, y_, r_, c_, s_, b_) {
    var w = c_ * (s_ + _border) + _border,
      h = r_ * (s_ + _border) + _border,
      x = x_,
      y = y_;

    ctx_.lineWidth = _border;
    ctx_.beginPath();
    for (var c = 0; c <= c_; c++) {
      if ((c !== 0) && (c !== c_)) {
        if (c % 2 + 1 === 1) {
          ctx_.moveTo(x + _snap, y_);
          ctx_.lineTo(x + _snap, y_ + h);
        }
        ;
      }
      ;

      x += s_ + _border;
    }
    ;

    for (var r = 0; r <= r_; r++) {
      if ((r !== 0) && (r !== r_)) {
        if (r % 2 + 1 === 1) {
          ctx_.moveTo(x_, y + _snap);
          ctx_.lineTo(x_ + w, y + _snap);
        }
        ;
      }
      ;
      y += s_ + _border;
    }
    ;
    ctx_.strokeStyle = '#c0c0c0';
    ctx_.stroke();


    if (!isNaN(b_)) {
      ctx_.beginPath();

      // draw top black line
      if ((b_ === 1) || (b_ === 2)) {
        ctx_.moveTo(x_, y_ + _snap);
        ctx_.lineTo(x_ + w, y_ + _snap);
      }
      ;

      // draw left black line
      if (b_ == 2) {
        ctx_.moveTo(x_ + _snap, y_);
        ctx_.lineTo(x_ + _snap, y_ + h);
      }
      ;

      ctx_.strokeStyle = '#000000';
      ctx_.stroke();
    }
    ;
  };

  var _reset = function (flash_type_) {
    _flash_cb = undefined;
    _bptp = undefined;
    _flash_bead = undefined;
    _flash_big = undefined;
    _flash_eye = undefined;
    _flash_small = undefined;
    _flash_bug = undefined;
    _flash_count = 0;
    _flash_type = flash_type_;
    _flash_status = 1;
    if (_flash_timer !== 0) {
      clearTimeout(_flash_timer);
      _flash_timer = 0;
    }
    ;
  };

  var _draw_full = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.FULL;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);
    roadmap.eyeroad(roadmap.bigroad());
    roadmap.smallroad(roadmap.bigroad());
    roadmap.bugroad(roadmap.bigroad());

    _bead_draw(ctx, _bptp);

    roadmap.format(roadmap.bigroad(), _info.r_big, _info.c_big);
    _big_draw(ctx, roadmap, _bptp);

    roadmap.format(roadmap.eyeroad(), _info.r_eye, _info.c_eye);
    _eye_draw(ctx, roadmap);

    roadmap.format(roadmap.smallroad(), _info.r_small, _info.c_small);
    _small_draw(ctx, roadmap);

    roadmap.format(roadmap.bugroad(), _info.r_bug, _info.c_bug);
    _bug_draw(ctx, roadmap);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _draw_bead = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.BEAD;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);
    roadmap.eyeroad(roadmap.bigroad());
    roadmap.smallroad(roadmap.bigroad());
    roadmap.bugroad(roadmap.bigroad());

    _bead_draw(ctx, _bptp);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _draw_big = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.BIG;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);

    roadmap.format(roadmap.bigroad(), _info.r_big, _info.c_big);
    _big_draw(ctx, roadmap, _bptp);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _draw_down = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.DOWN;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);
    roadmap.eyeroad(roadmap.bigroad());
    roadmap.smallroad(roadmap.bigroad());
    roadmap.bugroad(roadmap.bigroad());

    roadmap.format(roadmap.eyeroad(), _info.r_eye, _info.c_eye);
    _eye_draw(ctx, roadmap);

    roadmap.format(roadmap.smallroad(), _info.r_small, _info.c_small);
    _small_draw(ctx, roadmap);

    roadmap.format(roadmap.bugroad(), _info.r_bug, _info.c_bug);
    _bug_draw(ctx, roadmap);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _draw_eye = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.EYE;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);
    roadmap.eyeroad(roadmap.bigroad());

    roadmap.format(roadmap.eyeroad(), _info.r_eye, _info.c_eye);
    _eye_draw(ctx, roadmap);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _draw_small = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.SMALL;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);
    roadmap.smallroad(roadmap.bigroad());

    roadmap.format(roadmap.smallroad(), _info.r_small, _info.c_small);
    _small_draw(ctx, roadmap);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _draw_bug = function (bptp_, flash_type_) {
    var roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    _reset(flash_type_);
    _flash_cb = _FLASH_CB.BUG;
    _bptp = $.extend([], bptp_);

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, _info.w_roadmap, _info.h_roadmap);

    roadmap.bigroad(_bptp);
    roadmap.bugroad(roadmap.bigroad());

    roadmap.format(roadmap.bugroad(), _info.r_bug, _info.c_bug);
    _bug_draw(ctx, roadmap);

    if (typeof(flash_type_) !== 'undefined') {
      if (_bptp.length > 0) {
        _flash_timer = setTimeout(_flash, _flash_duration);
      }
      ;
    }
    ;
  };

  var _bead_draw = function (ctx_, bptp_) {
    _grid(ctx_, _info.x_bead, _info.y_bead, _info.r_bead, _info.c_bead, _info.s_bead);

    if (bptp_.length === 0) return;

    var bptp = $.extend([], bptp_),
      b = _info.c_bead * _info.r_bead,
      bptp = (bptp_.length > b ? bptp_.splice(bptp.length - b, b) : bptp),
      x = $add(_info.x_bead, _border),
      y = 0,
      i = 0,
      f = Math.floor(_info.s_bead * 0.8),
      flash;

    ctx_.lineWidth = _info.b_bead;
    ctx_.font = f + 'px ' + 'Arial';
    ctx_.textBaseline = 'top'; // https://developer.mozilla.org/zh-TW/docs/Drawing_text_using_a_canvas
    for (var c = 0; c < _info.c_bead; c++) {
      y = $add(_info.y_bead, _border);
      for (var r = 0; r < _info.r_bead; r++) {
        if (i < bptp.length) {
          _bead_print(ctx_, bptp[i], x, y, _info.s_bead, _info.b_bead, f, _bkr_text, _plr_text, _tie_text);
          if (i === bptp.length - 1) {
            _flash_bead = ctx_.getImageData(x, y, _info.s_bead, _info.s_bead);
            _flash_bead.x = x;
            _flash_bead.y = y;
          }
          ;
          i++;
        }
        ;
        y = $add(y, $add(_info.s_bead, _border));
      }
      ;
      x = $add(x, $add(_info.s_bead, _border));
    }
    ;
  };

  var _bead_print = function (ctx_, result_, x_, y_, s_, b_, f_, bkr_, plr_, tie_) {
    var h = $div(s_, 2),
      x = $add(x_, h),
      y = $add(y_, h),
      r = h,
      ss = $div(s_, 4),
      sh = $div(ss, 2),
      sr = $sub(sh, $div(b_, 2)),
      x1 = $add(x_, sh),
      y1 = $add(y_, sh),
      x2 = $sub($add(x_, s_), sh),
      y2 = $sub($add(y_, s_), sh),
      f = $mul(f_, 1.20),
      t,
      collapse_color;

    ctx_.beginPath();
    ctx_.arc(x, y, r, 0, 2 * Math.PI);
    switch (result_) {
      case _BEAD.B:
      case _BEAD.BBP:
      case _BEAD.BPP:
      case _BEAD.BBPP:
        ctx_.fillStyle = '#ff0000';
        t = bkr_;
        break;
      case _BEAD.P:
      case _BEAD.PBP:
      case _BEAD.PPP:
      case _BEAD.PBPP:
        ctx_.fillStyle = '#0000ff';
        t = plr_;
        break;
      case _BEAD.T:
      case _BEAD.TBP:
      case _BEAD.TPP:
      case _BEAD.TBPP:
        ctx_.fillStyle = '#008800';
        t = tie_;
        break;
    }
    ;
    ctx_.fill();
    var ts = ctx_.measureText(t),
      tx = x_ + Math.floor($div(s_ - ts.width, 2)),
      ty = y_ + s_ - Math.floor(f);
    ctx_.fillStyle = '#ffffff';
    ctx_.fillText(t, tx, ty);

    switch (result_) { // ??�????
      case _BEAD.BBP:
      case _BEAD.BBPP:
      case _BEAD.PBP:
      case _BEAD.PBPP:
      case _BEAD.TBP:
      case _BEAD.TBPP:
        ctx_.beginPath();
        ctx_.arc(x1, y1, sr, 0, 2 * Math.PI);
        ctx_.fillStyle = '#ff0000';
        ctx_.fill();
        ctx_.strokeStyle = '#ffffff';
        ctx_.stroke();
        break;
    }
    ;

    switch (result_) { // ???????
      case _BEAD.BPP:
      case _BEAD.BBPP:
      case _BEAD.PPP:
      case _BEAD.PBPP:
      case _BEAD.TPP:
      case _BEAD.TBPP:
        ctx_.beginPath();
        ctx_.arc(x2, y2, sr, 0, 2 * Math.PI);
        ctx_.fillStyle = '#0000ff';
        ctx_.fill();
        ctx_.strokeStyle = '#ffffff';
        ctx_.stroke();
        break;
    }
    ;
  };

  var _big_draw = function (ctx_, roadmap_, bptp_) {
    var road = roadmap_.road(),
      tie = roadmap_.tie(),
      collapse = roadmap_.collapse(),
      r_last = roadmap_.row(),
      c_last = roadmap_.col(),
      i = 0,
      t = 0,
      e = 0,
      flash;

    _grid(ctx_, _info.x_big, _info.y_big, _info.r_big, _info.c_big, _info.s_big, 0);

    console.log('road', road);
    console.log('tie', tie);
    console.log('collapse', collapse);
    console.log('r_last', r_last, 'c_last', c_last, 'bptp_', bptp_);

    if (bptp_.length === 0) return;
    if ((r_last === 0) && (c_last === 0)) return;

    var x = $add(_info.x_big, _border),
      y = 0,
      i = 0,
      f = Math.floor(_info.s_big * 0.8),
      i = t = e = 0;

    ctx_.lineWidth = _info.b_big;
    ctx_.font = f + 'px ' + 'Arial';
    ctx_.textBaseline = 'top';
    for (var c = 0; c < _info.c_big; c++) {
      y = $add(_info.y_big, _border);
      for (var r = 0; r < _info.r_big; r++) {
        i = road[r][c];
        t = (typeof(tie[r][c]) === 'undefined' ? 0 : tie[r][c]);
        e = (typeof(collapse[c]) === 'undefined' ? 0 : collapse[c]);
        if ((typeof(i) !== 'undefined') && (i !== _BIG.UNDEFINED)) {
          _big_print(ctx_, i, x, y, _info.s_big, _info.b_big, t, e, r, _info.r_big, f);
          if ((r === r_last - 1) && (c === c_last - 1)) {
            _flash_big = ctx_.getImageData(x, y, _info.s_big, _info.s_big);
            _flash_big.x = x;
            _flash_big.y = y;
          }
          ;
        }
        ;
        y = $add(y, $add(_info.s_big, _border));
      }
      ;
      x = $add(x, $add(_info.s_big, _border));
    }
    ;
  };

  var _big_print = function (ctx_, result_, x_, y_, s_, b_, t_, e_, r_, r2_, f_) {
    var h = $div(s_, 2), // half of side
      x = $add(x_, h), // center of circle
      y = $add(y_, h), // center of circle
      r = $sub(h, $div(b_, 2)), // radius of circle
      ss = $div(s_, 4), // side of corner circle
      sh = $div(ss, 2), // half side of corner circle
      sr = $sub(sh, 0.5), // radius of corner circle
      x1 = $add(x_, sh),
      y1 = $add(y_, sh),
      x2 = $sub($add(x_, s_), sh),
      y2 = $sub($add(y_, s_), sh),
      f = $mul(f_, 1.20),
      collapse_color;

    ctx_.lineWidth = b_;
    ctx_.beginPath();
    ctx_.arc(x, y, r, 0, 2 * Math.PI);
    switch (result_) { // ??????
      case _BIG.B:
      case _BIG.BBP:
      case _BIG.BPP:
      case _BIG.BBPP:
        ctx_.strokeStyle = '#ff0000';
        collapse_color = '#ff0000';
        break;
      case _BIG.P:
      case _BIG.PBP:
      case _BIG.PPP:
      case _BIG.PBPP:
        ctx_.strokeStyle = '#0000ff';
        collapse_color = '#0000ff';
        break;
    }
    ;
    ctx_.stroke();

    switch (result_) {
      case _BIG.BBP:
      case _BIG.BBPP:
      case _BIG.PBP:
      case _BIG.PBPP:
      case _BIG.TBP:
      case _BIG.TBPP:
        ctx_.lineWidth = 1;
        ctx_.beginPath();
        ctx_.arc(x1, y1, sr, 0, 2 * Math.PI);
        ctx_.fillStyle = '#ff0000';
        ctx_.fill();
        ctx_.strokeStyle = '#ffffff';
        ctx_.stroke();
        break;
    }
    ;

    switch (result_) {
      case _BIG.BPP:
      case _BIG.BBPP:
      case _BIG.PPP:
      case _BIG.PBPP:
      case _BIG.TPP:
      case _BIG.TBPP:
        ctx_.lineWidth = 1;
        ctx_.beginPath();
        ctx_.arc(x2, y2, sr, 0, 2 * Math.PI);
        ctx_.fillStyle = '#0000ff';
        ctx_.fill();
        ctx_.strokeStyle = '#ffffff';
        ctx_.stroke();
        break;
    }
    ;

    if ((r_ + 1) === r2_) {
      if ((e_ !== 0) || (t_ !== 0)) {
        var ts = ctx_.measureText((e_ === 0 ? t_ : e_)),
          tx = x_ + Math.floor($div(s_ - ts.width, 2)),
          ty = y_ + s_ - Math.floor(f);

        if (e_ !== 0) {
          ctx_.fillStyle = collapse_color;
        } else if (t_ !== 0) {
          ctx_.fillStyle = '#00bb00';
        }
        ;
        ctx_.fillText((e_ === 0 ? t_ : e_), tx, ty);
      }
      ;
    } else {
      if (t_ !== 0) {
        var ts = ctx_.measureText(t_),
          tx = x_ + Math.floor($div(s_ - ts.width, 2)),
          ty = y_ + s_ - Math.floor(f);

        ctx_.fillStyle = '#00bb00';
        ctx_.fillText(t_, tx, ty);
      }
      ;
    }
    ;
  };

  var _eye_draw = function (ctx_, roadmap_) {
    var road = roadmap_.road(),
      r_last = roadmap_.row(),
      c_last = roadmap_.col(),
      i = 0,
      flash;

    _grid2(ctx_, _info.x_eye, _info.y_eye, _info.r_eye, _info.c_eye, _info.s_eye);

    if ((r_last === 0) && (c_last === 0)) return;

    var half = $div(_info.s_eye, 2),
      radius = $sub(half, $div(_info.b_eye, 2)),
      x = $add(_info.x_eye, _border),
      y = 0,
      i = 0;

    ctx_.lineWidth = _info.b_eye;
    for (var c = 0; c < _info.c_eye; c++) {
      y = $add(_info.y_eye, _border);
      for (var r = 0; r < _info.r_eye; r++) {
        i = road[r][c];
        if ((typeof(i) !== 'undefined') && (i !== _EYE.UNDEFINED)) {
          _eye_print(ctx_, i, $add(x, half), $add(y, half), radius);
          if ((r === r_last - 1) && (c === c_last - 1)) {
            _flash_eye = ctx_.getImageData(x, y, _info.s_eye, _info.s_eye);
            _flash_eye.x = x;
            _flash_eye.y = y;
          }
          ;
        }
        ;
        y = $add(y, $add(_info.s_eye, _border));
      }
      ;
      x = $add(x, $add(_info.s_eye, _border));
    }
    ;
  };

  var _eye_print = function (ctx_, result_, x_, y_, r_) {
    ctx_.beginPath();
    ctx_.arc(x_, y_, r_, 0, 2 * Math.PI);
    switch (result_) {
      case _EYE.B:
        ctx_.strokeStyle = '#ff0000';
        break;
      case _EYE.P:
        ctx_.strokeStyle = '#0000ff';
        break;
    }
    ;
    ctx_.stroke();
  };

  var _small_draw = function (ctx_, roadmap_) {
    var road = roadmap_.road(),
      r_last = roadmap_.row(),
      c_last = roadmap_.col(),
      i = 0,
      flash;

    _grid2(ctx_, _info.x_small, _info.y_small, _info.r_small, _info.c_small, _info.s_small);

    if ((r_last === 0) && (c_last === 0)) return;

    var radius = $div(_info.s_small, 2),
      x = $add(_info.x_small, _border),
      y = 0, // $add($add(_info.y_small, radius), _border),
      i = 0;

    for (var c = 0; c < _info.c_small; c++) {
      y = $add(_info.y_small, _border);
      for (var r = 0; r < _info.r_small; r++) {
        i = road[r][c];
        if ((typeof(i) !== 'undefined') && (i !== _SMALL.UNDEFINED)) {
          _small_print(ctx_, i, $add(x, radius), $add(y, radius), radius);
          if ((r === r_last - 1) && (c === c_last - 1)) {
            _flash_small = ctx_.getImageData(x, y, _info.s_small, _info.s_small);
            _flash_small.x = x;
            _flash_small.y = y;
          }
          ;
        }
        ;
        y = $add(y, $add(_info.s_small, _border));
      }
      ;
      x = $add(x, $add(_info.s_small, _border));
    }
    ;
  };

  var _small_print = function (ctx_, result_, x_, y_, r_) {
    ctx_.beginPath();
    ctx_.arc(x_, y_, r_, 0, 2 * Math.PI);
    switch (result_) {
      case _SMALL.B:
        ctx_.fillStyle = '#ff0000';
        break;
      case _SMALL.P:
        ctx_.fillStyle = '#0000ff';
        break;
    }
    ;
    ctx_.fill();
  };

  var _bug_draw = function (ctx_, roadmap_) {
    var road = roadmap_.road(),
      r_last = roadmap_.row(),
      c_last = roadmap_.col(),
      i = 0,
      flash = 0;

    _grid2(ctx_, _info.x_bug, _info.y_bug, _info.r_bug, _info.c_bug, _info.s_bug);

    if ((r_last === 0) && (c_last === 0)) return;

    var x = $add(_info.x_bug, _border),
      y = 0, //$add(_info.y_bug, _border),
      i = 0;

    ctx_.lineWidth = _info.b_bug;
    for (var c = 0; c < _info.c_bug; c++) {
      y = $add(_info.y_bug, _border);
      for (var r = 0; r < _info.r_bug; r++) {
        i = road[r][c];
        if ((typeof(i) !== 'undefined') && (i !== _BIG.UNDEFINED)) {
          _bug_print(ctx_, i, x, y, _info.s_bug);
          if ((r === r_last - 1) && (c === c_last - 1)) {
            _flash_bug = ctx_.getImageData(x, y, _info.s_bug, _info.s_bug);
            _flash_bug.x = x;
            _flash_bug.y = y;
          }
          ;
        }
        ;
        y = $add(y, $add(_info.s_bug, _border));
      }
      ;
      x = $add(x, $add(_info.s_bug, _border));
    }
    ;
  };

  var _bug_print = function (ctx_, result_, x_, y_, s_) {
    ctx_.beginPath();
    ctx_.moveTo($add(x_, 1), $add(y_, s_));
    ctx_.lineTo($add(x_, s_), $add(y_, 1));
    switch (result_) {
      case _BUG.B:
        ctx_.strokeStyle = '#ff0000';
        break;
      case _BUG.P:
        ctx_.strokeStyle = '#0000ff';
        break;
    }
    ;
    ctx_.stroke();
  };

  var _destroy = function () {
    if (_flash_timer !== 0) {
      clearTimeout(_flash_timer);
      _flash_timer = 0;
    }
    ;
  };

  var _text_ = function (bkr_, plr_, tie_) {
    _bkr_text = bkr_;
    _plr_text = plr_;
    _tie_text = tie_;
  };

  return {
    destroy: _destroy,
    text: _text_,
    draw_big: _draw_big,
    draw_down: _draw_down,
    draw_eye: _draw_eye,
    draw_small: _draw_small,
    draw_bug: _draw_bug,
    draw_bead: _draw_bead
  };
};

/**
 ?�路
 */
var $ask = function () {
  var _BEAD = {
      UNDEFINED: 0,
      B: 1, P: 2, T: 3,
      BBP: 4, BPP: 5, BBPP: 6,
      PBP: 7, PPP: 8, PBPP: 9,
      TBP: 10, TPP: 11, TBPP: 12
    },
    _BIG = {
      UNDEFINED: 0,
      B: 1, P: 2, T: 3,
      BBP: 4, BPP: 5, BBPP: 6,
      PBP: 7, PPP: 8, PBPP: 9,
      TBP: 10, TPP: 11, TBPP: 12
    },
    _EYE = {UNDEFINED: 0, B: 1, P: 2},
    _SMALL = {UNDEFINED: 0, B: 1, P: 2},
    _BUG = {UNDEFINED: 0, B: 1, P: 2};

  var _result = 0,
    _canvas,
    _r_big = 0,
    _c_big = 0,
    _r_eye = 0,
    _c_eye = 0,
    _r_small = 0,
    _c_small = 0,
    _r_bug = 0,
    _c_bug = 0;

  var _b_top = 0,
    _b_left = 0,
    _s_cell = 0,
    _w_canvas = 0,
    _h_canvas = 0,
    _radius = 0,
    _w_line = 0;

  var _init = function (result_, canvas_, width_, height_, r_big_, c_big_, w_line_, spacing_) {
    _result = result_;
    _canvas = canvas_;
    _w_line = w_line_;
    _b_top = spacing_;
    _r_big = r_big_;
    _c_big = c_big_;
    _r_eye = r_big_;
    _c_eye = c_big_ * 2;
    _r_small = r_big_;
    _c_small = c_big_;
    _r_bug = r_big_;
    _c_bug = c_big_;

    _s_cell = Math.floor((height_ - _b_top * 4) / 3);
    _b_left = Math.floor((width_ - _s_cell) / 2);
    _w_canvas = width_ - _b_left * 2;
    _h_canvas = _s_cell * 3 + _b_top * 2;
    _radius = Math.floor(_s_cell / 2);

    return {
      width: _w_canvas,
      height: _h_canvas,
      left: _b_left,
      top: _b_top
    };
  };

  var _draw = function (bptp_) {
    var bptp = bptp_.concat([_result]),
      roadmap = $roadmap_algorithm(),
      ctx = _canvas.getContext('2d');

    var r_big = 0,
      c_big = 0,
      big = 0,
      r_eye = 0,
      c_eye = 0,
      eye = 0,
      r_small = 0,
      c_small = 0,
      small = 0,
      r_bug = 0,
      c_bug = 0,
      bug = 0;

    roadmap.bigroad(bptp);
    roadmap.eyeroad(roadmap.bigroad());
    roadmap.smallroad(roadmap.bigroad());
    roadmap.bugroad(roadmap.bigroad());

    roadmap.format(roadmap.bigroad(), _r_big, _c_big);
    r_big = roadmap.row();
    c_big = roadmap.col();
    if ((r_big !== 0) && (c_big !== 0)) big = roadmap.road()[r_big - 1][c_big - 1];
    roadmap.format(roadmap.eyeroad(), _r_eye, _c_eye);
    r_eye = roadmap.row();
    c_eye = roadmap.col();
    if ((r_eye !== 0) && (c_eye !== 0)) eye = roadmap.road()[r_eye - 1][c_eye - 1];
    roadmap.format(roadmap.smallroad(), _r_small, _c_small);
    r_small = roadmap.row();
    c_small = roadmap.col();
    if ((r_small !== 0) && (c_small !== 0)) small = roadmap.road()[r_small - 1][c_small - 1];
    roadmap.format(roadmap.bugroad(), _r_bug, _c_bug);
    r_bug = roadmap.row();
    c_bug = roadmap.col();
    if ((r_bug !== 0) && (c_bug !== 0)) bug = roadmap.road()[r_bug - 1][c_bug - 1];

    ctx.clearRect(0, 0, _w_canvas, _h_canvas);
    ctx.fillStyle = 'rgba(0,0,0,0)';
    ctx.fillRect(0, 0, _w_canvas, _h_canvas);
    ctx.lineWidth = _w_line;

    if (eye !== 0) {
      ctx.beginPath();
      ctx.arc(_radius, _radius, _radius - _w_line, 0, 2 * Math.PI);
      switch (eye) {
        case _EYE.B:
          ctx.strokeStyle = '#ff0000';
          break;
        case _EYE.P:
          ctx.strokeStyle = '#0000ff';
          break;
      }
      ;
      ctx.stroke();
    }
    ;

    if (small !== 0) {
      ctx.beginPath();
      ctx.arc(_radius, _s_cell + _b_top + _radius, _radius - _w_line, 0, 2 * Math.PI);
      switch (small) {
        case _SMALL.B:
          ctx.fillStyle = '#ff0000';
          break;
        case _SMALL.P:
          ctx.fillStyle = '#0000ff';
          break;
      }
      ;
      ctx.fill();
    }
    ;

    if (bug !== 0) {
      ctx.beginPath();
      ctx.moveTo(_s_cell - _w_line * 2, (_s_cell + _b_top) * 2 + _w_line * 2);
      ctx.lineTo(0 + _w_line, _h_canvas - _w_line);
      switch (bug) {
        case _BUG.B:
          ctx.strokeStyle = '#ff0000';
          break;
        case _BUG.P:
          ctx.strokeStyle = '#0000ff';
          break;
      }
      ;
      ctx.stroke();
    }
    ;
  };

  return {
    init: _init,
    draw: _draw
  };
};

/**
 ?�盤?�面大�?算�?
 */
var $bead_info = function (s_bead_, r_bead_, c_bead_min_, c_bead_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_bead: 0, h_bead: 0, r_bead: 0, c_bead: 0, x_bead: 0, y_bead: 0, s_bead: 0
    },
    border = 1,
    w_roadmap = 0,
    c_bead_max = (105 % r_bead_ === 0 ? 105 / r_bead_ : Math.floor(105 / r_bead_) + 1),
    c_bead_extra_max = 0,
    c_bead_extra = 0;

  info.s_bead = s_bead_ - border;
  info.r_bead = r_bead_;
  info.c_bead = c_bead_min_;
  info.h_bead = s_bead_ * info.r_bead;
  info.w_bead = s_bead_ * info.c_bead;
  info.y_bead = 0;
  info.x_bead = 0;
  c_bead_extra_max = c_bead_max_ - c_bead_min_;

  w_roadmap = info.w_bead + border;
  if (w_limit_ !== 0) {
    if (c_bead_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_bead_extra = Math.floor((w_limit_ - w_roadmap) / s_bead_);
        if (c_bead_extra > c_bead_extra_max) c_bead_extra = c_bead_extra_max;
        info.c_bead += c_bead_extra;
        info.w_bead = s_bead_ * info.c_bead;
        w_roadmap = info.w_bead + border;
      }
      ;
    }
    ;
  }
  ;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_bead + border;
  info.border = border;

  return info;
};

/**
 大路?�面大�?算�?
 */
var $big_info = function (s_big_, r_big_, c_big_min_, c_big_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_big: 0, h_big: 0, r_big: 0, c_big: 0, x_big: 0, y_big: 0, s_big: 0
    },
    border = 1,
    s_big = 0,
    w_roadmap = 0,
    c_big_extra_max = 0,
    c_big_extra = 0;

  s_big = s_big_;
  info.s_big = s_big - border;
  info.r_big = r_big_;
  info.c_big = c_big_min_;
  info.h_big = s_big * info.r_big;
  info.w_big = s_big * info.c_big;
  info.y_big = 0;
  info.x_big = 0;
  c_big_extra_max = c_big_max_ - c_big_min_;

  w_roadmap = info.w_big + border;
  if (w_limit_ !== 0) {
    if (c_big_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_big_extra = Math.floor((w_limit_ - w_roadmap) / s_big);
        if (c_big_extra > c_big_extra_max) c_big_extra = c_big_extra_max;
        info.c_big += c_big_extra;
        info.w_big = s_big * info.c_big;
        w_roadmap = info.w_big + border;
      }
      ;
    }
    ;
  }
  ;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_big + border;

  info.border = border;
  return info;
};

/**
 下�?路�??�大小�?�?
 */
var $down_info = function (s_eye_, r_eye_, c_eye_min_, c_eye_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_eye: 0, h_eye: 0, r_eye: 0, c_eye: 0, x_eye: 0, y_eye: 0, s_eye: 0,
      w_small: 0, h_small: 0, r_small: 0, c_small: 0, x_small: 0, y_small: 0, s_small: 0,
      w_bug: 0, h_bug: 0, r_bug: 0, c_bug: 0, x_bug: 0, y_bug: 0, s_bug: 0
    },
    border = 1,
    s_eye = 0,
    s_small = 0,
    s_bug = 0,
    w_roadmap = 0,
    c_eye_extra_max = 0,
    c_eye_extra = 0;

  s_eye = s_eye_;
  info.s_eye = s_eye - border;
  info.r_eye = r_eye_;
  info.c_eye = c_eye_min_;
  info.h_eye = s_eye * info.r_eye;
  info.w_eye = s_eye * info.c_eye;
  info.y_eye = 0;
  info.x_eye = 0;
  c_eye_extra_max = c_eye_max_ - c_eye_min_;

  w_roadmap = info.w_eye + border;
  if (w_limit_ !== 0) {
    if (c_eye_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_eye_extra = Math.floor((w_limit_ - w_roadmap) / s_eye);
        if (c_eye_extra > c_eye_extra_max) c_eye_extra = c_eye_extra_max;
        info.c_eye += c_eye_extra;
        info.w_eye = s_eye * info.c_eye;
        w_roadmap = info.w_eye + border;
      }
      ;
    }
    ;
  }
  ;

  s_small = s_eye;
  info.s_small = s_small - border;
  info.r_small = info.r_eye;
  info.c_small = Math.ceil(info.c_eye / 2);
  info.h_small = s_small * info.r_small;
  info.w_small = s_small * info.c_small;
  info.y_small = info.h_eye;
  info.x_small = 0;

  s_bug = s_eye;
  info.s_bug = s_bug - border;
  info.r_bug = info.r_eye;
  info.c_bug = info.c_small;
  info.h_bug = s_bug * info.r_bug;
  info.w_bug = s_bug * info.c_bug;
  info.y_bug = info.h_eye;
  info.x_bug = info.w_small;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_eye + info.h_small + border;

  info.border = border;

  return info;
};

/**
 大眼仔�??�大小�?�?
 */
var $eye_info = function (s_eye_, r_eye_, c_eye_min_, c_eye_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_eye: 0, h_eye: 0, r_eye: 0, c_eye: 0, x_eye: 0, y_eye: 0, s_eye: 0
    },
    border = 1,
    s_eye = 0,
    w_roadmap = 0,
    c_eye_extra_max = 0,
    c_eye_extra = 0;

  s_eye = s_eye_;
  info.s_eye = s_eye - border;
  info.r_eye = r_eye_;
  info.c_eye = c_eye_min_;
  info.h_eye = s_eye * info.r_eye;
  info.w_eye = s_eye * info.c_eye;
  info.y_eye = 0;
  info.x_eye = 0;
  c_eye_extra_max = c_eye_max_ - c_eye_min_;

  w_roadmap = info.w_eye + border;
  if (w_limit_ !== 0) {
    if (c_eye_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_eye_extra = Math.floor((w_limit_ - w_roadmap) / s_eye);
        if (c_eye_extra > c_eye_extra_max) c_eye_extra = c_eye_extra_max;
        info.c_eye += c_eye_extra;
        info.w_eye = s_eye * info.c_eye;
        w_roadmap = info.w_eye + border;
      }
      ;
    }
    ;
  }
  ;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_eye + border;

  info.border = border;

  return info;
};

/**
 小路?�面大�?算�?
 */
var $small_info = function (s_small_, r_small_, c_small_min_, c_small_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_small: 0, h_small: 0, r_small: 0, c_small: 0, x_small: 0, y_small: 0, s_small: 0
    },
    border = 1,
    s_small = 0,
    w_roadmap = 0,
    c_small_extra_max = 0,
    c_small_extra = 0;

  s_small = s_small_;
  info.s_small = s_small - border;
  info.r_small = r_small_;
  info.c_small = c_small_min_;
  info.h_small = s_small * info.r_small;
  info.w_small = s_small * info.c_small;
  info.y_small = 0;
  info.x_small = 0;
  c_small_extra_max = c_small_max_ - c_small_min_;

  w_roadmap = info.w_small + border;
  if (w_limit_ !== 0) {
    if (c_small_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_small_extra = Math.floor((w_limit_ - w_roadmap) / s_small);
        if (c_small_extra > c_small_extra_max) c_small_extra = c_small_extra_max;
        info.c_small += c_small_extra;
        info.c_small = (info.c_small % 2 === 1 ? info.c_small - 1 : info.c_small);
        info.w_small = s_small * info.c_small;
        w_roadmap = info.w_small + border;
      }
      ;
    }
    ;
  } else {
    if (info.c_small % 2 === 1) {
      info.c_small -= 1;
      info.w_small = s_small * info.c_small;
      w_roadmap = info.w_small + border;
    }
    ;
  }
  ;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_small + border;

  info.border = border;

  return info;
};

/**
 小強?�面大�?算�?
 */
var $bug_info = function (s_bug_, r_bug_, c_bug_min_, c_bug_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_bug: 0, h_bug: 0, r_bug: 0, c_bug: 0, x_bug: 0, y_bug: 0, s_bug: 0
    },
    border = 1,
    s_bug = 0,
    w_roadmap = 0,
    c_bug_extra_max = 0,
    c_bug_extra = 0;

  s_bug = s_bug_;
  info.s_bug = s_bug - border;
  info.r_bug = r_bug_;
  info.c_bug = c_bug_min_;
  info.h_bug = s_bug * info.r_bug;
  info.w_bug = s_bug * info.c_bug;
  info.y_bug = 0;
  info.x_bug = 0;
  c_bug_extra_max = c_bug_max_ - c_bug_min_;

  w_roadmap = info.w_bug + border;
  if (w_limit_ !== 0) {
    if (c_bug_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_bug_extra = Math.floor((w_limit_ - w_roadmap) / s_bug);
        if (c_bug_extra > c_bug_extra_max) c_bug_extra = c_bug_extra_max;
        info.c_bug += c_bug_extra;
        info.c_bug = (info.c_bug % 2 === 1 ? info.c_bug - 1 : info.c_bug);
        info.w_bug = s_bug * info.c_bug;
        w_roadmap = info.w_bug + border;
      }
      ;
    }
    ;
  } else {
    if (info.c_bug % 2 === 1) {
      info.c_bug -= 1;
      info.w_bug = s_bug * info.c_bug;
      w_roadmap = info.w_bug + border;
    }
    ;
  }
  ;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_bug + border;

  info.border = border;

  return info;
};


/**
 ?��??�路紙�??�大小�?�?
 */
var $road_info = function (s_big_, r_big_, c_big_min_, c_big_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_big: 0, h_big: 0, r_big: 0, c_big: 0, x_big: 0, y_big: 0, s_big: 0,
      w_eye: 0, h_eye: 0, r_eye: 0, c_eye: 0, x_eye: 0, y_eye: 0, s_eye: 0,
      w_small: 0, h_small: 0, r_small: 0, c_small: 0, x_small: 0, y_small: 0, s_small: 0,
      w_bug: 0, h_bug: 0, r_bug: 0, c_bug: 0, x_bug: 0, y_bug: 0, s_bug: 0
    },
    border = 1,
    s_big = 0,
    s_eye = 0,
    s_small = 0,
    s_bug = 0,
    w_roadmap = 0,
    c_big_extra_max = 0,
    c_big_extra = 0;

  s_big = s_big_;
  info.s_big = s_big - border;
  info.r_big = r_big_;
  info.c_big = c_big_min_;
  info.h_big = s_big * info.r_big;
  info.w_big = s_big * info.c_big;
  info.y_big = 0;
  info.x_big = 0;
  c_big_extra_max = c_big_max_ - c_big_min_;

  w_roadmap = info.w_big + border;
  if (w_limit_ !== 0) {
    if (c_big_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_big_extra = Math.floor((w_limit_ - w_roadmap) / s_big);
        if (c_big_extra > c_big_extra_max) c_big_extra = c_big_extra_max;
        info.c_big += c_big_extra;
        info.w_big = s_big * info.c_big;
        w_roadmap = info.w_big + border;
      }
      ;
    }
    ;
  }
  ;

  s_eye = Math.floor(s_big / 2);
  info.s_eye = s_eye - border;
  info.r_eye = info.r_big;
  info.c_eye = info.c_big * 2;
  info.h_eye = s_eye * info.r_eye;
  info.w_eye = s_eye * info.c_eye;
  info.y_eye = info.h_big;
  info.x_eye = 0;

  s_small = Math.floor(s_big / 2);
  info.s_small = s_small - border;
  info.r_small = info.r_big;
  info.c_small = info.c_big;
  info.h_small = s_small * info.r_small;
  info.w_small = s_small * info.c_small;
  info.y_small = info.h_big + info.h_eye;
  info.x_small = 0;

  s_bug = Math.floor(s_big / 2);
  info.s_bug = s_bug - border;
  info.r_bug = info.r_big;
  info.c_bug = info.c_big;
  info.h_bug = s_bug * info.r_bug;
  info.w_bug = s_bug * info.c_bug;
  info.y_bug = info.h_big + info.h_eye;
  info.x_bug = info.w_small;


  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_big + info.h_eye + info.h_small + border;

  info.border = border;
  return info;
};

/**
 ????�路紙�??�大小�?�?
 */
var $roadmap_info = function (s_bead_, r_bead_, c_bead_min_, c_bead_max_, c_big_min_, c_big_max_, w_limit_) {
  var info = {
      w_roadmap: 0, h_roadmap: 0,
      w_bead: 0, h_bead: 0, r_bead: 0, c_bead: 0, x_bead: 0, y_bead: 0, s_bead: 0,
      w_big: 0, h_big: 0, r_big: 0, c_big: 0, x_big: 0, y_big: 0, s_big: 0,
      w_eye: 0, h_eye: 0, r_eye: 0, c_eye: 0, x_eye: 0, y_eye: 0, s_eye: 0,
      w_small: 0, h_small: 0, r_small: 0, c_small: 0, x_small: 0, y_small: 0, s_small: 0,
      w_bug: 0, h_bug: 0, r_bug: 0, c_bug: 0, x_bug: 0, y_bug: 0, s_bug: 0
    },
    border = 1,
    s_big = 0,
    s_eye = 0,
    s_small = 0,
    s_bug = 0,
    w_roadmap = 0,
    c_bead_max = (105 % r_bead_ === 0 ? 105 / r_bead_ : Math.floor(105 / r_bead_) + 1),
    c_bead_extra_max = 0,
    c_big_extra_max = 0,
    c_bead_extra = 0,
    c_big_extra = 0;

  info.s_bead = s_bead_ - border;
  info.r_bead = r_bead_;
  info.c_bead = c_bead_min_;
  info.h_bead = s_bead_ * info.r_bead;
  info.w_bead = s_bead_ * info.c_bead;
  info.y_bead = 0;
  info.x_bead = 0;
  c_bead_extra_max = c_bead_max_ - c_bead_min_;

  s_big = Math.floor(s_bead_ / 2);
  info.s_big = s_big - border;
  info.r_big = info.r_bead;
  info.c_big = c_big_min_;
  info.h_big = s_big * info.r_big;
  info.w_big = s_big * info.c_big;
  info.y_big = 0;
  info.x_big = info.w_bead;
  c_big_extra_max = c_big_max_ - c_big_min_;

  w_roadmap = info.w_bead + info.w_big + border;
  if (w_limit_ !== 0) {
    if (c_big_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_big_extra = Math.floor((w_limit_ - w_roadmap) / s_big);
        if (c_big_extra > c_big_extra_max) c_big_extra = c_big_extra_max;
        info.c_big += c_big_extra;
        info.w_big = s_big * info.c_big;
        w_roadmap = info.w_bead + info.w_big + border;
      }
      ;
    }
    ;

    if (c_bead_extra_max > 0) {
      if (w_limit_ >= w_roadmap) {
        c_bead_extra = Math.floor((w_limit_ - w_roadmap) / s_bead_);
        if (c_bead_extra > c_bead_extra_max) c_bead_extra = c_bead_extra_max;
        info.c_bead += c_bead_extra;
        info.w_bead = s_bead_ * info.c_bead;
        w_roadmap = info.w_bead + info.w_big + border;
      }
      ;
    }
    ;
  }
  ;

  info.w_roadmap = w_roadmap;
  info.h_roadmap = info.h_bead + border;

  s_eye = Math.floor(s_big / 2);
  info.s_eye = s_eye - border;
  info.r_eye = info.r_big;
  info.c_eye = info.c_big * 2;
  info.h_eye = s_eye * info.r_eye;
  info.w_eye = s_eye * info.c_eye;
  info.y_eye = info.h_big;
  info.x_eye = info.w_bead;

  s_small = Math.floor(s_big / 2);
  info.s_small = s_small - border;
  info.r_small = info.r_big;
  info.c_small = info.c_big;
  info.h_small = s_small * info.r_small;
  info.w_small = s_small * info.c_small;
  info.y_small = info.h_big + info.h_eye;
  info.x_small = info.w_bead;

  s_bug = Math.floor(s_big / 2);
  info.s_bug = s_bug - border;
  info.r_bug = info.r_big;
  info.c_bug = info.c_big;
  info.h_bug = s_bug * info.r_bug;
  info.w_bug = s_bug * info.c_bug;
  info.y_bug = info.h_big + info.h_eye;
  info.x_bug = info.w_bead + info.w_small;

  return info;
};

/**
 路�??�陣算�?
 */
var $roadmap_algorithm = function () {
  var _bigroad,		//[105][105]
    _smallroad,	//[105][105]
    _eyeroad,		//[105][105]
    _bugroad;		//[105][105]

  var _tie,			//[105][105];
    _last_row, 	//Number
    _last_col, 	//Number
    _arr_road,	//[6][30];
    _arr_tie,	//[6][30];
    _collapse;			//[30];

  var RD_SAME = 1,
    RD_DIFF = 2;

  var _clear = function () {
    _tie = create_array(105, 105);	//[105][105];
    _bigroad = create_array(105, 105);	//[105][105];
    _smallroad = create_array(105, 105);	//[105][105];
    _eyeroad = create_array(105, 105);	//[105][105];
    _bugroad = create_array(105, 105);	//[105][105];
    _last_row = 0;
    _last_col = 0;
    _arr_road = create_array(6, 60);	//[6][60];
    _arr_tie = create_array(6, 60); //[6][60];
    _collapse = create_array(60);	//[60];
  };

  var _big = function (data_) {
    if (typeof(data_) === 'undefined') return _bigroad;
    if (data_.length === 0) return _bigroad;

    var row = 0;
    var col = 0;
    var nFront_tie = 0;
    //special for tie at first
    if (data_ [0] == 3 || data_ [0] == 10 ||
      data_ [0] == 11 || data_ [0] == 12) {
      _tie [0][0]++;
      nFront_tie++;
      _bigroad [0][0] = 0;
    }
    else
      _bigroad [0][0] = data_ [0];
    for (var i = 1; i < 105; i++) {
      switch (data_ [i]) {
        //banker win
        case 1 :
        case 4 : //banker pair
        case 5 : //player pair
        case 6 : //two pair

        {
          var n_tie = _tie [row][col];

          if (_bigroad [0][0] == 0) {
            _bigroad [0][0] = data_ [i];
            break;
          }
          //There is tie before _this.one
          if (n_tie != 0 && nFront_tie == 0) {
            if (data_ [i - n_tie - 1] == 1 ||
              (data_ [i - n_tie - 1] <= 6 && data_ [i - n_tie - 1] >= 4))
              row++;
            else {
              col++;
              row = 0;
            }
          }
          else {
            if (data_ [i - n_tie + nFront_tie - 1] == 1 ||
              (data_ [i - n_tie + nFront_tie - 1] <= 6 && data_ [i - n_tie + nFront_tie - 1] >= 4))
              row++;
            else {
              col++;
              row = 0;
            }
            if (nFront_tie != 0)
              nFront_tie = 0;
          }
          _bigroad [row][col] = data_ [i];

        }
          break;
        //player win
        case 2 :
        case 7 :
        case 8 :
        case 9 : {
          var n_tie = _tie [row][col];
          if (_bigroad [0][0] == 0) {
            _bigroad [0][0] = data_ [i];
            break;
          }
          if (n_tie != 0 && nFront_tie == 0) {
            if (data_ [i - n_tie - 1] == 2 ||
              (data_ [i - n_tie - 1] <= 9 && data_ [i - n_tie - 1] >= 7))
              row++;
            else {
              col++;
              row = 0;
            }
          }
          else {
            if (data_ [i - n_tie + nFront_tie - 1] == 2 ||
              (data_ [i - n_tie + nFront_tie - 1] <= 9 && data_ [i - n_tie + nFront_tie - 1] >= 7))
              row++;
            else {
              col++;
              row = 0;
            }
            if (nFront_tie != 0)
              nFront_tie = 0;
          }
          _bigroad [row][col] = data_ [i];
        }
          break;
        case 3 :
        case 10 :
        case 11 :
        case 12 : {
          if (_bigroad [0][0] == 0)
            nFront_tie++;
          _tie [row][col]++;
        }
          break;
        default :
          return;
      }
    }
  };

  var _eye = function (bigroad_) {
    if (typeof(bigroad_) === 'undefined') return _eyeroad;

    if (bigroad_ [0][0] == 0)
      return;
    //var  nSRoad[105];
    //memset ( nSRoad, 0x00, sizeof ( nSRoad ) );
    var nSRoad = create_array(105);
    var lastrow = 1;
    var count = 0;
    //game
    for (var i = 1; i < 105; i++) //col

    {
      for (var j = 0; j < 105; j++) //row

      {
        if (bigroad_ [j][i] == 0)
          break;
        if (bigroad_ [0][1] == 0 ||
          (bigroad_ [1][1] == 0 && bigroad_ [0][2] == 0))
          return;
        if (i == 1 && j == 0)
          continue;
        if (j == 0) {
          if (bpt(bigroad_ [lastrow][i - 2])
            != bpt(bigroad_ [lastrow - 1][i - 2])) {
            nSRoad [count] = RD_SAME;
            lastrow = 1;
            count++;
          }
          else {
            nSRoad [count] = RD_DIFF;
            lastrow = 1;
            count++;
          }
        }
        else {
          if (bpt(bigroad_ [j][i - 1]) != bpt(bigroad_ [j - 1][i - 1])) {
            nSRoad [count] = RD_DIFF;
            count++;
            lastrow = j + 1;
          }
          else {
            nSRoad [count] = RD_SAME;
            count++;
            lastrow = j + 1;
          }
        }
      }
    }
    var row = 0;
    var col = 0;
    if (nSRoad [0] == 0)
      return;
    else
      _eyeroad [0][0] = nSRoad [0];
    for (i = 1; i < 105; i++) {
      if (nSRoad [i] == 0)
        break;
      if (nSRoad [i] != nSRoad [i - 1]) {
        col++;
        row = 0;
      }
      else
        row++;
      _eyeroad [row][col] = nSRoad [i];
    }
  };

  var _small = function (bigroad_) {
    if (typeof(bigroad_) === 'undefined') return _smallroad;

    if (bigroad_ [0][0] == 0 || bigroad_ [0][1] == 0 || bigroad_ [0][2] == 0)
      return;
    var nSRoad = create_array(105);
    var lastrow = 1;
    var count = 0;
    //game
    for (var i = 2; i < 105; i++) //col

    {
      for (var j = 0; j < 105; j++) //row

      {
        if (bigroad_ [j][i] == 0)
          break;
        if (bigroad_ [1][2] == 0 && bigroad_ [0][3] == 0)
          return;
        if (i == 2 && j == 0)
          continue;
        if (j == 0) {
          if (bpt(bigroad_ [lastrow][i - 3])
            != bpt(bigroad_ [lastrow - 1][i - 3])) {
            nSRoad [count] = RD_SAME;
            lastrow = 1;
            count++;
          }
          else {
            nSRoad [count] = RD_DIFF;
            lastrow = 1;
            count++;
          }
        }
        else {
          if (bpt(bigroad_ [j][i - 2]) != bpt(bigroad_ [j - 1][i - 2])) {
            nSRoad [count] = RD_DIFF;
            count++;
            lastrow = j + 1;
          }
          else {
            nSRoad [count] = RD_SAME;
            count++;
            lastrow = j + 1;
          }
        }
      }
    }
    var row = 0;
    var col = 0;
    if (nSRoad [0] == 0)
      return;
    else
      _smallroad [0][0] = nSRoad [0];
    for (i = 1; i < 105; i++) {
      if (nSRoad [i] == 0)
        break;
      if (nSRoad [i] != nSRoad [i - 1]) {
        col++;
        row = 0;
      }
      else
        row++;
      _smallroad [row][col] = nSRoad [i];
    }
  };

  var _bug = function (bigroad_) {
    if (typeof(bigroad_) === 'undefined') return _bugroad;

    if (bigroad_ [0][0] == 0 || bigroad_ [0][1] == 0
      || bigroad_ [0][2] == 0 || bigroad_ [0][3] == 0)
      return;
    var nSRoad = create_array(105);
    var lastrow = 1;
    var count = 0;
    //game
    for (var i = 3; i < 105; i++) //col
    {
      for (var j = 0; j < 105; j++) //row
      {
        if (bigroad_ [j][i] == 0)
          break;
        if (bigroad_ [1][3] == 0 && bigroad_ [0][4] == 0)
          return;
        if (i == 3 && j == 0)
          continue;
        if (j == 0) {
          if (bpt(bigroad_ [lastrow][i - 4])
            != bpt(bigroad_ [lastrow - 1][i - 4])) {
            nSRoad [count] = RD_SAME;
            lastrow = 1;
            count++;
          }
          else {
            nSRoad [count] = RD_DIFF;
            lastrow = 1;
            count++;
          }
        }
        else {
          if (bpt(bigroad_ [j][i - 3]) != bpt(bigroad_ [j - 1][i - 3])) {
            nSRoad [count] = RD_DIFF;
            count++;
            lastrow = j + 1;
          }
          else {
            nSRoad [count] = RD_SAME;
            count++;
            lastrow = j + 1;
          }
        }
      }
    }
    var row = 0;
    var col = 0;
    if (nSRoad [0] == 0)
      return;
    else
      _bugroad [0][0] = nSRoad [0];
    for (i = 1; i < 105; i++) {
      if (nSRoad [i] == 0)
        break;
      if (nSRoad [i] != nSRoad [i - 1]) {
        col++;
        row = 0;
      }
      else
        row++;
      _bugroad [row][col] = nSRoad [i];
    }
  };

  var _format = function (nRoad, row, col) {
    _last_row = 0;
    _last_col = 0;
    //memset (_arr_road, 0x00, sizeof (_arr_road ));
    //memset (_arr_tie, 0x00, sizeof (_arr_tie ));
    //memset (_collapse, 0x00, sizeof (_collapse ));
    _arr_road = create_array(row, col);
    _arr_tie = create_array(row, col);
    _collapse = create_array(col);

    for (var i = 0; i < 105; i++) // col
    {
      var bLeft = false; //left corner
      var bCollapse = false;//the sixth row
      var bRow5 = false;//the fifth row
      var bRight = false;//must turn right
      var nMoveCol = 0; //the number of left move

      // display tie in first record
      if (nRoad[0][i] == 0) {
        if (_tie[0][i] != 0 && i == 0)
          _arr_tie [0][i] = _tie[0][i];
        else
          break;
      }

      if (i >= col) {
        nMoveCol = i - col + 1;
        if ((bpt(_arr_road[(row - 1)][0]) == bpt(_arr_road[(row - 1)][1]))
          && _arr_road[(row - 1)][0] != 0) {
          var tempRoad = create_array(105, 105);

          for (var k = 0; k < (105 - nMoveCol); k++) {
            if (nRoad[0][nMoveCol + k] == 0)
              break;
            for (var l = 0; l < 105; l++) {
              if (nRoad[l][k + nMoveCol] == 0)
                break;
              if (k == 104 - nMoveCol) {
                tempRoad[l][k] = 0;
                _tie[l][k] = 0;
                break;
              }
              tempRoad[l][k] = nRoad[l][k + nMoveCol];
              _tie[l][k] = _tie[l][k + nMoveCol];
            }
          }
          _format(tempRoad, row, col);
          break;
        }
        for (var m = 0; m < col; m++) //col
        {
          for (var n = 0; n < row; n++)//row
          {
            if (m == col - 1) {
              _arr_road[n][m] = 0;
              _arr_tie[n][m] = 0;
            }
            else {
              _arr_road[n][m] = _arr_road[n][m + 1];
              _arr_tie[n][m] = _arr_tie[n][m + 1];
            }
          }
          if (m == col - 1)
            _collapse[m] = 0;
          else
            _collapse[m] = _collapse[m + 1];
        }
      }

      for (var j = 0; j < 105; j++) //row
      {
        if (nRoad[j][i] == 0)
          break;
        if (j < row - 2 && (i - nMoveCol) < col) //normal road
        {
          if (_tie[j][i] != 0)
            _arr_tie[j][i - nMoveCol] = _tie[j][i];
          _arr_road[j][i - nMoveCol] = nRoad[j][i];
          _last_row = j + 1;
          _last_col = i - nMoveCol + 1;
          continue;
        }
        else if (j == row - 2) //small L road
        {
          if (_arr_road[j][i - nMoveCol] != 0) {
            //find the last nonzero position in row 6
            //cut large L road
            var c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j);
            //find the last nonzero in row 5
            changeSmallRoad(nRoad, row, col, nMoveCol, c, i - nMoveCol);
            if (_tie[j][i] != 0)
              _arr_tie[j][i - nMoveCol] = _tie[j][i];
            _arr_road[j][i - nMoveCol] = nRoad[j][i];
            _last_row = j + 1;
            _last_col = i - nMoveCol + 1;
          }
          else {
            _arr_road[j][i - nMoveCol] = nRoad[j][i];
            _last_row = j + 1;
            _last_col = i - nMoveCol + 1;
            if (_tie[j][i] != 0)
              _arr_tie[j][i - nMoveCol] = _tie[j][i];
          }
        }
        else if (j == (row - 1) || bCollapse) //large L road && small L road
        {
          if (_arr_road[row - 1][i - nMoveCol] != 0) {
            //right most in row 5
            if (j == col - i - nMoveCol + (row - 2)) {
              if (bLeft) {
                for (var ch = 0; ch < (j - (row - 1)); ch++) {
                  _arr_road[(row - 2)][i - nMoveCol + ch + 1] = _arr_road[(row - 2)][i - nMoveCol - ch - 1];
                  _arr_road[(row - 2)][i - nMoveCol - ch - 1] = 0;
                  if (_arr_tie [(row - 2)][i - nMoveCol - ch - 1] != 0) {
                    _arr_tie[(row - 2)][i - nMoveCol + ch + 1] = _arr_tie[(row - 2)][i - nMoveCol - ch - 1];
                    _arr_tie[(row - 2)][i - nMoveCol - ch - 1] = 0;
                  }
                }
                bLeft = false;
              }
              bRight = true;

              //find the last nonzero position in row 6
              var c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j);
              changeSmallRoad(nRoad, row, col, nMoveCol, c, i - nMoveCol);
              _arr_road[(row - 1)][col - 1] = nRoad[j][i];
              _arr_tie[(row - 1)][col - 1] = _tie[j][i];
              _last_col = col;
              _last_row = row;
            }
            else if (j >= col - i - nMoveCol + (row - 1)) //right most in collapse
            {
              if (_collapse[i - nMoveCol] != 0) {
                if (_tie[j][i] != 0)
                  _arr_tie[(row - 1)][i - nMoveCol] = _tie[j][i];
                _collapse[i - nMoveCol] = _collapse[i - nMoveCol] + 1;
                var display = nRoad[j][i];
                _last_row = row;
                _last_col = i - nMoveCol + 1;
                _arr_road[(row - 1)][i - nMoveCol] =
                  displayNum(_arr_road[(row - 1)][i - nMoveCol], display);
              }
              else {
                var c = 0;
                var display = 0;
                var tie = 0;
                c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j);
                tie = _arr_tie[(row - 1)][c] + _tie[j][i];
                display = displayNum(nRoad[j][i], _arr_road[(row - 1)][c]);
                _arr_road[(row - 1)][i - nMoveCol] = display;
                _last_row = row;
                _last_col = i - nMoveCol + 1;
                _collapse[i - nMoveCol] = _collapse[c] + 1;
                _arr_tie[(row - 1)][i - nMoveCol] = tie;
              }
            }
            else {
              //turn right
              if ((i - nMoveCol + (row - 2) - j) < 0 || _arr_road[(row - 2)][i - nMoveCol + (row - 2) - j] != 0 || (bCollapse && bRight)) //most left
              {
                if (bLeft) {
                  for (var ch = 0; ch < (j - (row - 1)); ch++) {
                    _arr_road[(row - 2)][i - nMoveCol + ch + 1] = _arr_road[(row - 2)][i - nMoveCol - ch - 1];
                    _arr_road[(row - 2)][i - nMoveCol - ch - 1] = 0;
                    if (_arr_tie [(row - 2)][i - nMoveCol - ch - 1] != 0) {
                      _arr_tie[(row - 2)][i - nMoveCol + ch + 1] = _arr_tie[(row - 2)][i - nMoveCol - ch - 1];
                      _arr_tie[(row - 2)][i - nMoveCol - ch - 1] = 0;
                    }
                  }
                  bLeft = false;
                }
                _arr_road[(row - 2)][i - nMoveCol + j - (row - 2)] = nRoad[j][i];
                _last_row = (row - 1);
                _last_col = i - nMoveCol + j - (row - 3);
                if (_tie[j][i] != 0)
                  _arr_tie[(row - 2)][i - nMoveCol + j - (row - 2)] = _tie[j][i];
                bRight = true;
                ////
                bCollapse = true;
              }
              else //turn left
              {
                bCollapse = true;
                bLeft = true;
                bRight = false;
                _arr_road[(row - 2)][i - nMoveCol + (row - 2) - j] = nRoad[j][i];
                _last_row = (row - 1);
                _last_col = i - nMoveCol + (row - 1) - j;
                if (_tie[j][i] != 0)
                  _arr_tie[(row - 2)][i - nMoveCol + (row - 2) - j] = _tie[j][i];
              }
            }
          }
          else {
            _arr_road[j][i - nMoveCol] = nRoad[j][i];
            _last_row = j + 1;
            _last_col = i - nMoveCol + 1;
            if (_tie[j][i] != 0)
              _arr_tie[j][i - nMoveCol] = _tie[j][i];
          }
        }
        else //if ( j >= row )
        {
          //turn right
          if ((i - nMoveCol + (row - 1) - j) < 0 || _arr_road[(row - 1)][i - nMoveCol + (row - 1) - j] != 0 || bRight) //most left
          {
            if (j >= col - i - nMoveCol + (row - 1)) //right most in collapse
            {
              bCollapse = true;
              if (_collapse[i - nMoveCol] != 0) {
                if (_tie[j][i] != 0)
                  _arr_tie[(row - 1)][i - nMoveCol] = _tie[j][i];
                _collapse[i - nMoveCol] = _collapse[i - nMoveCol] + 1;
              }
              else if (!bLeft) {
                var c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j);
                var tie = _arr_tie[(row - 1)][c] + _tie[j][i];
                var display = displayNum(nRoad[j][i], _arr_road[(row - 1)][c]);
                _arr_road[(row - 1)][c] = display;
                _collapse[c] = _collapse[c] + 1;
                _arr_tie[(row - 1)][c] = tie;
              }
              else {

                var c = col;
                var count = 0;
                var bFind = false;
                var tie = 0;
                var display = 0;
                while (1) // cut large left L road
                {
                  c--;
                  if (c == 0) {
                    count++;
                    display = displayNum(_arr_road[(row - 1)][c], display);
                    if (_tie[j][i] != 0)
                      tie = tie + _tie[j][i];
                    display = displayNum(nRoad[j][i], display);
                    _arr_road[(row - 1)][c] = 0;
                    if (_arr_tie[(row - 1)][c] != 0) {
                      tie = _arr_tie[(row - 1)][c];
                      _arr_tie[(row - 1)][c] = 0;
                    }
                    _collapse[i - nMoveCol] = count + row;
                    _last_row = row;
                    _last_col = i - nMoveCol + 1;
                    _arr_tie[(row - 1)][i - nMoveCol] = tie;
                    _arr_road[(row - 1)][i - nMoveCol] = display;
                    if (_arr_tie[row - 1][i - nMoveCol] == 0) {
                      for (var p = 0; p < row - 1; p++)
                        _arr_tie[row - 1][i - nMoveCol] += _arr_tie[p][i - nMoveCol];
                    }
                    break;
                  }

                  if (c == i - nMoveCol + row - j) {
                    //070307
                    //special for display banker pair and player pair
                    if (display == 0)
                      display = _arr_road[(row - 1)][c];
                    else
                      display = displayNum(_arr_road[(row - 1)][c], display);

                    count++;
                    if (display == 0)
                      display = nRoad[j][i];
                    else
                      display = displayNum(_arr_road[(row - 1)][c], display);
                    _arr_road[(row - 1)][c] = 0;
                    if (_arr_tie[(row - 1)][c] != 0) {
                      tie = _arr_tie[(row - 1)][c];
                      _arr_tie[(row - 1)][c] = 0;
                    }
                    _collapse[i - nMoveCol] = count + row;
                    _arr_tie[row - 1][i - nMoveCol] = tie;
                    _last_row = row;
                    _last_col = i - nMoveCol + 1;
                    _arr_road[row - 1][i - nMoveCol] = display;
                    if (_arr_tie[row - 1][i - nMoveCol] == 0) {
                      for (var p = 0; p < row - 1; p++)
                        _arr_tie[row - 1][i - nMoveCol] += _arr_tie[p][i - nMoveCol];
                    }
                    break;
                  }

                  if (bpt(_arr_road[(row - 1)][c]) != bpt(_arr_road[(row - 1)][c - 1])) {
                    if (i - nMoveCol == col - 1) {
                      count++;
                      if (_arr_road[(row - 2)][c - 1] != 0 && c > 1 &&
                        bpt(_arr_road[(row - 2)][c - 1]) != bpt(_arr_road[(row - 2)][c]) &&
                        bpt(_arr_road[(row - 2)][c - 2]) != bpt(_arr_road[(row - 2)][c - 1])) {
                        var x = 0;
                        if (c - 1 == i - nMoveCol) {
                          while (nRoad[x][c - 1] != 0)
                            x++;
                        }

                        if (x == count + row) {
                          _arr_road[(row - 1)][c] = 0;
                          if (_arr_tie[(row - 1)][c] != 0) {
                            tie = _arr_tie[(row - 1)][c];
                            _arr_tie[(row - 1)][c] = 0;
                          }
                          c--;
                          //special for display banker pair and player pair
                          if (display == 0)
                            display = _arr_road[(row - 1)][c];
                          else
                            display = displayNum(_arr_road[(row - 1)][c], display);
                          break;
                        }
                      }
                      else {
                        var x = 0;
                        if (c - 1 == i - nMoveCol) {
                          while (nRoad[x][c - 1] != 0)
                            x++;
                        }

                        if (x == count + row) {
                          _arr_road[(row - 1)][c] = 0;
                          if (_arr_tie[(row - 1)][c] != 0) {
                            tie = _arr_tie[(row - 1)][c];
                            _arr_tie[(row - 1)][c] = 0;
                          }
                          c--;
                          //special for display banker pair and player pair
                          if (display == 0)
                            display = _arr_road[(row - 1)][c];
                          else
                            display = displayNum(_arr_road[(row - 1)][c], display);
                          break;
                        }
                      }
                      //special for display banker pair and player pair
                      if (display == 0)
                        display = _arr_road[(row - 1)][c];
                      else
                        display = displayNum(_arr_road[(row - 1)][c], display);
                      _arr_road[(row - 1)][c] = 0;
                      if (_arr_tie[(row - 1)][c] != 0) {
                        tie = _arr_tie[(row - 1)][c];
                        _arr_tie[(row - 1)][c] = 0;
                      }
                      _collapse[i - nMoveCol] = count + row;
                      _arr_tie[(row - 1)][i - nMoveCol] = tie;
                      _last_row = row;
                      _last_col = i - nMoveCol + 1;
                      _arr_road[(row - 1)][i - nMoveCol] = display;
                      break;
                    }
                    else {
                      if (bFind) {
                        count++;
                        break;
                      }
                      bFind = true;
                    }
                  }
                  else {
                    if (i - nMoveCol == col - 1) {
                      count++;
                      //special for display banker pair and player pair
                      if (display == 0)
                        display = _arr_road[(row - 1)][c];
                      else
                        display = displayNum(_arr_road[(row - 1)][c], display);

                      _arr_road[(row - 1)][c] = 0;
                      if (_arr_tie[(row - 1)][c] != 0) {
                        tie = _arr_tie[(row - 1)][c];
                        _arr_tie[(row - 1)][c] = 0;
                      }
                      if (_tie[j][i] != 0) {
                        tie = _tie[j][i];
                      }
                    }
                    else {
                      if (c == col - 1 && _arr_road[(row - 1)][c] != 0) {
                        bFind = true;
                        count++;
                      }
                      if (bFind) {
                        count++;
                        if (_arr_road[(row - 2)][c - 1] != 0 && c > 1 &&
                          bpt(_arr_road[(row - 2)][c - 1]) != bpt(_arr_road[(row - 2)][c]) &&
                          bpt(_arr_road[(row - 2)][c - 2]) != bpt(_arr_road[(row - 2)][c - 1])) {
                          var x = 0;
                          if (c - 1 == i - nMoveCol) {
                            while (nRoad[x][c - 1] != 0)
                              x++;
                          }

                          if (x == count + row) {
                            _arr_road[(row - 1)][c] = 0;
                            if (_arr_tie[(row - 1)][c] != 0) {
                              tie = _arr_tie[(row - 1)][c];
                              _arr_tie[(row - 1)][c] = 0;
                            }
                            c--;
                            //special for display banker pair and player pair
                            if (display == 0)
                              display = _arr_road[(row - 1)][c];
                            else
                              display = displayNum(_arr_road[(row - 1)][c], display);
                            break;
                          }
                        }
                        else {
                          var x = 0;
                          if (c - 1 == i - nMoveCol) {
                            while (nRoad[x][c - 1] != 0)
                              x++;
                          }
                          if (x == count + row) {
                            _arr_road[(row - 1)][c] = 0;
                            if (_arr_tie[(row - 1)][c] != 0) {
                              tie = _arr_tie[(row - 1)][c];
                              _arr_tie[(row - 1)][c] = 0;
                            }
                            c--;
                            //special for display banker pair and player pair
                            if (display == 0)
                              display = _arr_road[(row - 1)][c];
                            else
                              display = displayNum(_arr_road[(row - 1)][c], display);
                            break;
                          }
                        }
                        //special for display banker pair and player pair
                        if (display == 0)
                          display = _arr_road[(row - 1)][c];
                        else
                          display = displayNum(_arr_road[(row - 1)][c], display);
                        _arr_road[(row - 1)][c] = 0;
                        if (_arr_tie[(row - 1)][c] != 0) {
                          tie = _arr_tie[(row - 1)][c];
                          _arr_tie[(row - 1)][c] = 0;
                        }
                        if (_tie[j][i] != 0) {
                          tie = _tie[j][i];
                        }
                      }
                      else
                        continue;
                    }
                  }
                }

              }
            }
            else {
              if (bLeft) {
                for (var ch = 0; ch < (j - row); ch++) {
                  _arr_road[(row - 1)][i - nMoveCol + ch + 1] = _arr_road[(row - 1)][i - nMoveCol - ch - 1];
                  _arr_road[(row - 1)][i - nMoveCol - ch - 1] = 0;
                  if (_arr_tie[(row - 1)][i - nMoveCol - ch - 1] != 0) {
                    _arr_tie[(row - 1)][i - nMoveCol + ch + 1] = _arr_tie[(row - 1)][i - nMoveCol - ch - 1];
                    _arr_tie[(row - 1)][i - nMoveCol - ch - 1] = 0;
                  }
                }
                bLeft = false;
              }
              bRight = true;
              _arr_road[(row - 1)][i - nMoveCol + j - (row - 1)] = nRoad[j][i];
              _last_row = row;
              _last_col = i - nMoveCol + j - (row - 2);
              if (_tie[j][i] != 0)
                _arr_tie[(row - 1)][i - nMoveCol + j - (row - 1)] = _tie[j][i];
            }//end else
          }
          else //turn left
          {
            bLeft = true;
            bRight = false;
            _arr_road[(row - 1)][i - nMoveCol + (row - 1) - j] = nRoad[j][i];
            _last_row = row;
            _last_col = i - nMoveCol + row - j;
            if (_tie[j][i] != 0)
              _arr_tie[(row - 1)][i - nMoveCol + (row - 1) - j] = _tie[j][i];
          }//end else
        }
      }//end for
    }//end for
  };

  var displayNum = function (newRoad, oldRoad) {
    if (bpt(newRoad) == 2) {
      if ((oldRoad == 7 && newRoad == 8) ||
        (oldRoad == 8 && newRoad == 7) || oldRoad == 9)
        oldRoad = 9;
      else {
        if (newRoad != 2 && oldRoad != 9)
          oldRoad = newRoad;
      }
    }
    if (bpt(newRoad) == 1) {
      if ((oldRoad == 4 && newRoad == 5) ||
        (oldRoad == 5 && newRoad == 4) || oldRoad == 6)
        oldRoad = 6;
      else {
        if (newRoad != 1 && oldRoad != 6)
          oldRoad = newRoad;
      }
    }
    return oldRoad;
  };

  //check is banker win or player win
  var bpt = function (result_) {
    switch (result_) {
      case 1 :
      case 4 :
      case 5 :
      case 6 :
        return 1;
      case 2 :
      case 7 :
      case 8 :
      case 9 :
        return 2;
      default :
        return 3;
    }
  };

//movechange small road
  var changeSmallRoad = function (arrRoad, row, col, MoveCol, startCol, currentCol) // arrRoad:Array
  {
    var nCount = 0;
    var c = col - 1;
    var bFind = false;
    var nRoadCount = 0;
    while ((bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c - 1])
      && _arr_road[row - 2][c] == 0) ||
    (bpt(_arr_road[row - 2][c]) != bpt(_arr_road[row - 2][c - 1])))
      c--;
    while (c > startCol) {
      c--;
      if (bFind || _arr_road[row - 3][c + 1] != 0 &&
        bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1]) &&
        bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 3][c + 1])) {
        if (bFind) {
          _arr_road[row - 2][c + 1] = 0;
          _arr_tie[row - 2][c + 1] = 0;
        }
        else {
          nRoadCount = 0;
          while (arrRoad[nRoadCount][c + 1] != 0)
            nRoadCount++;
        }
        if ((nRoadCount == row + nCount) && (c != currentCol - 1)) {
          _arr_road[row - 1][c + 1] = _arr_road[row - 2][c];
          _arr_tie[row - 1][c + 1] = _arr_tie[row - 2][c];
          _arr_road[row - 2][c] = 0;
          _arr_tie[row - 2][c] = 0;
          bFind = false;
          c--;
          continue;
        }
        if ((nRoadCount > row + nCount) && (c != currentCol - 1)) {
          _arr_road[row - 1][c + 1] = _arr_road[row - 2][c];
          _arr_tie[row - 1][c + 1] = _arr_tie[row - 2][c];
          nRoadCount--;
          bFind = true;
          continue;
        }
      }
      if (_arr_road[row - 3][c] != 0 &&
        bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1]) &&
        bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 3][c])) {
        nCount++;
        _arr_road[row - 1][c] = _arr_road[row - 2][c + 1];
        _arr_tie[row - 1][c] = _arr_tie[row - 2][c + 1];
        _arr_road[row - 2][c + 1] = 0;
        _arr_tie[row - 2][c + 1] = 0;
        nRoadCount = 0;
        while (arrRoad[nRoadCount][c] != 0)
          nRoadCount++;
        if (nRoadCount == (nCount + row - 1) && c != currentCol) {
          c--;
          nCount = 0;
        }
        continue;
      }
      if (bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1])
        && _arr_road[row - 2][c + 1] != 0) {
        nCount++;
        _arr_road[row - 1][c] = _arr_road[row - 2][c + 1];
        _arr_tie[row - 1][c] = _arr_tie[row - 2][c + 1];
        _arr_road[row - 2][c + 1] = 0;
        _arr_tie[row - 2][c + 1] = 0;
      }
    }
  };

  var cutLargeRoad = function (arrRoad, row, col, nMoveCol, currentCol, currentRow) {
    var nCount = 0;
    var c = col - 1;
    var nRoadCount = 0;
    var display = 0;
    var tie = 0;
    var bNewestCol = false;
    var nRight = 0;

    while (((bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 1][c - 1])
      && _arr_road[row - 1][c] == 0) ||
      (bpt(_arr_road[row - 1][c]) != bpt(_arr_road[row - 1][c - 1])) &&
      currentCol != (col - 1))) {
      c--;
      if (c == 0)
        return 0;
    }

    if (currentCol == (col - 1)) {
      //special for display banker pair and player pair
      if (display == 0)
        display += _arr_road[row - 1][c];
      else
        display = displayNum(_arr_road[row - 1][c], display);
      if (_arr_tie[row - 1][c] != 0)
        tie = _arr_tie[row - 1][c];
      _arr_road[row - 1][c] = display;
      _arr_tie[row - 1][c] = tie;
      _collapse[c] = nCount + row;
      _last_row = row;
      _last_col = c + 1;
      if (_arr_tie[row - 1][c] == 0) {
        for (var p = 0; p < row - 1; p++)
          _arr_tie[row - 1][c] += _arr_tie[p][c];
      }
      return c;
    }
    if (currentRow > (row - 1) && c == (col - 1) && currentRow != (col - currentCol + (row - 2)))
      bNewestCol = true;
    else
      bNewestCol = false;
    while (c >= 1) {
      c--;
      if (_arr_road[row - 2][c] != 0 &&
        bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 1][c + 1]) &&
        bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 2][c])) {
        nCount++;

        if (bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1])
          == bpt(_arr_road[row - 3][c]) && nRight != 1)
          nRight = 1;
        //special for display banker pair and player pair
        if (display == 0)
          display = _arr_road[row - 1][c + 1];
        else
          display = displayNum(_arr_road[row - 1][c + 1], display);
        if (_arr_tie[row - 1][c + 1] != 0)
          tie = _arr_tie[row - 1][c + 1];
        _arr_road[row - 1][c + 1] = 0;
        _arr_tie[row - 1][c + 1] = 0;
        nRoadCount = 0;
        while (arrRoad[nRoadCount][c + nMoveCol] != 0 && _arr_road[0][c] != 0 &&
        ((c != currentCol) || bNewestCol))
          nRoadCount++;
        if (currentRow == row - 2 && nRight == 1 &&
          bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1])) {
          nRight = 2;
          continue;
        }
        if (nRoadCount == (nCount + row) || bNewestCol) {
          //special for display banker pair and player pair
          if (display == 0)
            display += _arr_road[row - 1][c];
          else
            display = displayNum(_arr_road[row - 1][c], display);
          if (_arr_tie[row - 1][c] != 0)
            tie = _arr_tie[row - 1][c];
          _arr_road[row - 1][c] = display;
          _arr_tie[row - 1][c] = tie;
          _collapse[c] = nCount + row;
          _last_row = row;
          _last_col = c + 1;
          if (_arr_tie[row - 1][c] == 0) {
            for (var p = 0; p < row - 1; p++)
              _arr_tie[row - 1][c] += _arr_tie[p][c];
          }
          return c;
        }
        else
          continue;
      }
      if (bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 1][c + 1])
        && _arr_road[row - 1][c + 1] != 0) {
        nCount++;
        //special for display banker pair and player pair
        if (display == 0)
          display = _arr_road[(row - 1)][c + 1];
        else
          display = displayNum(_arr_road[(row - 1)][c + 1], display);
        _arr_road[(row - 1)][c + 1] = 0;
        if (_arr_tie[(row - 1)][c + 1] != 0) {
          tie = _arr_tie[(row - 1)][c + 1];
          _arr_tie[(row - 1)][c + 1] = 0;
        }
      }
    }
    return 0;
  };

  var create_array = function (row, col) {
    var vAry = [];
    for (var i = 0; i < row; i++) {
      if (col != undefined) {
        var vItem = [];
        for (var k = 0; k < col; k++) {
          vItem [k] = 0;
        }
        vAry [i] = vItem;
      }
      else
        vAry [i] = 0;
    }
    return vAry;
  };

  _clear();

  return {
    clear: _clear,
    format: _format,
    bigroad: _big,
    smallroad: _small,
    eyeroad: _eye,
    bugroad: _bug,
    tie: function () {
      return _arr_tie;
    },
    road: function () {
      return _arr_road;
    },
    collapse: function () {
      return _collapse;
    },
    row: function () {
      return _last_row;
    },
    col: function () {
      return _last_col;
    }
  };
};

/**
 將bptp?��??��??��?字串轉為???
 */
var $bptp = function (bptp_) {
  var result = bptp_.trim(),
    bptp = [];

  if (result !== '') {
    bptp = result.split(';');
    for (var i = 0; i < bptp.length; i++) {
      bptp[i] = parseInt(bptp[i]);
    }
    ;
  }
  ;

  return bptp;
};

var $cookie = (function () {
  var __COOKIE_DEFAULT = {
      'cookie_jans_input_limit': 0,
      'cookie_jans_serialport': ''
    },
    __COOKIE_NAME = {},
    __cookie_expires = 5 * 365;

  for (var i in __COOKIE_DEFAULT) {
    var cookie_name = i.replace('cookie_jans_', '').toUpperCase();
    __COOKIE_NAME[cookie_name] = i;
  }
  ;

  var __main = function (name_, value_) {
    if (typeof(value_) === 'undefined') {
      if (typeof(__COOKIE_DEFAULT[name_]) === 'undefined') {
        return '';
      } else {
        if (document.cookie.length > 0) {
          var cookie_start = document.cookie.indexOf(name_ + '=');
          if (cookie_start === -1) {
            return __COOKIE_DEFAULT[name_].toString();
          } else {
            cookie_start = cookie_start + name_.length + 1;
            var cookie_end = document.cookie.indexOf(';', cookie_start);
            if (cookie_end === -1) {
              cookie_end = document.cookie.length;
            }
            ;
            return unescape(document.cookie.substring(cookie_start, cookie_end));
          }
          ;
        } else {
          return __COOKIE_DEFAULT[name_].toString();
        }
        ;
      }
      ;
    } else {
      var expires = new Date();
      expires.setDate(expires.getDate() + __cookie_expires);
      document.cookie = name_ + '=' + escape(value_) + ';expires=' + expires.toGMTString();
    }
    ;
  };

  __main.NAME = __COOKIE_NAME;
  return __main;
})();

/**
 ?��??��?�?
 */
var $money = function (money_, int_) {
  var money = money_.toString(),
    decimal,
    m = [];

  if (money === '0') return money;
  decimal = money.substr(money.length - 2);
  money = money.substr(0, money.length - 2);

  while (money.length > 3) {
    m.unshift(money.substr(money.length - 3));
    money = money.substr(0, money.length - 3);
  }
  ;

  if (m.length !== 0) {
    money = money + ',' + m.join(',');
  }
  ;

  if (!int_) {
    money = money + '.' + decimal;
  }
  ;

  return money;
};

/**
 ?��?�?
 */
var $log = (function () {
  var __main = function () {
    console.log.apply(null, arguments);
  };

  return __main;
})();

/**
 ajax�?
 */
var $ajax = (function () {
  var __main = function (uri_, json_, cb_) {
    $.ajax({
      type: 'POST',
      url: uri_,
      data: JSON.stringify(json_),
      contentType: 'application/json',
      success: function (data_, status_, xhr_) {
        if (cb_) {
          if (typeof(data_) === 'string') {
            cb_(undefined, JSON.parse(data_));
          } else {
            cb_(undefined, data_);
          }
          ;
        }
        ;
      },
      error: function (xhr_, status_, error_) {
        if (cb_) {
          cb_({
            status: status_,
            error: error_
          });
        }
        ;
      }
    });
  };

  return __main;
})();

var $viewport = function () {
  var _width = screen.width,
    _height = screen.height;

  if (screen.height > screen.width) {
    _height = _width / 16 * 9;
  }
  ;

  return {
    width: _width,
    height: _height
  };
};

var $space = function (space_) {
  var s = '';
  for (var i = 0; i < space_; i++) {
    s += '&nbsp;';
  }
  ;

  return s;
};

var $keycode_module = {};

$keycode_module[$KEYCODE_MODULE.CAMBODIA] = function (code_, callback_) {
  var _code = code_,
    _buf = '',
    _callback = callback_;

  var _KEYCODE = {
    _0: 48, _1: 49, _2: 50, _3: 51, _4: 52,
    _5: 53, _6: 54, _7: 55, _8: 56, _9: 57,
    _A: 65, _B: 65, _C: 65, _D: 65, _E: 65, _F: 65, _K: 75
  };

  var _OTHER_KEYCODE = {
    _enter: 13
  };

  var _keycode = [];
  for (var i in _KEYCODE) {
    _keycode.push(_KEYCODE[i]);
  }
  ;

  var _code = {};
  for (var i in _KEYCODE) {
    _code[_KEYCODE[i]] = i.replace('_', '');
  }
  ;

  var _regexp = /K5[1-3][0-9][0-3][0-9A-F]#/;

  var _closure = function (keycode_) {
    if (keycode_ === _OTHER_KEYCODE._enter) {
      _buf += '#';
    } else if (_keycode.indexOf(keycode_) !== -1) {
      _buf += _code[keycode_];
    } else {
      $log('E', _code, 'keycode', keycode_);
    }
    ;

    var re = _regexp.exec(_buf);
    if (Array.isArray(re)) {

      // filter out the shoe result if exist
      var match_result = re[0],
        match_log = _buf.substr(0, _buf.indexOf(match_result) + match_result.length).replace(/\r?\n|\r/g, '|');

      match_result = match_result.replace(/\r?\n|\r/g, '');
      _buf = _buf.substr(_buf.indexOf(match_result) + match_result.length + 1);
      $log('I', _code, 'regexp', match_log);

      // convert shoe result to protocal format
      var shoe_result = parseInt(match_result.substr(2, 1)),
        shoe_point = parseInt(match_result.substr(3, 1)),
        shoe_pair = parseInt(match_result.substr(4, 1)),
        shoe_checksum = match_result.substr(5, 1).toUpperCase(),
        game_checksum = (5 + shoe_result + shoe_point + shoe_checksum).toString(16),
        game_win = (shoe_result === 1 ? 'B' : (shoe_result === 2 ? 'P' : 'T')),
        game_banker_pair = (shoe_pair === 1 ? 1 : (shoe_pair === 3 ? 1 : 0)),
        game_player_pair = (shoe_pair === 2 ? 1 : (shoe_pair === 3 ? 1 : 0));

      game_checksum = game_checksum.substr(game_checksum.length - 1).toUpperCase();

      if (game_checksum !== shoe_checksum) {
        $log('E', _code, 'checksum', game_checksum, shoe_checksum);
        return;
      }
      ;

      _callback({
        code: _code,
        win: game_win,
        banker_pair: game_banker_pair,
        player_pair: game_player_pair
      });
    }
    ;
  };

  var _clear = function () {
    _buf = '';
  };

  _closure.code = _code;
  _closure.clear = _clear;
  return _closure;
};

$keycode_module[$KEYCODE_MODULE.NUMPAD] = function (code_, callback_) {
  var _code = code_,
    _buf = [],
    _callback = callback_;

  var _KEYCODE = {
    _numpad_0: 96,
    _numpad_1: 97,
    _numpad_2: 98,
    _numpad_3: 99,
    _numpad_4: 100,
    _numpad_5: 101,
    _numpad_6: 102,
    _numpad_7: 103,
    _numpad_8: 104,
    _numpad_9: 105,
    _numpad_dot: 110,
    _numlock_0: 45,
    _numlock_1: 35,
    _numlock_2: 40,
    _numlock_3: 34,
    _numlock_4: 37,
    _numlock_5: 12,
    _numlock_6: 39,
    _numlock_7: 36,
    _numlock_8: 38,
    _numlock_9: 33,
    _numlock_dot: 46,
    _slash: 111,
    _star: 106,
    _backspace: 8,
    _minus: 109
  };

  var _OTHER_KEYCODE = {
    _numlock: 144,
    _enter: 13,
    _left_shift: 16,
    _plus: 107
  };

  var _keycode = [];
  for (var i in _KEYCODE) {
    _keycode.push(_KEYCODE[i]);
  }
  ;

  var _format = function (buf_) {
    var game = {
      banker_pair: 0,
      player_pair: 0
    };
    for (var i = 0; i < buf_.length; i++) {
      switch (buf_[i]) {
        case 1:
          game.win = 'B';
          break;
        case 2:
          game.win = 'T';
          break;
        case 3:
          game.win = 'P';
          break;
        case 4:
          game.banker_pair = 1;
          break;
        case 5:
          game.banker_pair = 1;
          game.player_pair = 1;
          break;
        case 6:
          game.player_pair = 1;
          break;
      }
      ;
    }
    ;
    return game;
  };

  var _callback_by_name = function (name_) {
    $log('log', _name, name_);
    if (_callback) {
      _callback(_name, name_);
    }
    ;
    _buf = [];
  };

  var _closure = function (keycode_) {
    switch (keycode_) {
      case _OTHER_KEYCODE._plus:
        _callback({
          code: _code,
          reason: 'panel'
        });
        break;
      case _OTHER_KEYCODE._enter:
        if (_buf.length === 1) {
          switch (_buf[0]) {
            case _KEYCODE._numpad_8:
              _callback({
                code: _code,
                reason: 'delete_game'
              });
              _buf = [];
              return;
            case _KEYCODE._numpad_7: // new gameset
              _callback({
                code: _code,
                reason: 'gameset'
              });
              _buf = [];
              return;
            case _KEYCODE._minus: // delete last gameset
              _callback({
                code: _code,
                reason: 'delete_gameset'
              });
              _buf = [];
              return;
            case _KEYCODE._star: // numpad mode [*] + <enter> to exit
              _callback({
                code: _code,
                reason: 'exit'
              });
              _buf = [];
              return;
            case _KEYCODE._slash: // switch to table limit setting mode
              _callback({
                code: _code,
                reason: $KEYCODE_MODULE.SETTING,
                display: true
              });
              _buf = [];
              return;
            case _KEYCODE._numpad_0: // witch to history mode
              _callback({
                code: _code,
                reason: $KEYCODE_MODULE.HISTORY,
                display: true
              });
              _buf = [];
              return;
          }
          ;
        }
        ;

        // ?��?結�? + <enter>
        if (_buf.length > 0) {
          for (var i = 0; i < _buf.length; i++) {
            if ((_buf[i] >= 1) && (_buf[i] <= 3)) {
              _callback({
                code: _code,
                reason: 'status'
              });

              var game = _format(_buf);
              $log('I', 'game', game.win, (game.banker_pair ? 1 : 0), (game.player_pair ? 1 : 0));
              _callback({
                code: _code,
                reason: 'game',
                win: game.win,
                banker_pair: game.banker_pair,
                player_pair: game.player_pair
              });
              _buf = [];
              break;
            }
            ;
          }
          ;
        }
        ;
        break;
      case _KEYCODE._backspace:
        if (_buf.length > 0) {
          _buf.pop();

          var game = _format(_buf);
          _callback({
            code: _code,
            reason: 'icon',
            icon: 'bptp',
            win: game.win,
            banker_pair: game.banker_pair,
            player_pair: game.player_pair
          });
        }
        ;
        break;
      case _KEYCODE._numpad_9:
      case _KEYCODE._numlock_9:
        _callback({
          code: _code,
          reason: 'fullscreen'
        });
        break;
      case _KEYCODE._numpad_dot: // NUMPAD_DOT, show print roadmap icon
      case _KEYCODE._numlock_dot:
        _callback({
          code: _code,
          reason: 'print'
        });
        break;
      case _KEYCODE._numpad_8: // NUMPAD_8, show cancel last game icon
      case _KEYCODE._numlock_8:
        _buf = [_KEYCODE._numpad_8];
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'delete_game'
        });
        break;
      case _KEYCODE._numpad_7: // NUMPAD_7, show new gameset icon
      case _KEYCODE._numlock_7:
        _buf = [_KEYCODE._numpad_7];
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'gameset'
        });
        break;
      case _KEYCODE._slash: // NUMPAD_DIVIDE, show table limit setting icon
        _buf = [_KEYCODE._slash];
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'setting'
        });
        break;
      case _KEYCODE._star: // NUMPAD_MULTIPLY, show exit icon
        _buf = [_KEYCODE._star];
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'exit'
        });
        break;
      case _KEYCODE._minus: // NUMPAD_MINUS, show delete gameset icon
        _buf = [_KEYCODE._minus];
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'delete_gameset'
        });
        break;
      case _KEYCODE._numpad_0: // NUMPAD_0, show history icon
      case _KEYCODE._numlock_0:
        _buf = [_KEYCODE._numpad_0];
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'history'
        });
        break;
      case _KEYCODE._numpad_1:
      case _KEYCODE._numpad_2:
      case _KEYCODE._numpad_3:
      case _KEYCODE._numlock_1:
      case _KEYCODE._numlock_2:
      case _KEYCODE._numlock_3:
        var bpt = 0;
        switch (keycode_) {
          case _KEYCODE._numpad_1: // NUMPAD_1, banker
          case _KEYCODE._numlock_1:
            bpt = 1;
            break;
          case _KEYCODE._numpad_2: // NUMPAD_2, tie
          case _KEYCODE._numlock_2:
            bpt = 2;
            break;
          case _KEYCODE._numpad_3: // NUMPAD_3, player
          case _KEYCODE._numlock_3:
            bpt = 3;
            break;
        }
        ;

        var exist = false;
        for (var i = 0; i < _buf.length; i++) {
          if ((_buf[i] >= 1) && (_buf[i] <= 3)) {
            _buf[i] = bpt;
            exist = true;
            break;
          }
          ;
        }
        ;

        if (!exist) _buf.push(bpt);

        var game = _format(_buf);
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'bptp',
          win: game.win,
          banker_pair: game.banker_pair,
          player_pair: game.player_pair
        });
        break;
      case _KEYCODE._numpad_4:
      case _KEYCODE._numpad_5:
      case _KEYCODE._numpad_6:
      case _KEYCODE._numlock_4:
      case _KEYCODE._numlock_5:
      case _KEYCODE._numlock_6:
        var pair = 0;
        switch (keycode_) {
          case _KEYCODE._numpad_4: // NUMPAD_4, banker pair
          case _KEYCODE._numlock_4:
            pair = 4;
            break;
          case _KEYCODE._numpad_5: // NUMPAD_5, banker & player pair
          case _KEYCODE._numlock_5:
            pair = 5;
            break;
          case _KEYCODE._numpad_6: // NUMPAD_6, player pair
          case _KEYCODE._numlock_6:
            pair = 6;
            break;
        }
        ;

        var exist = false;
        for (var i = 0; i < _buf.length; i++) {
          if ((_buf[i] >= 4) && (_buf[i] <= 6)) {
            _buf[i] = pair;
            exist = true;
            break;
          }
          ;
        }
        ;

        if (!exist) _buf.push(pair);

        var game = _format(_buf);
        _callback({
          code: _code,
          reason: 'icon',
          icon: 'bptp',
          win: game.win,
          banker_pair: game.banker_pair,
          player_pair: game.player_pair
        });

        break;
    }
    ;
  };

  var _clear = function () {
    _buf = [];
  };

  _closure.keycode = function (keycode_) {
    return _keycode.indexOf(keycode_);
  };

  _closure.code = _code;
  _closure.clear = _clear;
  _closure.keycode = _keycode;

  return _closure;
};

$keycode_module[$KEYCODE_MODULE.SETTING] = function (code_, callback_) {
  var _code = code_,
    _buf = [],
    _callback = callback_;

  var _KEYCODE = {
    _numpad_0: 96,
    _numpad_1: 97,
    _numpad_2: 98,
    _numpad_3: 99,
    _numpad_4: 100,
    _numpad_5: 101,
    _numpad_6: 102,
    _numpad_7: 103,
    _numpad_8: 104,
    _numpad_9: 105,
    _numlock_0: 45,
    _numlock_1: 35,
    _numlock_2: 40,
    _numlock_3: 34,
    _numlock_4: 37,
    _numlock_5: 12,
    _numlock_6: 39,
    _numlock_7: 36,
    _numlock_8: 38,
    _numlock_9: 33
  };

  var _OTHER_KEYCODE = {
    _slash: 111,
    _backspace: 8,
    _enter: 13
  };

  var _closure = function (keycode_) {
    switch (keycode_) {
      case _OTHER_KEYCODE._enter:
        if (_buf.length > 0) {
          _callback({
            code: _code,
            exit: true,
            limit: parseInt(_buf.join(''))
          });
        } else {
          _callback({
            code: _code,
            exit: true
          });
        }
        ;
        _buf = [];
        break;
      case _OTHER_KEYCODE._backspace: // BACKSPACE:
        if (_buf.length > 0) {
          _buf.pop();
          if (_buf.length > 0) {
            _callback({
              code: _code,
              exit: false,
              limit: parseInt(_buf.join(''))
            });
          } else {
            _callback({
              code: _code,
              exit: false
            });
          }
          ;
        }
        ;
        break;
      case _OTHER_KEYCODE._slash: // switch to table limit setting mode
        if (($config.limit.length / $config.limit_page.per_page) > $config.limit_page.default_page) {
          $config.limit_page.default_page++;
        } else {
          $config.limit_page.default_page = 1;
        }
        _callback({
          code: _code,
          reason: $KEYCODE_MODULE.SETTING,
          display: true,
          change_page: $config.limit_page.default_page
        });
        _buf = [];
        console.log('@@_OTHER_KEYCODE._slash', _code);
        break;
      case _KEYCODE._numpad_0:
      case _KEYCODE._numpad_1:
      case _KEYCODE._numpad_2:
      case _KEYCODE._numpad_3:
      case _KEYCODE._numpad_4:
      case _KEYCODE._numpad_5:
      case _KEYCODE._numpad_6:
      case _KEYCODE._numpad_7:
      case _KEYCODE._numpad_8:
      case _KEYCODE._numpad_9:
      case _KEYCODE._numlock_0:
      case _KEYCODE._numlock_1:
      case _KEYCODE._numlock_2:
      case _KEYCODE._numlock_3:
      case _KEYCODE._numlock_4:
      case _KEYCODE._numlock_5:
      case _KEYCODE._numlock_6:
      case _KEYCODE._numlock_7:
      case _KEYCODE._numlock_8:
      case _KEYCODE._numlock_9:
        if (_buf.length > 1) {
          return;
        }
        ;

        var val;
        switch (keycode_) {
          case _KEYCODE._numpad_0:
          case _KEYCODE._numlock_0:
            val = 0;
            break;
          case _KEYCODE._numpad_1:
          case _KEYCODE._numlock_1:
            val = 1;
            break;
          case _KEYCODE._numpad_2:
          case _KEYCODE._numlock_2:
            val = 2;
            break;
          case _KEYCODE._numpad_3:
          case _KEYCODE._numlock_3:
            val = 3;
            break;
          case _KEYCODE._numpad_4:
          case _KEYCODE._numlock_4:
            val = 4;
            break;
          case _KEYCODE._numpad_5:
          case _KEYCODE._numlock_5:
            val = 5;
            break;
          case _KEYCODE._numpad_6:
          case _KEYCODE._numlock_6:
            val = 6;
            break;
          case _KEYCODE._numpad_7:
          case _KEYCODE._numlock_7:
            val = 7;
            break;
          case _KEYCODE._numpad_8:
          case _KEYCODE._numlock_8:
            val = 8;
            break;
          case _KEYCODE._numpad_9:
          case _KEYCODE._numlock_9:
            val = 9;
            break;
        }
        ;

        _buf.push(val);
        _callback({
          code: _code,
          exit: false,
          limit: parseInt(_buf.join(''))
        });

        break;
    }
    ;
  };

  var _clear = function () {
    _buf = [];
  };

  _closure.code = _code;
  _closure.clear = _clear;
  return _closure;
};

$keycode_module[$KEYCODE_MODULE.HISTORY] = function (code_, callback_) {
  var _code = code_,
    _buf = [],
    _callback = callback_;

  var _KEYCODE = {
    _numpad_0: 96,
    _numpad_1: 97,
    _numpad_2: 98,
    _numpad_3: 99,
    _numpad_4: 100,
    _numpad_5: 101,
    _numpad_6: 102,
    _numpad_7: 103,
    _numpad_8: 104,
    _numpad_9: 105,
    _numlock_0: 45,
    _numlock_1: 35,
    _numlock_2: 40,
    _numlock_3: 34,
    _numlock_4: 37,
    _numlock_5: 12,
    _numlock_6: 39,
    _numlock_7: 36,
    _numlock_8: 38,
    _numlock_9: 33
  };

  var _OTHER_KEYCODE = {
    _slash: 111,
    _backspace: 8,
    _enter: 13,
    _star: 106
  };

  var _closure = function (keycode_) {
    switch (keycode_) {
      case _KEYCODE._numpad_0:
      case _KEYCODE._numpad_1:
      case _KEYCODE._numpad_2:
      case _KEYCODE._numpad_3:
      case _KEYCODE._numpad_4:
      case _KEYCODE._numpad_5:
      case _KEYCODE._numpad_6:
      case _KEYCODE._numpad_7:
      case _KEYCODE._numpad_8:
      case _KEYCODE._numpad_9:
      case _KEYCODE._numlock_0:
      case _KEYCODE._numlock_1:
      case _KEYCODE._numlock_2:
      case _KEYCODE._numlock_3:
      case _KEYCODE._numlock_4:
      case _KEYCODE._numlock_5:
      case _KEYCODE._numlock_6:
      case _KEYCODE._numlock_7:
      case _KEYCODE._numlock_8:
      case _KEYCODE._numlock_9:
        var c, v;
        switch (keycode_) {
          case _KEYCODE._numpad_0:
          case _KEYCODE._numlock_0:
            c = '0';
            break;
          case _KEYCODE._numpad_1:
          case _KEYCODE._numlock_1:
            c = '1';
            break;
          case _KEYCODE._numpad_2:
          case _KEYCODE._numlock_2:
            c = '2';
            break;
          case _KEYCODE._numpad_3:
          case _KEYCODE._numlock_3:
            c = '3';
            break;
          case _KEYCODE._numpad_4:
          case _KEYCODE._numlock_4:
            c = '4';
            break;
          case _KEYCODE._numpad_5:
          case _KEYCODE._numlock_5:
            c = '5';
            break;
          case _KEYCODE._numpad_6:
          case _KEYCODE._numlock_6:
            c = '6';
            break;
          case _KEYCODE._numpad_7:
          case _KEYCODE._numlock_7:
            c = '7';
            break;
          case _KEYCODE._numpad_8:
          case _KEYCODE._numlock_8:
            c = '8';
            break;
          case _KEYCODE._numpad_9:
          case _KEYCODE._numlock_9:
            c = '9';
            break;
        }
        ;

        v = _buf.join('') + c;

        if (v.length === 1) {
          var i = parseInt(v);
          if (i !== 2) {
            break;
          }
          ;
        } else if (v.length === 2) {
          var i = parseInt(v);
          if (i !== 20) {
            break;
          }
          ;
        } else if (v.length === 3) {
          var i = parseInt(v);
          if ((i < 201) || (i > 202)) {
            break;
          }
          ;
        } else if (v.length === 4) {
          // check year
          var i = parseInt(v);
          if ((i < 2017) || (i > 2029)) {
            break;
          }
          ;
        } else if (v.length === 5) {
          // check month
          var i = parseInt(v.substr(4));
          if (i > 1) {
            break;
          }
          ;
        } else if (v.length === 6) {
          // check month
          var i = parseInt(v.substr(4));
          if ((i < 1) || (i > 12)) {
            break;
          }
          ;
        } else if (v.length === 7) {
          // check date
          var i = parseInt(v.substr(6));
          if (i > 3) {
            break;
          }
          ;
        } else if (v.length === 8) {
          // check date
          var i = parseInt(v.substr(6));
          if ((i < 1) || (i > 31)) {
            break;
          }
          ;
        } else if (v.length === 9) {
          // check shoe_of_day
          var i = parseInt(v.substr(8));
          if (i < 1) {
            break;
          }
          ;
        } else if (v.length === 10) {
          // check shoe_of_day
          var i = parseInt(v.substr(8));
          if ((i < 10) || (i > 99)) {
            break;
          }
          ;
        } else if (v.length === 11) {
          // check shoe_of_day
          var i = parseInt(v.substr(8));
          if ((i < 100) || (i > 999)) {
            break;
          }
          ;
        } else {
          return;
        }
        ;

        _buf.push(c);
        _callback({
          code: _code,
          exit: false,
          date: _buf.join('')
        });
        break;
      case _OTHER_KEYCODE._enter:
        var re = /^20[12][0-9][01][0-9][0123][0-9][1-9][0-9]?[0-9]?$/,
          v = _buf.join('');

        if (re.test(v)) {
          var yyyy = parseInt(v.substr(0, 4)),
            mm = parseInt(v.substr(4, 2)),
            dd = parseInt(v.substr(6, 2)),
            shoe_of_day = parseInt(v.substr(8)),
            d = new Date(yyyy, mm - 1, dd),
            r = d && (d.getMonth() + 1) == mm;

          if (r) {
            _callback({
              code: _code,
              exit: false,
              date: _buf.join(''),
              query: true
            });
          } else {
            _callback({
              code: _code,
              exit: false,
              date: 'Date ERR!'
            });
          }
          ;
        } else if (_buf.length === 0) {
          _callback({
            code: _code,
            exit: true,
            query: true
          });
        } else {
          _callback({
            code: _code,
            exit: false,
            date: 'Format ERR!'
          });
        }
        ;

        _buf = [];
        break;
      case _OTHER_KEYCODE._backspace: // BACKSPACE:
        if (_buf.length > 0) {
          _buf.pop();
          _callback({
            code: _code,
            exit: false,
            date: _buf.join('')
          });
        }
        ;
        break;
    }
    ;
  };

  var _clear = function () {
    _buf = [];
  };

  _closure.code = _code;
  _closure.clear = _clear;
  return _closure;
};

var $keycode = function (callback_) {
  var _callback = callback_,
    _modules = {},
    _module,
    _lock = false;

  var _KEYCODE = {
    _K: 75,
    _PLUS: 107
  };

  var _module_callback = function (args_) {
    switch (args_.code) {
      case $KEYCODE_MODULE.CAMBODIA:
        _callback(args_);
        return;
      case $KEYCODE_MODULE.NUMPAD:
        switch (args_.reason) {
          case 'panel':
            _callback(args_);
            break;
          case $KEYCODE_MODULE.SETTING:
            _module = _modules[$KEYCODE_MODULE.SETTING];
            if (_modules[$KEYCODE_MODULE.CAMBODIA]) _modules[$KEYCODE_MODULE.CAMBODIA].clear();
            _modules[$KEYCODE_MODULE.SETTING].clear();
            _callback(args_);
            break;
          case $KEYCODE_MODULE.HISTORY:
            _module = _modules[$KEYCODE_MODULE.HISTORY];
            if (_modules[$KEYCODE_MODULE.CAMBODIA]) _modules[$KEYCODE_MODULE.CAMBODIA].clear();
            _modules[$KEYCODE_MODULE.SETTING].clear();
            _callback(args_);
            break;
          default:
            _callback(args_);
            break;
        }
        ;
        return;
      case $KEYCODE_MODULE.SETTING:
        if (args_.exit) {
          _module = _modules[$KEYCODE_MODULE.NUMPAD];
        }
        ;
        _callback(args_);
        return;
      case $KEYCODE_MODULE.HISTORY:
        if (args_.exit) {
          _module = _modules[$KEYCODE_MODULE.NUMPAD];
        }
        ;
        _callback(args_);
        return;
    }
    ;
  };

  if ($config.model.cambodia) {
    _modules[$KEYCODE_MODULE.CAMBODIA] = $keycode_module[$KEYCODE_MODULE.CAMBODIA]($KEYCODE_MODULE.CAMBODIA, _module_callback);
  }
  ;
  _modules[$KEYCODE_MODULE.NUMPAD] = $keycode_module[$KEYCODE_MODULE.NUMPAD]($KEYCODE_MODULE.NUMPAD, _module_callback);
  _modules[$KEYCODE_MODULE.SETTING] = $keycode_module[$KEYCODE_MODULE.SETTING]($KEYCODE_MODULE.SETTING, _module_callback);
  _modules[$KEYCODE_MODULE.HISTORY] = $keycode_module[$KEYCODE_MODULE.HISTORY]($KEYCODE_MODULE.HISTORY, _module_callback);
  _module = _modules[$KEYCODE_MODULE.NUMPAD];

  var _closure = function (event_) {
    var keycode = event_.which || event_.keyCode,
      alt = event_.altKey,
      ctrl = event_.ctrlKey,
      meta = event_.metaKey,
      shift = event_.shiftKey;
    if (_lock) {
      return;
    }
    ;

    if (keycode === _KEYCODE._K) {
      if (_modules[$KEYCODE_MODULE.CAMBODIA]) {
        if (_module.code === $KEYCODE_MODULE.NUMPAD) {
          _module = _modules[$KEYCODE_MODULE.CAMBODIA];
          _modules[$KEYCODE_MODULE.CAMBODIA].clear();
          _modules[$KEYCODE_MODULE.NUMPAD].clear();
          _modules[$KEYCODE_MODULE.SETTING].clear();
        }
        ;
      }
      ;
    } else if (_modules[$KEYCODE_MODULE.NUMPAD].keycode.indexOf(keycode) !== -1) {
      if (_module.code === $KEYCODE_MODULE.CAMBODIA) {
        _module = _modules[$KEYCODE_MODULE.NUMPAD];
        _modules[$KEYCODE_MODULE.CAMBODIA].clear();
        _modules[$KEYCODE_MODULE.NUMPAD].clear();
        _modules[$KEYCODE_MODULE.SETTING].clear();
      }
      ;
    }
    ;

    _module(keycode);
  };

  var _set_lock = function (lock_) {
    _lock = (lock_ === false ? false : true);
  };

  _closure.lock = _set_lock;
  return _closure;
};





