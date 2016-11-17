var initFile = {
	"Machines": {
		"battery": {
			"price": {
				"metal": 10,
			},
			"capacity": {
				"power": 100,
			},
			"count":0,
		},
		"solarcell": {
			"price": {
				"metal": 10,
			},
			"output": {
				"power": 1,
			},
			"count":0,
		},
		"airtank": {
			"price": {
				"metal": 10,
			},
			"capacity": {
				"air": 100,
			},
			"count":0,
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
			"count":0,
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
			"count":0,
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
		"power": {
			"baseCapacity": 100,
		},
		"air": {
			"baseCapacity": 100,
		},
		"metal": {
			"baseCapacity": 100,
			"value": 20,
		},
		"water": {
			"baseCapacity": 100,
			"value": 20,
		},
		"wastewater": {
			"value": 20,
		},
	},
};