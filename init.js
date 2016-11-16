var initFile = {
	"Machines": {
		"battery": {
			"price": {
				"metal": 10,
			},
			"capacity": {
				"power": 100,
			},
			"count":1,
		},
		"solarcell": {
			"price": {
				"metal": 10,
			},
			"output": {
				"power": 1,
			},
			"count":1,
		},
		"airtank": {
			"price": {
				"metal": 10,
			},
			"capacity": {
				"air": 100,
			},
			"count":1,
		},
		"airfilter": {
			"price": {
				"metal": 10,
			},
			"input": {
				"power": 1,
			},
			"output": {
				"air":1,
			},
			"count":0,
		},
		"watertank": {
			"price": {
				"metal": 10,
			},
			"capacity": {
				"water": 100,
			},
			"count":1,
		},
		"waterfilter": {
			"price": {
				"metal": 10,
			},
			"input": {
				"power": 1,
				"wastewater": 1,
			},
			"output": {
				"water": 1,
			},
			"count":0,
		},
		"metalstorage": {
			"price": {
				"metal": 10,
			},
			"capacity":{
				"metal":100,
			},
			"count":1,
		},
		"metalcollector": {
			"price": {
				"metal": 10,
			},
			"input": {
				"power": 1,
			},
			"output": {
				"metal": 1,
			},
			"count":0,
		},
	},
	"Containers": [
		"battery",
		"airtank",
		"watertank",
		"metalstorage",
	],
	"Converters": [
		"solarcell",
		"airfilter",
		"waterfilter",
		"metalcollector",
	],
	"Resources":{
		"metal": 20,
		"water": 20,
		"wastewater": 20,
	},
};