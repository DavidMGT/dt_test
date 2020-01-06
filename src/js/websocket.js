/**
封裝engino.io.js, 當start()一刻開始, engine_io保證連接可靠性(假連接除外).
- 當連接斷開時自動重連
- 當連接超時要自動重連
- 當連接異常時自動重連
- 使用engine.io.js內建的ping機制(由server端設定)
*/
var _engine_io = function () {
	var _IO_STATUS = {
		UNDEFINED:0, // 從未調用過_connect()
		CONNECTED:1,
		ERROR:2,
		RECONNECTING:3,
		EXIT:4
	};
	
	var _IO_ERR = {
		E_IO_EXIT:'engine.io exit',
		E_IO_CLOSED:'engine.io closed',
		E_IO_CONNECT_TIMEOUT:'engine.io connect timeout'
	};
	
	var _id = 0,
			_uri = '',
			_on_data = null,
			_on_status = null,
			_connect_timeout = 5000,
			_reconnect_interval = 1000,
			_connect_timer = 0,
			_reconnect_timer = 0,
			_status = _IO_STATUS.UNDEFINED,
			_cli = null;

	var _connect = function () {
		console.log('engine.io', _id, '_connect');
		if (_status === _IO_STATUS.ERROR) { // 若是第一次被調用會是_const.IPC_UNDEFINED
			_change_status(_IO_STATUS.RECONNECTING);
		};

		if (_cli === null) {
			_cli = eio(_uri);

			_cli.on('open', function () {
				console.log('engine.io', _id, 'open');
				_change_status(_IO_STATUS.CONNECTED);
			});

			_cli.on('message', function (u) {
				if (_on_data) _on_data(_id, u);
			});

			_cli.on('close', function (reason_, desc_) {
				console.log('engine.io', _id, 'close', reason_);
				_change_status(_IO_STATUS.ERROR, _IO_ERR.E_IO_CLOSED);
			});

			_cli.on('error', function (err_) {
				console.log('engine.io', _id, 'error', err_.message);
				_change_status(_IO_STATUS.ERROR, 'engine.io error: ' + err_.message);
			});

			_connect_timer = setTimeout(function () {
				console.log('engine.io', _id, 'connect timeout');
				_change_status(_IO_STATUS.ERROR, _IO_ERR.E_IO_CONNECT_TIMEOUT);
			}, _connect_timeout);
		};
	};

	var _change_status = function (target_, data_) {
		var a, b;
		for (i in _IO_STATUS) {
			if (_IO_STATUS[i] === _status) {
				a = i;
			};
			
			if (_IO_STATUS[i] === target_) {
				b = i;
			};
		};
		console.log('engine.io', _id, a, '>', b, data_);
		switch (_status) {
			case _IO_STATUS.UNDEFINED:
				switch (target_) {
					case _IO_STATUS.CONNECTED:
						_status = target_;
						clearTimeout(_connect_timer);
						_connect_timer = 0;
						if (_on_status) _on_status(_id, null, target_);
						break;
					case _IO_STATUS.ERROR:
						_status = target_;
						_disconnect();
						_reconnect_timer = setTimeout(_connect, _reconnect_interval);
						if (_on_status) _on_status(_id, data_, target_);
						break;
					case _IO_STATUS.EXIT:
						_status = target_;
						_disconnect(true);
						if (_on_status) _on_status(_id, data_, target_);
						break;
				};
				break;
			case _IO_STATUS.CONNECTED:
				switch (target_) {
					case _IO_STATUS.ERROR:
						_status = target_;
						_disconnect();
						_reconnect_timer = setTimeout(_connect, _reconnect_interval);
						if (_on_status) _on_status(_id, data_, target_);
						break;
					case _IO_STATUS.EXIT:
						_status = target_;
						_disconnect(true);
						if (_on_status) _on_status(_id, null, target_);
						break;
				};
				break;
			case _IO_STATUS.ERROR:
				switch (target_) {
					case _IO_STATUS.RECONNECTING:
						_status = target_;
						clearTimeout(_reconnect_timer);
						_reconnect_timer = 0;
						if (_on_status) _on_status(_id, null, target_);
						break;
					case _IO_STATUS.ERROR:
						break;
					case _IO_STATUS.EXIT:
						_status = target_;
						_disconnect(true);
						if (_on_status) _on_status(_id, null, target_);
						break;
				};
				break;
			case _IO_STATUS.RECONNECTING:
				switch (target_) {
					case _IO_STATUS.CONNECTED:
						_status = target_;
						clearTimeout(_connect_timer);
						_connect_timer = 0;
						if (_on_status) _on_status(_id, null, target_);
						break;
					case _IO_STATUS.ERROR:
						_status = target_;
						_disconnect();
						_reconnect_timer = setTimeout(_connect, _reconnect_interval);
						if (_on_status) _on_status(_id, data_, target_);
						break;
					case _IO_STATUS.EXIT:
						_status = target_;
						_disconnect(true);
						if (_on_status) _on_status(_id, null, target_);
						break;
				};
				break;
			case _IO_STATUS.EXIT:
				break;
		};
	};

	var _disconnect = function (exit_) {
		console.log('engine.io', _id, '_disconnect', exit_);
		if (_connect_timer !== 0) {
			clearTimeout(_connect_timer);
		};

		if (_reconnect_timer != 0) {
			clearTimeout(_reconnect_timer);
		};

		if (_cli) {
			_cli.close();
			if (exit_) {
				_on_data = null;
				_on_status = null;
			};
			_cli = null;
		};
	};

	var _send = function (msg_) {
		if (_status === _IO_STATUS.CONNECTED) {
			_cli.send(msg_);
			return true;
		};
		return false;
	};

	var _exit = function (cb_) {
		console.log('engine.io', _id, 'exit');
		_change_status(_IO_STATUS.EXIT);
		if (cb_) cb_();
	};

	var _on = function (evt_, fun_) {
		switch (evt_) {
			case 'data':
				_on_data = fun_;
				break;
			case 'status':
				_on_status = fun_;
				break;
		};
	};

	var _start = function (id_, uri_, connect_timeout_, reconnect_interval_) {
		console.log('engine.io', id_, 'start', uri_);
		_id = id_;
		_uri = uri_;
		_connect_timeout = connect_timeout_;
		_reconnect_interval = reconnect_interval_;
		_connect();
	};
	
	_send.STATUS = _IO_STATUS;
	_send.start = _start;
	_send.exit = _exit;
	_send.on = _on;
	return _send;
};

var _sequence = function () {
	var seq = 0,
			size = 8,
			limit = Number(new Array(size + 1).join('9'));

	return function () {
		if (seq === limit) {
			seq = 0;
		};
		var s = (++seq).toString();
		if (s.length < size) {
			s = new Array(size - s.length + 1).join('0') + s;
		};
		return s;
	};
};

var _ping_timeout_policy = function (interval_, timeout_, on_ping_, on_timeout_) {
	var _timer = 0,
			_interval = interval_,
			_timeout = timeout_,
			_loop_interval = 300;
			
	var _last_ping_timestamp = 0, // 0 means not waiting pong
			_last_pong_timestamp = 0; // 0 means stopped
			
	var _on_ping = on_ping_,
			_on_timeout = on_timeout_;
	
	var _start = function () {
		_stop();
		_pong();
		console.log('ping', '_start');
		_timer = setTimeout(_on_timer, _loop_interval);
	};
	
	var _stop = function () {
		console.log('ping', '_stop');
		if (_timer !== 0) {
			setTimeout(_timer);
			_timer = 0;
			
			_last_pong_timestamp = 0;
		};
	};
	
	var _pong = function () {

		_last_ping_timestamp = 0;
		_last_pong_timestamp = Date.now();
	};
	
	var _on_timer = function () {
		var now = Date.now(),
				interval = now - _last_pong_timestamp,
				timeout = now - _last_ping_timestamp;

		if (_last_ping_timestamp === 0) { // waiting next interval
			if (interval > _interval) {
				_last_ping_timestamp = now;
				_on_ping();
			};
		} else { // waiting pong
			if (timeout > _timeout) {
				_last_pong_timestamp = 0; // wait start() call
				_on_timeout();
			};
		};
		
		if (_timer !== 0) {
			setTimeout(_timer);
			_timer = 0;
		};
		
		if (_last_pong_timestamp !== 0) {
			_timer = setTimeout(_on_timer, _loop_interval);
		};
	};
	
	_pong.start = _start;
	_pong.stop = _stop;
	return _pong;
};

/**
封裝_engine_io, 當start()一刻開始, _websocket保證連接可靠性
- 客戶端ping機制(不知server端的ping機制是否可讓client知道假連接)
- 當request超時返回失敗
- 保證用一時間只執行一個request
- 簡化_engine_io的狀態為on或off
- 協議封裝
*/
var _websocket = function (opt_) {
	var _uri = opt_.uri;
	
	var _io = null,
			_io_id = 0,
			_IO_PING = {
				REQ:'01040101',
				RES:'01040102'
			},
			_IO_STATUS = {
				'OFF': 0,
				'ON': 1
			},
			_io_status = _IO_STATUS.OFF,
			_io_connect_timeout = (typeof opt_.connect_timeout === 'undefined' ? 5000 : opt_.connect_timeout);
			_io_reconnect_interval = (typeof opt_.reconnect_interval === 'undefined' ? 1000 : opt_.reconnect_interval),
			_data_cb = (typeof opt_.data_cb === 'undefined' ? null : opt_.data_cb),
			_status_cb = (typeof opt_.status_cb === 'undefined' ? null : opt_.status_cb),
			_io_statistic = {
				open_count:0
			};
			
	var _ping_timeout = (typeof opt_.ping_timeout === 'undefined' ? 5000 : opt_.ping_timeout),
			_ping_interval = (typeof opt_.ping_interval === 'undefined' ? 5000 : opt_.ping_interval),
			_ping = _ping_timeout_policy(_ping_interval, _ping_timeout, function () {
				if (_io_status === _IO_STATUS.ON) {
					_io(_seq() + _IO_PING.REQ + '\0');
				};
			}, function () {
				console.log('websocket', 'ping timeout');
				_start();
			});

	var _req_timer = 0,
			_req_timeout = (typeof opt_.req_timeout === 'undefined' ? 10000 : opt_.req_timeout),
			_req_last_seq = 0, // 0 means not waiting response
			_req_last_cmd = null,
			_req_last_cb = null;

	var _seq = _sequence(),
			_RES_TYPE = {
				'ERR': 0,
				'RET': 1,
				'MSG': 2
			};
	
	var _buf = '';
	var _start = function () {
		console.log('websocket', 'start');
		_destroy(); // destroy io if exist
		_io = _engine_io();
		_io.start(_io_id, _uri, _io_connect_timeout, _io_reconnect_interval);

		_io.on('status', function (id_, err_, status_) {
			if (_io_id == id_) {
				var io_status = _io_status;
				if (status_ === _io.STATUS.CONNECTED) {
					_io_status = _IO_STATUS.ON;
				} else {
					_io_status = _IO_STATUS.OFF;
				};
						
				if (_io_status !== io_status) {
					if (_io_status === _IO_STATUS.OFF) {
						console.log('websocket', err_);
						_stop();
						_buf = '';
					} else {
						_io_statistic.open_count++;
						_ping.start();
					};
					
					console.log('websocket', _io_status === _IO_STATUS.ON ? 'on' : 'off');
					if (_status_cb) {
						// 讓外界控制io狀態
						_status_cb(_io_status, _io_statistic);
					};
				};
			};
		});

		_io.on('data', function (id_, raw_) {
			if (_io_id === id_) {
				_buf += raw_;

				var i = _buf.indexOf('\0'),
						responses = [];
				
				while (i !== -1) {
					responses.push(_buf.substring(0, i));
					_buf = _buf.substring(i + 1);
					i = _buf.indexOf('\0');
				};

				for (var i = 0; i < responses.length; i++) {
					var raw = responses[i];
					
					var res_seq = raw.substr(0, 8);
					raw = raw.substr(8);
					
					var res_type = parseInt(raw.substr(0, 1));
					raw = raw.substr(1);
					
					var res_cmd = raw.substr(0, 8);
					raw = raw.substr(8);

					if (res_cmd === _IO_PING.RES) {
						_ping();
					} else {
						switch (res_type) {
							case _RES_TYPE.ERR:
								var cb = _req_last_cb,
										res_err = raw.substr(0, 8);
								raw = raw.substr(8);
								
								_clear_req();
								cb(res_err, res_cmd, raw); // 待定2018-02-04
								break;
							case _RES_TYPE.RET:
								var cb = _req_last_cb;
								_clear_req();
								cb(null, res_cmd, raw);
								break;
							case _RES_TYPE.MSG:
								if (_data_cb) {
									_data_cb(res_cmd, raw);
								};
								break;
						};
					};
				};
			};
		});
	};
	
	var _destroy = function () {
		console.log('websocket', 'destroy');
		_destroy_io();
		_stop();
	};
	
	var _stop = function () {
		console.log('websocket', 'stop');
		_ping.stop();
		_cancel_req();
	};
	
	var _destroy_io = function () {
		_io_id++;
		_io_status = _IO_STATUS.OFF;
		if (_io !== null) {
			_io.exit();
			_io = null;
		};
	};

	var _cancel_req = function () {
		var seq = _req_last_seq,
				cmd = _req_last_cmd,
				cb = _req_last_cb;

		_clear_req();
		if (seq !== 0) {
			console.log('websocket', 'cancel request');
			cb(seq, cmd, null);
		};
	};
	
	var _clear_req = function () {
		if (_req_timer !== 0) {
			clearTimeout(_req_timer);
			_req_timer = 0;
		};
		
		_req_last_seq = 0;
		_req_last_cmd = null;
		_req_last_cb = null;
	};

	var _send = function (cmd_, data_, cb_) {
		if (_io_status === _IO_STATUS.ON) {
			_req_last_cmd = cmd_;
			_req_last_seq = _seq();
			_req_last_cb = cb_;
			
			_io(_req_last_seq + _req_last_cmd + data_ + '\0');
		};
	};
	
	_send.start = _start;
	return _send;
};