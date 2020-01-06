var $config = {
	model:{
		table:[2801, 2802, 2803, 2804, 2805, 2806, 2807, 2808, 2809, 2810, 2811, 2812],
		http:19012,	// default request channel
		ws:'127.0.0.1:80',				// use websocket or not
		cambodia:0,	// combodia with keyboard shoe 
		vietnam:0,	// vietnam use moxa socket shoe
		russia:0		// use serialport to websocket shoe
	},	
	limit:[
		{limit_min:50000, limit_max:10000000, tie_min:10000, tie_max:1250000, pair_min:10000, pair_max:900000   },
		{limit_min:100000, limit_max:20000000, tie_min:50000, tie_max:2500000, pair_min:50000, pair_max:1800000 },
		{limit_min:300000, limit_max:30000000, tie_min:50000, tie_max:3750000, pair_min:50000, pair_max:2700000 },
		{limit_min:500000, limit_max:50000000, tie_min:50000, tie_max:10000000, pair_min:50000, pair_max:5000000 },
		{limit_min:3000000, limit_max:100000000, tie_min:50000, tie_max:20000000, pair_min:50000, pair_max:10000000 },
		{limit_min:2000000, limit_max:80000000, tie_min:50000, tie_max:16000000, pair_min:50000, pair_max:8000000 },
		{limit_min:5000000, limit_max:120000000, tie_min:500000, tie_max:24000000, pair_min:500000, pair_max:12000000 },
		{limit_min:8000000, limit_max:150000000, tie_min:500000, tie_max:30000000, pair_min:500000, pair_max:15000000 },
		{limit_min:10000000, limit_max:200000000, tie_min:500000, tie_max:40000000, pair_min:500000, pair_max:20000000 },
		{limit_min:15000000, limit_max:300000000, tie_min:500000, tie_max:60000000, pair_min:500000, pair_max:30000000 },
		{limit_min:60000, limit_max:10000000, tie_min:10000, tie_max:1250000, pair_min:10000, pair_max:900000   },
		{limit_min:600000, limit_max:20000000, tie_min:50000, tie_max:2500000, pair_min:50000, pair_max:1800000 },
		{limit_min:600000, limit_max:30000000, tie_min:50000, tie_max:3750000, pair_min:50000, pair_max:2700000 },
		{limit_min:600000, limit_max:50000000, tie_min:50000, tie_max:10000000, pair_min:50000, pair_max:5000000 },
		{limit_min:6000000, limit_max:100000000, tie_min:50000, tie_max:20000000, pair_min:50000, pair_max:10000000 },
		{limit_min:6000000, limit_max:80000000, tie_min:50000, tie_max:16000000, pair_min:50000, pair_max:8000000 },
		{limit_min:6000000, limit_max:120000000, tie_min:500000, tie_max:24000000, pair_min:500000, pair_max:12000000 },
		{limit_min:6000000, limit_max:150000000, tie_min:500000, tie_max:30000000, pair_min:500000, pair_max:15000000 },
		{limit_min:60000000, limit_max:200000000, tie_min:500000, tie_max:40000000, pair_min:500000, pair_max:20000000 },
		{limit_min:65000000, limit_max:300000000, tie_min:500000, tie_max:60000000, pair_min:500000, pair_max:30000000 },
		{limit_min:70000, limit_max:10000000, tie_min:10000, tie_max:1250000, pair_min:10000, pair_max:900000   },
		{limit_min:700000, limit_max:20000000, tie_min:50000, tie_max:2500000, pair_min:50000, pair_max:1800000 },
		{limit_min:700000, limit_max:30000000, tie_min:50000, tie_max:3750000, pair_min:50000, pair_max:2700000 }

	],	
	limit_page:{
		default_page: 1,
		per_page: 10
	},
	controller:{
	},
	view:{
		ratio:{											// height ratio of header, road, bottom, footer(remain percentage)
			header:15,
			road:55,
			bottom:25
		},
		border:{
			big:3,										// border(px) between big & down
			eye:3,
			down:3										// border(px) between down & bottom
		},
		header:{
			head:{
				width:98,								// width ratio of header's content
				height:80								// height ratio of header's content
			},
			bet_limit:{
				ratio:65,								// width ratio of header>head>bet_limit
				font:{									// base on header's content height, percent of font size.
					title:30,
					text:60,
					space:10,
					min_space:3,
					max_space:3
				}
			},
			other_limit:{
				title:30,
				text:30,
				space:3					
			}
		},
		big:{
			line:3
		},
		down:{
			line:3		
		},
		bead:{
			line:1
		},
		game:{
			width:95,
			ratio:{
				td:{
					height:17,
					width:60
				},
				cnt:20
			},
			font:{
				game:70,
				title:45,
				text:60
			}
		},
		ask:{
			width:95,
			ratio:80,
			shoe:{
				title:50,
				text:50,
				ratio:70
			}
		},
		logo:{
			ratio:20
		},
		bottom:{
			border:{
				bead:3,
				game:3,
				ask:3
			},
			ratio:{
				game:15,
				ask:10,
				logo:25
			}	
		},
		bgcolor:'#000000',
		timer:3000
	},
	websocket:{
		connect_timeout:5000,
		reconnect_interval:1000,
		ping_timeout:5000,
		ping_interval:5000		
	}
};
