/* eslint-disable camelcase */

// eslint-disable-next-line no-unused-vars
var $f = (function ($j) {
  var _IO_STAT = Object.freeze({
    UNDEFINED: 0, /* 從未調用過 _connect() */
    CONNECTED: 1,
    ERROR: 2,
    RECONNECTING: 3,
    EXIT: 4
  })

  var _ERR = Object.freeze({
    E_IO_EXIT: 11010101,
    E_IO_CLOSED: 11010102,
    E_IO_CONNECT_TIMEOUT: 11010103
  })

  var _io = function () {
    var __uri = ''
    var __on_data = null
    var __on_status = null
    var __connect_timeout = 5000
    var __reconnect_interval = 1000
    var __start_cb = null
    var __connect_timer = 0
    var __reconnect_timer = 0
    var __status = _IO_STAT.UNDEFINED
    var __cli = null

    var __connect = function () {
      if (__status === _IO_STAT.ERROR) { __change_status(_IO_STAT.RECONNECTING) } /* 若是第一次被調用會是_const.IPC_UNDEFINED */

      if (__cli === null) {
        __cli = window.eio(__uri)
        __cli.on('open', function () { __change_status(_IO_STAT.CONNECTED) })
        __cli.on('message', function (u) { if (__on_data) { __on_data(u) } })
        __cli.on('close', function (reason_, desc_) { __change_status(_IO_STAT.ERROR, _ERR.E_IO_CLOSED) })
        __cli.on('error', function (err_) { __change_status(_IO_STAT.ERROR, err_.message) })
        __connect_timer = setTimeout(function () { __change_status(_IO_STAT.ERROR, _ERR.E_IO_CONNECT_TIMEOUT) }, __connect_timeout)
      }
    }

    var __change_status = function (target_, data_) {
      switch (__status) {
        case _IO_STAT.UNDEFINED:
          switch (target_) {
            case _IO_STAT.CONNECTED:
              clearTimeout(__connect_timer)
              __connect_timer = 0
              __status = target_
              if (__on_status) { __on_status(null, target_) }
              break
            case _IO_STAT.ERROR:
              __disconnect()
              __reconnect_timer = setTimeout(__connect, __reconnect_interval)
              __status = target_
              if (__on_status) { __on_status(data_, target_) }
              break
            case _IO_STAT.EXIT:
              __disconnect(true)
              __status = target_
              if (__on_status) { __on_status(data_, target_) }
              break
          }
          if (__start_cb) {
            switch (target_) {
              case _IO_STAT.CONNECTED:
                __start_cb()
                break
              case _IO_STAT.ERROR:
                __start_cb(data_)
                break
              case _IO_STAT.EXIT:
                __start_cb(_ERR.E_IO_EXIT)
                break
            }
            __start_cb = null
          }
          break
        case _IO_STAT.CONNECTED:
          switch (target_) {
            case _IO_STAT.ERROR:
              __disconnect()
              __reconnect_timer = setTimeout(__connect, __reconnect_interval)
              __status = target_
              if (__on_status) { __on_status(data_, target_) }
              break
            case _IO_STAT.EXIT:
              __disconnect(true)
              __status = target_
              if (__on_status) { __on_status(null, target_) }
              break
          }
          break
        case _IO_STAT.ERROR:
          switch (target_) {
            case _IO_STAT.RECONNECTING:
              clearTimeout(__reconnect_timer)
              __reconnect_timer = 0
              __status = target_
              if (__on_status) { __on_status(null, target_) }
              break
            case _IO_STAT.ERROR:
              break
            case _IO_STAT.EXIT:
              __disconnect(true)
              __status = target_
              if (__on_status) { __on_status(null, target_) }
              break
          }
          break
        case _IO_STAT.RECONNECTING:
          switch (target_) {
            case _IO_STAT.CONNECTED:
              clearTimeout(__connect_timer)
              __connect_timer = 0
              __status = target_
              if (__on_status) { __on_status(null, target_) }
              break
            case _IO_STAT.ERROR:
              __disconnect()
              __reconnect_timer = setTimeout(__connect, __reconnect_interval)
              __status = target_
              if (__on_status) { __on_status(data_, target_) }
              break
            case _IO_STAT.EXIT:
              __disconnect(true)
              __status = target_
              if (__on_status) { __on_status(null, target_) }
              break
          }
          break

        case _IO_STAT.EXIT:
          // switch (target_) {
          //   case _IO_STAT.ERROR:
          //     if ((__cli && (__cli.readyState === 'open' || __cli.readyState === 'opening')) || __reconnect_timer) return
          //     __disconnect()
          //     __reconnect_timer = setTimeout(__connect, __reconnect_interval)
          //     __status = target_
          //     console.log('走到了人生盡頭，但是我想要重新來過', target_, __on_status)
          //     if (__on_status) { __on_status(data_, target_) }
          //     break
          // }
      }
    }

    var __disconnect = function (exit_) {
      if (__connect_timer !== 0) { clearTimeout(__connect_timer) }
      if (__reconnect_timer !== 0) { clearTimeout(__reconnect_timer) }
      if (__cli) {
        __cli.close()
        if (exit_) {
          __on_data = null
          __on_status = null
        }
        __start_cb = null
        __cli = null
      }
    }

    var __send = function (msg_) {
      if (__status === _IO_STAT.CONNECTED) {
        __cli.send(msg_)
        return true
      }
      return false
    }

    var __exit = function (cb_) {
      __change_status(_IO_STAT.EXIT)
      if (cb_) { cb_() }
    }

    var __on = function (evt_, fun_) {
      switch (evt_) {
        case 'data':
          __on_data = fun_
          break
        case 'status':
          __on_status = fun_
          break
      }
    }

    var __start = function (uri_, connect_timeout_, cb_) {
      __uri = uri_
      __connect_timeout = connect_timeout_
      __start_cb = cb_
      __connect()
    }

    __send.start = __start
    __send.exit = __exit
    __send.on = __on
    return __send
  }

  var _cb = function (key_) {
    var __cb_on = {}
    var __cb_one = {}
    var __remark

    var __remark_ = function (remark_) {
      if (typeof remark_ === 'undefined') {
        return __remark
      } else {
        __remark = remark_
      }
    }

    var __main = function () {
      var key = arguments[0]
      var args = []
      var i
      for (i = 1; i < arguments.length; i++) {
        args.push(arguments[i])
      }
      for (i = 0; i < __cb_on[key].length; i++) {
        if (typeof key === 'undefined') { console.warn() }
        __cb_on[key][i].apply(null, args)
      }
      for (i = 0; i < __cb_one[key].length; i++) {
        var fn = __cb_one[key][i]
        __cb_one[key][i] = null
        __cb_one[key].splice(i, 1)
        fn.apply(null, args)
      }
    }

    var __on = function (key_, fn_, one_, desc_) {
      try {
        if (one_) {
          __cb_one[key_].push(fn_)
        } else {
          __cb_on[key_].push(fn_)
        }
      } catch (e) {
        e.message += ' key:' + key_
        throw e
      }
    }

    var __event = function (key_) {
      if (typeof key_ === 'string') {
        __cb_on[key_] = []
        __cb_one[key_] = []
      } else {
        for (var i = 0; i < key_.length; i++) {
          __cb_on[key_[i]] = []
          __cb_one[key_[i]] = []
        }
      }
    }

    var __off = function (key_, fn_) {
      var k, i
      if (typeof key_ === 'undefined') {
        for (k in __cb_on) {
          while (__cb_on[k].length > 0) {
            __cb_on[k][0] = null
            __cb_on[k].splice(0, 1)
          }
        }
        for (k in __cb_one) {
          while (__cb_one[k].length > 0) {
            __cb_one[k][0] = null
            __cb_one[k].splice(0, 1)
          }
        }
      } else {
        if (typeof fn_ === 'undefined') {
          while (__cb_on[key_].length > 0) {
            __cb_on[key_][0] = null
            __cb_on[key_].splice(0, 1)
          }
          while (__cb_one[key_].length > 0) {
            __cb_one[key_][0] = null
            __cb_one[key_].splice(0, 1)
          }
        } else {
          i = __cb_on[key_].indexOf(fn_)
          if (i !== -1) {
            __cb_on[key_][i] = null
            __cb_on[key_].splice(i, 1)
          }

          i = __cb_one[key_].indexOf(fn_)
          if (i !== -1) {
            __cb_one[key_][i] = null
            __cb_one[key_].splice(i, 1)
          }
        }
      }
    }

    for (var i = 0; i < key_.length; i++) {
      __cb_on[key_[i]] = []
    }
    $j.extend(true, __cb_one, __cb_on)
    __main.on = __on
    __main.off = __off
    __main.event = __event
    __main.remark = __remark_
    __main.debug = function (debug_) {
      var on = []
      var one = []
      var i
      for (i in __cb_on) {
        if (__cb_on[i].length !== 0) { on.push(i) }
      }
      for (i in __cb_one) {
        if (__cb_one[i].length !== 0) { one.push(i) }
      }
    }
    return __main
  }

  var _sequence = function () {
    var seq = 0
    var size = 8
    var limit = Number(new Array(size + 1).join('9'))

    return function () {
      if (seq === limit) { seq = 0 }
      var s = (++seq).toString()
      if (s.length < size) { s = new Array(size - s.length + 1).join('0') + s }
      return s
    }
  }

  var _money = function (money_, int_) {
    var money = money_.toString()
    var decimal
    var m = []
    if (money === '0') { return money }
    decimal = money.substr(money.length - 2)
    money = money.substr(0, money.length - 2)
    while (money.length > 3) {
      m.unshift(money.substr(money.length - 3))
      money = money.substr(0, money.length - 3)
    }
    if (m.length !== 0) { money = money + ',' + m.join(',') }
    if (!int_) { money = money + '.' + decimal }
    return money
  }

  var _roadmap = function () {
    var _bigroad,		// [105][105]
      _smallroad,	// [105][105]
      _eyeroad,		// [105][105]
      _bugroad		//[105][105]

    var _tie,			// [105][105];
      _last_row, 	// Number
      _last_col, 	// Number
      _arr_road,	// [6][30];
      _arr_tie,	// [6][30];
      _collapse			//[30];

    var RD_SAME = 1,
      RD_DIFF = 2

    var _clear = function () {
      _tie = create_array(105, 105)	//[105][105];
      _bigroad = create_array(105, 105)	//[105][105];
      _smallroad = create_array(105, 105)	//[105][105];
      _eyeroad = create_array(105, 105)	//[105][105];
      _bugroad = create_array(105, 105)	//[105][105];
      _last_row = 0
      _last_col = 0
      _arr_road = create_array(6, 60)	//[6][60];
      _arr_tie = create_array(6, 60) //[6][60];
      _collapse = create_array(60)	//[60];
    };

    var _big = function (data_) {
      if (typeof (data_) === 'undefined') return _bigroad
      if (data_.length === 0) return _bigroad

      var row = 0
      var col = 0
      var nFront_tie = 0
      //special for tie at first
      if (data_[0] == 3 || data_[0] == 10 ||
        data_[0] == 11 || data_[0] == 12) {
        _tie[0][0]++
        nFront_tie++
        _bigroad[0][0] = 0
      }      else
        {_bigroad[0][0] = data_[0];}
      for (var i = 1; i < 105; i++) {
        switch (data_[i]) {
          // banker win
          case 1:
          case 4: // banker pair
          case 5: // player pair
          case 6: // two pair

            {
              var n_tie = _tie[row][col]

              if (_bigroad[0][0] == 0) {
                _bigroad[0][0] = data_[i]
                break;
              }
              // There is tie before _this.one
              if (n_tie != 0 && nFront_tie == 0) {
                if (data_[i - n_tie - 1] == 1 ||
                  (data_[i - n_tie - 1] <= 6 && data_[i - n_tie - 1] >= 4))
                  {row++;}
                else {
                  col++
                  row = 0
                }
              }              else {
                if (data_[i - n_tie + nFront_tie - 1] == 1 ||
                  (data_[i - n_tie + nFront_tie - 1] <= 6 && data_[i - n_tie + nFront_tie - 1] >= 4))
                  {row++;}
                else {
                  col++
                  row = 0
                }
                if (nFront_tie != 0)
                  {nFront_tie = 0;}
              }
              _bigroad[row][col] = data_[i]

            }
            break
          //player win
          case 2:
          case 7:
          case 8:
          case 9:
            {
              var n_tie = _tie[row][col]
              if (_bigroad[0][0] == 0) {
                _bigroad[0][0] = data_[i]
                break;
              }
              if (n_tie != 0 && nFront_tie == 0) {
                if (data_[i - n_tie - 1] == 2 ||
                  (data_[i - n_tie - 1] <= 9 && data_[i - n_tie - 1] >= 7))
                  {row++;}
                else {
                  col++
                  row = 0
                }
              }              else {
                if (data_[i - n_tie + nFront_tie - 1] == 2 ||
                  (data_[i - n_tie + nFront_tie - 1] <= 9 && data_[i - n_tie + nFront_tie - 1] >= 7))
                  {row++;}
                else {
                  col++
                  row = 0
                }
                if (nFront_tie != 0)
                  {nFront_tie = 0;}
              }
              _bigroad[row][col] = data_[i]
            }
            break
          case 3:
          case 10:
          case 11:
          case 12:
            {
              if (_bigroad[0][0] == 0)
                {nFront_tie++;}
              _tie[row][col]++
            }
            break
          default:
            return
        }
      }
    }

    var _eye = function (bigroad_) {
      if (typeof (bigroad_) === 'undefined') return _eyeroad

      if (bigroad_[0][0] == 0)
        {return;}
      // var  nSRoad[105];
      // memset ( nSRoad, 0x00, sizeof ( nSRoad ) );
      var nSRoad = create_array(105)
      var lastrow = 1
      var count = 0
      //game
      for (var i = 1; i < 105; i++) // col

      {
        for (var j = 0; j < 105; j++) // row

        {
          if (bigroad_[j][i] == 0)
            {break;}
          if (bigroad_[0][1] == 0 ||
            (bigroad_[1][1] == 0 && bigroad_[0][2] == 0))
            {return;}
          if (i == 1 && j == 0)
            {continue;}
          if (j == 0) {
            if (bpt(bigroad_[lastrow][i - 2]) !=
              bpt(bigroad_[lastrow - 1][i - 2])) {
              nSRoad[count] = RD_SAME
              lastrow = 1
              count++
            }            else {
              nSRoad[count] = RD_DIFF
              lastrow = 1
              count++
            }
          }          else {
            if (bpt(bigroad_[j][i - 1]) != bpt(bigroad_[j - 1][i - 1])) {
              nSRoad[count] = RD_DIFF
              count++
              lastrow = j + 1
            }            else {
              nSRoad[count] = RD_SAME
              count++
              lastrow = j + 1
            }
          }
        }
      }
      var row = 0
      var col = 0
      if (nSRoad[0] == 0)
        {return;}
      else
        {_eyeroad[0][0] = nSRoad[0];}
      for (i = 1; i < 105; i++) {
        if (nSRoad[i] == 0)
          {break;}
        if (nSRoad[i] != nSRoad[i - 1]) {
          col++
          row = 0
        }        else
          {row++;}
        _eyeroad[row][col] = nSRoad[i]
      }
    }

    var _small = function (bigroad_) {
      if (typeof (bigroad_) === 'undefined') return _smallroad

      if (bigroad_[0][0] == 0 || bigroad_[0][1] == 0 || bigroad_[0][2] == 0)
        {return;}
      var nSRoad = create_array(105)
      var lastrow = 1
      var count = 0
      //game
      for (var i = 2; i < 105; i++) // col

      {
        for (var j = 0; j < 105; j++) // row

        {
          if (bigroad_[j][i] == 0)
            {break;}
          if (bigroad_[1][2] == 0 && bigroad_[0][3] == 0)
            {return;}
          if (i == 2 && j == 0)
            {continue;}
          if (j == 0) {
            if (bpt(bigroad_[lastrow][i - 3]) !=
              bpt(bigroad_[lastrow - 1][i - 3])) {
              nSRoad[count] = RD_SAME
              lastrow = 1
              count++
            }            else {
              nSRoad[count] = RD_DIFF
              lastrow = 1
              count++
            }
          }          else {
            if (bpt(bigroad_[j][i - 2]) != bpt(bigroad_[j - 1][i - 2])) {
              nSRoad[count] = RD_DIFF
              count++
              lastrow = j + 1
            }            else {
              nSRoad[count] = RD_SAME
              count++
              lastrow = j + 1
            }
          }
        }
      }
      var row = 0
      var col = 0
      if (nSRoad[0] == 0)
        {return;}
      else
        {_smallroad[0][0] = nSRoad[0];}
      for (i = 1; i < 105; i++) {
        if (nSRoad[i] == 0)
          {break;}
        if (nSRoad[i] != nSRoad[i - 1]) {
          col++
          row = 0
        }        else
          {row++;}
        _smallroad[row][col] = nSRoad[i]
      }
    }

    var _bug = function (bigroad_) {
      if (typeof (bigroad_) === 'undefined') return _bugroad

      if (bigroad_[0][0] == 0 || bigroad_[0][1] == 0 ||
        bigroad_[0][2] == 0 || bigroad_[0][3] == 0)
        {return;}
      var nSRoad = create_array(105)
      var lastrow = 1
      var count = 0
      //game
      for (var i = 3; i < 105; i++) // col
      {
        for (var j = 0; j < 105; j++) // row
        {
          if (bigroad_[j][i] == 0)
            {break;}
          if (bigroad_[1][3] == 0 && bigroad_[0][4] == 0)
            {return;}
          if (i == 3 && j == 0)
            {continue;}
          if (j == 0) {
            if (bpt(bigroad_[lastrow][i - 4]) !=
              bpt(bigroad_[lastrow - 1][i - 4])) {
              nSRoad[count] = RD_SAME
              lastrow = 1
              count++
            }            else {
              nSRoad[count] = RD_DIFF
              lastrow = 1
              count++
            }
          }          else {
            if (bpt(bigroad_[j][i - 3]) != bpt(bigroad_[j - 1][i - 3])) {
              nSRoad[count] = RD_DIFF
              count++
              lastrow = j + 1
            }            else {
              nSRoad[count] = RD_SAME
              count++
              lastrow = j + 1
            }
          }
        }
      }
      var row = 0
      var col = 0
      if (nSRoad[0] == 0)
        {return;}
      else
        {_bugroad[0][0] = nSRoad[0];}
      for (i = 1; i < 105; i++) {
        if (nSRoad[i] == 0)
          {break;}
        if (nSRoad[i] != nSRoad[i - 1]) {
          col++
          row = 0
        }        else
          {row++;}
        _bugroad[row][col] = nSRoad[i]
      }
    }

    var _format = function (nRoad, row, col) {
      _last_row = 0
      _last_col = 0
      //memset (_arr_road, 0x00, sizeof (_arr_road ));
      //memset (_arr_tie, 0x00, sizeof (_arr_tie ));
      //memset (_collapse, 0x00, sizeof (_collapse ));
      _arr_road = create_array(row, col)
      _arr_tie = create_array(row, col)
      _collapse = create_array(col)

      for (var i = 0; i < 105; i++) // col
      {
        var bLeft = false //left corner
        var bCollapse = false//the sixth row
        var bRow5 = false//the fifth row
        var bRight = false//must turn right
        var nMoveCol = 0 //the number of left move

        // display tie in first record
        if (nRoad[0][i] == 0) {
          if (_tie[0][i] != 0 && i == 0)
            {_arr_tie[0][i] = _tie[0][i];}
          else
            {break;}
        }

        if (i >= col) {
          nMoveCol = i - col + 1
          if ((bpt(_arr_road[(row - 1)][0]) == bpt(_arr_road[(row - 1)][1])) &&
            _arr_road[(row - 1)][0] != 0) {
            var tempRoad = create_array(105, 105)

            for (var k = 0; k < (105 - nMoveCol); k++) {
              if (nRoad[0][nMoveCol + k] == 0)
                {break;}
              for (var l = 0; l < 105; l++) {
                if (nRoad[l][k + nMoveCol] == 0)
                  {break;}
                if (k == 104 - nMoveCol) {
                  tempRoad[l][k] = 0
                  _tie[l][k] = 0
                  break;
                }
                tempRoad[l][k] = nRoad[l][k + nMoveCol]
                _tie[l][k] = _tie[l][k + nMoveCol]
              }
            }
            _format(tempRoad, row, col)
            break;
          }
          for (var m = 0; m < col; m++) // col
          {
            for (var n = 0; n < row; n++)// row
            {
              if (m == col - 1) {
                _arr_road[n][m] = 0
                _arr_tie[n][m] = 0
              }              else {
                _arr_road[n][m] = _arr_road[n][m + 1]
                _arr_tie[n][m] = _arr_tie[n][m + 1]
              }
            }
            if (m == col - 1)
              {_collapse[m] = 0;}
            else
              {_collapse[m] = _collapse[m + 1];}
          }
        }

        for (var j = 0; j < 105; j++) // row
        {
          if (nRoad[j][i] == 0)
            {break;}
          if (j < row - 2 && (i - nMoveCol) < col) // normal road
          {
            if (_tie[j][i] != 0)
              {_arr_tie[j][i - nMoveCol] = _tie[j][i];}
            _arr_road[j][i - nMoveCol] = nRoad[j][i]
            _last_row = j + 1
            _last_col = i - nMoveCol + 1
            continue;
          }          else if (j == row - 2) // small L road
          {
            if (_arr_road[j][i - nMoveCol] != 0) {
              // find the last nonzero position in row 6
              // cut large L road
              var c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j)
              //find the last nonzero in row 5
              changeSmallRoad(nRoad, row, col, nMoveCol, c, i - nMoveCol)
              if (_tie[j][i] != 0)
                {_arr_tie[j][i - nMoveCol] = _tie[j][i];}
              _arr_road[j][i - nMoveCol] = nRoad[j][i]
              _last_row = j + 1
              _last_col = i - nMoveCol + 1
            }            else {
              _arr_road[j][i - nMoveCol] = nRoad[j][i]
              _last_row = j + 1
              _last_col = i - nMoveCol + 1
              if (_tie[j][i] != 0)
                {_arr_tie[j][i - nMoveCol] = _tie[j][i];}
            }
          }          else if (j == (row - 1) || bCollapse) // large L road && small L road
          {
            if (_arr_road[row - 1][i - nMoveCol] != 0) {
              // right most in row 5
              if (j == col - i - nMoveCol + (row - 2)) {
                if (bLeft) {
                  for (var ch = 0; ch < (j - (row - 1)); ch++) {
                    _arr_road[(row - 2)][i - nMoveCol + ch + 1] = _arr_road[(row - 2)][i - nMoveCol - ch - 1]
                    _arr_road[(row - 2)][i - nMoveCol - ch - 1] = 0
                    if (_arr_tie[(row - 2)][i - nMoveCol - ch - 1] != 0) {
                      _arr_tie[(row - 2)][i - nMoveCol + ch + 1] = _arr_tie[(row - 2)][i - nMoveCol - ch - 1]
                      _arr_tie[(row - 2)][i - nMoveCol - ch - 1] = 0
                    }
                  }
                  bLeft = false
                }
                bRight = true

                //find the last nonzero position in row 6
                var c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j)
                changeSmallRoad(nRoad, row, col, nMoveCol, c, i - nMoveCol)
                _arr_road[(row - 1)][col - 1] = nRoad[j][i]
                _arr_tie[(row - 1)][col - 1] = _tie[j][i]
                _last_col = col
                _last_row = row
              }              else if (j >= col - i - nMoveCol + (row - 1)) // right most in collapse
              {
                if (_collapse[i - nMoveCol] != 0) {
                  if (_tie[j][i] != 0)
                    {_arr_tie[(row - 1)][i - nMoveCol] = _tie[j][i];}
                  _collapse[i - nMoveCol] = _collapse[i - nMoveCol] + 1
                  var display = nRoad[j][i]
                  _last_row = row
                  _last_col = i - nMoveCol + 1
                  _arr_road[(row - 1)][i - nMoveCol] =
                    displayNum(_arr_road[(row - 1)][i - nMoveCol], display)
                }                else {
                  var c = 0
                  var display = 0
                  var tie = 0
                  c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j)
                  tie = _arr_tie[(row - 1)][c] + _tie[j][i]
                  display = displayNum(nRoad[j][i], _arr_road[(row - 1)][c])
                  _arr_road[(row - 1)][i - nMoveCol] = display
                  _last_row = row
                  _last_col = i - nMoveCol + 1
                  _collapse[i - nMoveCol] = _collapse[c] + 1
                  _arr_tie[(row - 1)][i - nMoveCol] = tie
                }
              }              else {
                // turn right
                if ((i - nMoveCol + (row - 2) - j) < 0 || _arr_road[(row - 2)][i - nMoveCol + (row - 2) - j] != 0 || (bCollapse && bRight)) // most left
                {
                  if (bLeft) {
                    for (var ch = 0; ch < (j - (row - 1)); ch++) {
                      _arr_road[(row - 2)][i - nMoveCol + ch + 1] = _arr_road[(row - 2)][i - nMoveCol - ch - 1]
                      _arr_road[(row - 2)][i - nMoveCol - ch - 1] = 0
                      if (_arr_tie[(row - 2)][i - nMoveCol - ch - 1] != 0) {
                        _arr_tie[(row - 2)][i - nMoveCol + ch + 1] = _arr_tie[(row - 2)][i - nMoveCol - ch - 1]
                        _arr_tie[(row - 2)][i - nMoveCol - ch - 1] = 0
                      }
                    }
                    bLeft = false
                  }
                  _arr_road[(row - 2)][i - nMoveCol + j - (row - 2)] = nRoad[j][i]
                  _last_row = (row - 1)
                  _last_col = i - nMoveCol + j - (row - 3)
                  if (_tie[j][i] != 0)
                    {_arr_tie[(row - 2)][i - nMoveCol + j - (row - 2)] = _tie[j][i];}
                  bRight = true
                  ////
                  bCollapse = true
                }                else // turn left
                {
                  bCollapse = true
                  bLeft = true
                  bRight = false
                  _arr_road[(row - 2)][i - nMoveCol + (row - 2) - j] = nRoad[j][i]
                  _last_row = (row - 1)
                  _last_col = i - nMoveCol + (row - 1) - j
                  if (_tie[j][i] != 0)
                    {_arr_tie[(row - 2)][i - nMoveCol + (row - 2) - j] = _tie[j][i];}
                }
              }
            }            else {
              _arr_road[j][i - nMoveCol] = nRoad[j][i]
              _last_row = j + 1
              _last_col = i - nMoveCol + 1
              if (_tie[j][i] != 0)
                {_arr_tie[j][i - nMoveCol] = _tie[j][i];}
            }
          }          else // if ( j >= row )
          {
            // turn right
            if ((i - nMoveCol + (row - 1) - j) < 0 || _arr_road[(row - 1)][i - nMoveCol + (row - 1) - j] != 0 || bRight) // most left
            {
              if (j >= col - i - nMoveCol + (row - 1)) // right most in collapse
              {
                bCollapse = true
                if (_collapse[i - nMoveCol] != 0) {
                  if (_tie[j][i] != 0)
                    {_arr_tie[(row - 1)][i - nMoveCol] = _tie[j][i];}
                  _collapse[i - nMoveCol] = _collapse[i - nMoveCol] + 1
                }                else if (!bLeft) {
                  var c = cutLargeRoad(nRoad, row, col, nMoveCol, i - nMoveCol, j)
                  var tie = _arr_tie[(row - 1)][c] + _tie[j][i]
                  var display = displayNum(nRoad[j][i], _arr_road[(row - 1)][c])
                  _arr_road[(row - 1)][c] = display
                  _collapse[c] = _collapse[c] + 1
                  _arr_tie[(row - 1)][c] = tie
                }                else {
                  var c = col
                  var count = 0
                  var bFind = false
                  var tie = 0
                  var display = 0
                  while (1) // cut large left L road
                  {
                    c--
                    if (c == 0) {
                      count++
                      display = displayNum(_arr_road[(row - 1)][c], display)
                      if (_tie[j][i] != 0)
                        {tie = tie + _tie[j][i];}
                      display = displayNum(nRoad[j][i], display)
                      _arr_road[(row - 1)][c] = 0
                      if (_arr_tie[(row - 1)][c] != 0) {
                        tie = _arr_tie[(row - 1)][c]
                        _arr_tie[(row - 1)][c] = 0
                      }
                      _collapse[i - nMoveCol] = count + row
                      _last_row = row
                      _last_col = i - nMoveCol + 1
                      _arr_tie[(row - 1)][i - nMoveCol] = tie
                      _arr_road[(row - 1)][i - nMoveCol] = display
                      if (_arr_tie[row - 1][i - nMoveCol] == 0) {
                        for (var p = 0; p < row - 1; p++)
                          {_arr_tie[row - 1][i - nMoveCol] += _arr_tie[p][i - nMoveCol];}
                      }
                      break
                    }

                    if (c == i - nMoveCol + row - j) {
                      // 070307
                      // special for display banker pair and player pair
                      if (display == 0)
                        {display = _arr_road[(row - 1)][c];}
                      else
                        {display = displayNum(_arr_road[(row - 1)][c], display);}

                      count++
                      if (display == 0)
                        {display = nRoad[j][i];}
                      else
                        {display = displayNum(_arr_road[(row - 1)][c], display);}
                      _arr_road[(row - 1)][c] = 0
                      if (_arr_tie[(row - 1)][c] != 0) {
                        tie = _arr_tie[(row - 1)][c]
                        _arr_tie[(row - 1)][c] = 0
                      }
                      _collapse[i - nMoveCol] = count + row
                      _arr_tie[row - 1][i - nMoveCol] = tie
                      _last_row = row
                      _last_col = i - nMoveCol + 1
                      _arr_road[row - 1][i - nMoveCol] = display
                      if (_arr_tie[row - 1][i - nMoveCol] == 0) {
                        for (var p = 0; p < row - 1; p++)
                          {_arr_tie[row - 1][i - nMoveCol] += _arr_tie[p][i - nMoveCol];}
                      }
                      break
                    }

                    if (bpt(_arr_road[(row - 1)][c]) != bpt(_arr_road[(row - 1)][c - 1])) {
                      if (i - nMoveCol == col - 1) {
                        count++
                        if (_arr_road[(row - 2)][c - 1] != 0 && c > 1 &&
                          bpt(_arr_road[(row - 2)][c - 1]) != bpt(_arr_road[(row - 2)][c]) &&
                          bpt(_arr_road[(row - 2)][c - 2]) != bpt(_arr_road[(row - 2)][c - 1])) {
                          var x = 0
                          if (c - 1 == i - nMoveCol) {
                            while (nRoad[x][c - 1] != 0)
                              {x++;}
                          }

                          if (x == count + row) {
                            _arr_road[(row - 1)][c] = 0
                            if (_arr_tie[(row - 1)][c] != 0) {
                              tie = _arr_tie[(row - 1)][c]
                              _arr_tie[(row - 1)][c] = 0
                            }
                            c--
                            //special for display banker pair and player pair
                            if (display == 0)
                              {display = _arr_road[(row - 1)][c];}
                            else
                              {display = displayNum(_arr_road[(row - 1)][c], display);}
                            break
                          }
                        }                        else {
                          var x = 0
                          if (c - 1 == i - nMoveCol) {
                            while (nRoad[x][c - 1] != 0)
                              {x++;}
                          }

                          if (x == count + row) {
                            _arr_road[(row - 1)][c] = 0
                            if (_arr_tie[(row - 1)][c] != 0) {
                              tie = _arr_tie[(row - 1)][c]
                              _arr_tie[(row - 1)][c] = 0
                            }
                            c--
                            //special for display banker pair and player pair
                            if (display == 0)
                              {display = _arr_road[(row - 1)][c];}
                            else
                              {display = displayNum(_arr_road[(row - 1)][c], display);}
                            break
                          }
                        }
                        // special for display banker pair and player pair
                        if (display == 0)
                          {display = _arr_road[(row - 1)][c];}
                        else
                          {display = displayNum(_arr_road[(row - 1)][c], display);}
                        _arr_road[(row - 1)][c] = 0
                        if (_arr_tie[(row - 1)][c] != 0) {
                          tie = _arr_tie[(row - 1)][c]
                          _arr_tie[(row - 1)][c] = 0
                        }
                        _collapse[i - nMoveCol] = count + row
                        _arr_tie[(row - 1)][i - nMoveCol] = tie
                        _last_row = row
                        _last_col = i - nMoveCol + 1
                        _arr_road[(row - 1)][i - nMoveCol] = display
                        break;
                      }                      else {
                        if (bFind) {
                          count++
                          break;
                        }
                        bFind = true
                      }
                    }                    else {
                      if (i - nMoveCol == col - 1) {
                        count++
                        //special for display banker pair and player pair
                        if (display == 0)
                          {display = _arr_road[(row - 1)][c];}
                        else
                          {display = displayNum(_arr_road[(row - 1)][c], display);}

                        _arr_road[(row - 1)][c] = 0
                        if (_arr_tie[(row - 1)][c] != 0) {
                          tie = _arr_tie[(row - 1)][c]
                          _arr_tie[(row - 1)][c] = 0
                        }
                        if (_tie[j][i] != 0) {
                          tie = _tie[j][i]
                        }
                      }                      else {
                        if (c == col - 1 && _arr_road[(row - 1)][c] != 0) {
                          bFind = true
                          count++
                        }
                        if (bFind) {
                          count++
                          if (_arr_road[(row - 2)][c - 1] != 0 && c > 1 &&
                            bpt(_arr_road[(row - 2)][c - 1]) != bpt(_arr_road[(row - 2)][c]) &&
                            bpt(_arr_road[(row - 2)][c - 2]) != bpt(_arr_road[(row - 2)][c - 1])) {
                            var x = 0
                            if (c - 1 == i - nMoveCol) {
                              while (nRoad[x][c - 1] != 0)
                                {x++;}
                            }

                            if (x == count + row) {
                              _arr_road[(row - 1)][c] = 0
                              if (_arr_tie[(row - 1)][c] != 0) {
                                tie = _arr_tie[(row - 1)][c]
                                _arr_tie[(row - 1)][c] = 0
                              }
                              c--
                              //special for display banker pair and player pair
                              if (display == 0)
                                {display = _arr_road[(row - 1)][c];}
                              else
                                {display = displayNum(_arr_road[(row - 1)][c], display);}
                              break
                            }
                          }                          else {
                            var x = 0
                            if (c - 1 == i - nMoveCol) {
                              while (nRoad[x][c - 1] != 0)
                                {x++;}
                            }
                            if (x == count + row) {
                              _arr_road[(row - 1)][c] = 0
                              if (_arr_tie[(row - 1)][c] != 0) {
                                tie = _arr_tie[(row - 1)][c]
                                _arr_tie[(row - 1)][c] = 0
                              }
                              c--
                              //special for display banker pair and player pair
                              if (display == 0)
                                {display = _arr_road[(row - 1)][c];}
                              else
                                {display = displayNum(_arr_road[(row - 1)][c], display);}
                              break
                            }
                          }
                          // special for display banker pair and player pair
                          if (display == 0)
                            {display = _arr_road[(row - 1)][c];}
                          else
                            {display = displayNum(_arr_road[(row - 1)][c], display);}
                          _arr_road[(row - 1)][c] = 0
                          if (_arr_tie[(row - 1)][c] != 0) {
                            tie = _arr_tie[(row - 1)][c]
                            _arr_tie[(row - 1)][c] = 0
                          }
                          if (_tie[j][i] != 0) {
                            tie = _tie[j][i]
                          }
                        }                        else
                          {continue;}
                      }
                    }
                  }
                }
              }              else {
                if (bLeft) {
                  for (var ch = 0; ch < (j - row); ch++) {
                    _arr_road[(row - 1)][i - nMoveCol + ch + 1] = _arr_road[(row - 1)][i - nMoveCol - ch - 1]
                    _arr_road[(row - 1)][i - nMoveCol - ch - 1] = 0
                    if (_arr_tie[(row - 1)][i - nMoveCol - ch - 1] != 0) {
                      _arr_tie[(row - 1)][i - nMoveCol + ch + 1] = _arr_tie[(row - 1)][i - nMoveCol - ch - 1]
                      _arr_tie[(row - 1)][i - nMoveCol - ch - 1] = 0
                    }
                  }
                  bLeft = false
                }
                bRight = true
                _arr_road[(row - 1)][i - nMoveCol + j - (row - 1)] = nRoad[j][i]
                _last_row = row
                _last_col = i - nMoveCol + j - (row - 2)
                if (_tie[j][i] != 0)
                  {_arr_tie[(row - 1)][i - nMoveCol + j - (row - 1)] = _tie[j][i];}
              }// end else
            }            else // turn left
            {
              bLeft = true
              bRight = false
              _arr_road[(row - 1)][i - nMoveCol + (row - 1) - j] = nRoad[j][i]
              _last_row = row
              _last_col = i - nMoveCol + row - j
              if (_tie[j][i] != 0)
                {_arr_tie[(row - 1)][i - nMoveCol + (row - 1) - j] = _tie[j][i];}
            }// end else
          }
        }// end for
      }// end for
    }

    var displayNum = function (newRoad, oldRoad) {
      if (bpt(newRoad) == 2) {
        if ((oldRoad == 7 && newRoad == 8) ||
          (oldRoad == 8 && newRoad == 7) || oldRoad == 9)
          {oldRoad = 9;}
        else {
          if (newRoad != 2 && oldRoad != 9)
            {oldRoad = newRoad;}
        }
      }
      if (bpt(newRoad) == 1) {
        if ((oldRoad == 4 && newRoad == 5) ||
          (oldRoad == 5 && newRoad == 4) || oldRoad == 6)
          {oldRoad = 6;}
        else {
          if (newRoad != 1 && oldRoad != 6)
            {oldRoad = newRoad;}
        }
      }
      return oldRoad
    };

    // check is banker win or player win
    var bpt = function (result_) {
      switch (result_) {
        case 1:
        case 4:
        case 5:
        case 6:
          return 1
        case 2:
        case 7:
        case 8:
        case 9:
          return 2
        default:
          return 3
      }
    }

    //movechange small road
    var changeSmallRoad = function (arrRoad, row, col, MoveCol, startCol, currentCol) // arrRoad:Array
    {
      var nCount = 0
      var c = col - 1
      var bFind = false
      var nRoadCount = 0
      while ((bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c - 1]) &&
        _arr_road[row - 2][c] == 0) ||
        (bpt(_arr_road[row - 2][c]) != bpt(_arr_road[row - 2][c - 1])))
        {c--;}
      while (c > startCol) {
        c--
        if (bFind || _arr_road[row - 3][c + 1] != 0 &&
          bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1]) &&
          bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 3][c + 1])) {
          if (bFind) {
            _arr_road[row - 2][c + 1] = 0
            _arr_tie[row - 2][c + 1] = 0
          }          else {
            nRoadCount = 0
            while (arrRoad[nRoadCount][c + 1] != 0)
              {nRoadCount++;}
          }
          if ((nRoadCount == row + nCount) && (c != currentCol - 1)) {
            _arr_road[row - 1][c + 1] = _arr_road[row - 2][c]
            _arr_tie[row - 1][c + 1] = _arr_tie[row - 2][c]
            _arr_road[row - 2][c] = 0
            _arr_tie[row - 2][c] = 0
            bFind = false
            c--
            continue;
          }
          if ((nRoadCount > row + nCount) && (c != currentCol - 1)) {
            _arr_road[row - 1][c + 1] = _arr_road[row - 2][c]
            _arr_tie[row - 1][c + 1] = _arr_tie[row - 2][c]
            nRoadCount--
            bFind = true
            continue;
          }
        }
        if (_arr_road[row - 3][c] != 0 &&
          bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1]) &&
          bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 3][c])) {
          nCount++
          _arr_road[row - 1][c] = _arr_road[row - 2][c + 1]
          _arr_tie[row - 1][c] = _arr_tie[row - 2][c + 1]
          _arr_road[row - 2][c + 1] = 0
          _arr_tie[row - 2][c + 1] = 0
          nRoadCount = 0
          while (arrRoad[nRoadCount][c] != 0)
            {nRoadCount++;}
          if (nRoadCount == (nCount + row - 1) && c != currentCol) {
            c--
            nCount = 0
          }
          continue
        }
        if (bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1]) &&
          _arr_road[row - 2][c + 1] != 0) {
          nCount++
          _arr_road[row - 1][c] = _arr_road[row - 2][c + 1]
          _arr_tie[row - 1][c] = _arr_tie[row - 2][c + 1]
          _arr_road[row - 2][c + 1] = 0
          _arr_tie[row - 2][c + 1] = 0
        }
      }
    }

    var cutLargeRoad = function (arrRoad, row, col, nMoveCol, currentCol, currentRow) {
      var nCount = 0
      var c = col - 1
      var nRoadCount = 0
      var display = 0
      var tie = 0
      var bNewestCol = false
      var nRight = 0

      while (((bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 1][c - 1]) &&
        _arr_road[row - 1][c] == 0) ||
        (bpt(_arr_road[row - 1][c]) != bpt(_arr_road[row - 1][c - 1])) &&
        currentCol != (col - 1))) {
        c--
        if (c == 0)
          {return 0;}
      }

      if (currentCol == (col - 1)) {
        // special for display banker pair and player pair
        if (display == 0)
          {display += _arr_road[row - 1][c];}
        else
          {display = displayNum(_arr_road[row - 1][c], display);}
        if (_arr_tie[row - 1][c] != 0)
          {tie = _arr_tie[row - 1][c];}
        _arr_road[row - 1][c] = display
        _arr_tie[row - 1][c] = tie
        _collapse[c] = nCount + row
        _last_row = row
        _last_col = c + 1
        if (_arr_tie[row - 1][c] == 0) {
          for (var p = 0; p < row - 1; p++)
            {_arr_tie[row - 1][c] += _arr_tie[p][c];}
        }
        return c
      }
      if (currentRow > (row - 1) && c == (col - 1) && currentRow != (col - currentCol + (row - 2)))
        {bNewestCol = true;}
      else
        {bNewestCol = false;}
      while (c >= 1) {
        c--
        if (_arr_road[row - 2][c] != 0 &&
          bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 1][c + 1]) &&
          bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 2][c])) {
          nCount++

          if (bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1]) ==
            bpt(_arr_road[row - 3][c]) && nRight != 1)
            {nRight = 1;}
          // special for display banker pair and player pair
          if (display == 0)
            {display = _arr_road[row - 1][c + 1];}
          else
            {display = displayNum(_arr_road[row - 1][c + 1], display);}
          if (_arr_tie[row - 1][c + 1] != 0)
            {tie = _arr_tie[row - 1][c + 1];}
          _arr_road[row - 1][c + 1] = 0
          _arr_tie[row - 1][c + 1] = 0
          nRoadCount = 0
          while (arrRoad[nRoadCount][c + nMoveCol] != 0 && _arr_road[0][c] != 0 &&
            ((c != currentCol) || bNewestCol))
            {nRoadCount++;}
          if (currentRow == row - 2 && nRight == 1 &&
            bpt(_arr_road[row - 2][c]) == bpt(_arr_road[row - 2][c + 1])) {
            nRight = 2
            continue;
          }
          if (nRoadCount == (nCount + row) || bNewestCol) {
            // special for display banker pair and player pair
            if (display == 0)
              {display += _arr_road[row - 1][c];}
            else
              {display = displayNum(_arr_road[row - 1][c], display);}
            if (_arr_tie[row - 1][c] != 0)
              {tie = _arr_tie[row - 1][c];}
            _arr_road[row - 1][c] = display
            _arr_tie[row - 1][c] = tie
            _collapse[c] = nCount + row
            _last_row = row
            _last_col = c + 1
            if (_arr_tie[row - 1][c] == 0) {
              for (var p = 0; p < row - 1; p++)
                {_arr_tie[row - 1][c] += _arr_tie[p][c];}
            }
            return c
          }          else
            {continue;}
        }
        if (bpt(_arr_road[row - 1][c]) == bpt(_arr_road[row - 1][c + 1]) &&
          _arr_road[row - 1][c + 1] != 0) {
          nCount++
          //special for display banker pair and player pair
          if (display == 0)
            {display = _arr_road[(row - 1)][c + 1];}
          else
            {display = displayNum(_arr_road[(row - 1)][c + 1], display);}
          _arr_road[(row - 1)][c + 1] = 0
          if (_arr_tie[(row - 1)][c + 1] != 0) {
            tie = _arr_tie[(row - 1)][c + 1]
            _arr_tie[(row - 1)][c + 1] = 0
          }
        }
      }
      return 0
    };

    var create_array = function (row, col) {
      var vAry = []
      for (var i = 0; i < row; i++) {
        if (col != undefined) {
          var vItem = []
          for (var k = 0; k < col; k++) {
            vItem[k] = 0
          }
          vAry[i] = vItem
        }        else
          {vAry[i] = 0;}
      }
      return vAry
    };

    _clear()
    return {
      clear: _clear,
      format: _format,
      bigroad: _big,
      smallroad: _small,
      eyeroad: _eye,
      bugroad: _bug,
      tie: function () { return _arr_tie },
      road: function () { return _arr_road },
      collapse: function () { return _collapse },
      row: function () { return _last_row },
      col: function () { return _last_col }
    }
  }

  var _main = {}
  _main.IO_STAT = _IO_STAT
  _main.io = _io
  _main.cb = _cb
  _main.seq = _sequence
  _main.money = _money
  _main.roadmap = _roadmap
  return _main
})(window.jQuery)
