String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

function toFixed(value, precision = 2) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
}

function fastFloor(value){
    return ~~value;
}

window.onload = function() {

    var Elements = {
        // btnSave: document.querySelector(".save"),
        // btnDeleteSave: document.querySelector(".delete-save"),

        txtPower: document.querySelector("#res-power"),
        txtPowerIncome: document.querySelector("#res-power-income"),

        txtWater: document.querySelector("#res-water"),
        txtWaterIncome: document.querySelector("#res-water-income"),

        txtWastewater: document.querySelector("#res-wastewater"),
        txtWastewaterIncome: document.querySelector("#res-wastewater-income"),

        txtAir: document.querySelector("#res-air"),
        txtAirIncome: document.querySelector("#res-air-income"),

        txtMetal: document.querySelector("#res-metal"),
        txtMetalIncome: document.querySelector("#res-metal-income"),

        divUpgrades: document.querySelector("#upgrades"),

        barPower: document.querySelector("#res-power-progress .progress-bar"),
        barLabelPower: document.querySelector("#res-power-progress .progress-bar-label"),

        barWater: document.querySelector("#res-water-progress .progress-bar:nth-of-type(2)"),
        barWastewater: document.querySelector("#res-water-progress .progress-bar:nth-of-type(1)"),
        barLabelWater: document.querySelector("#res-water-progress .progress-bar-label"),
        
        barAir: document.querySelector("#res-air-progress .progress-bar:nth-of-type(1)"),
        barWasteair: document.querySelector("#res-air-progress .progress-bar:nth-of-type(2)"),
        barLabelAir: document.querySelector("#res-air-progress .progress-bar-label"),

        barMetal: document.querySelector("#res-metal-progress .progress-bar"),
        barLabelMetal: document.querySelector("#res-metal-progress .progress-bar-label"),

        nav: document.getElementsByClassName('.nav.nav-tabs'),
        navTabs: document.querySelectorAll('.nav-tabs > li'),
        allTabPane: document.querySelectorAll('.tab-content > .tab-pane'),
    };

    // Elements.btnSave.addEventListener('click', function(evt) {
    //     save();
    // });

    var textTemplates = {
        resourceValue: '{0}/{1}',
        resourceIncome: '({0}{1})', // {0} is the sign +/-
        percent: '{0}%',
    };

    var Machine = {
        init: function(name, price) {
            this.name = name;
            this.count = 0;
            this.price = price;
            this.asContainer = function(capacity){
                this.capacity = capacity;
                this.getCapacity = function(resource) {
                    if(resource.name in this.capacity){
                        return this.count * this.capacity[resource.name];
                    }
                    return 0;
                };
                return this;
            };
            this.asConverter = function(input={},output={}){
                this.input = input;
                this.output = output;
                this.getInput = function(resource) {
                    if(resource.name in this.input){
                        var usable = this.getUsableCount();
                        return usable * this.input[resource.name];
                    }
                    return 0;
                };
                this.getOutput = function(resource) {
                    if(resource.name in this.output){
                        var usable = this.getUsableCount();
                        return usable * this.output[resource.name];
                    }
                    return 0;
                };
                this.getUsableCount = function(){
                    if (this.count > 0){
                        var usable = Infinity;
                        for(var key in this.input){
                            var value = Resources[key].value;
                            var input = this.input[key];
                            var count = this.count;
                            usable = Math.min(usable,Math.min(count,fastFloor(value/input)));
                        }
                        for(var key in this.output){
                            var value = Resources[key].value;
                            var capacity = Resources[key].getCapacity();
                            var output = this.output[key];
                            var count = this.count;
                            usable = Math.min(usable,Math.min(count,fastFloor((capacity-value)/output)));
                        }
                        // usable should be less than Infinity here
                        return usable;
                    }
                    return 0;
                };
                this.updateState = function(){
                    if (this.count > 0){
                        var usable = this.getUsableCount();
                        if(usable > 0){
                            for(var key in this.input){
                                Resources[key].addValue(-usable * this.input[key]);
                            }
                            for(var key in this.output){
                                Resources[key].addValue(usable * this.output[key]);
                            }
                        }
                    }
                };
                return this;
            };
            this.canBuy = function(amount = 1) {
                for (var key in this.price) {
                    if (Resources[key].value < this.price[key] * amount) {
                        return false;
                    }
                }
                return true;
            };
            this.buy = function(amount = 1) {
                if (this.canBuy(amount)) {
                    var price = this.price;
                    for(var key in price){
                        Resources[key].addValue(-price[key] * amount);
                    }
                    // Clear cached values as buying a machine might change these
                    clearResourceCaches();
                    this.count+=amount;
                    update();
                }
            };
            this.updateUi = function(){
                if(this.hasOwnProperty('ui')){
                    console.log(this.ui.buy.disabled);
                    this.ui.buy.className += 'disabled';
                }
            };
            return this;
        },
    };

    var Resource = {
        init: function(name, value = 0) {
            this.name = name;
            this.value = value;
            this.baseCapacity = 0;
            this.baseIncome = 0;
            this.clearCache();
            
            return this;
        },
        getIncome: function() {
            if (this.income == null){
                var income = this.baseIncome;
                var converters = Converters;
                for(var mac in converters){
                    mac = converters[mac];
                    income += mac.getOutput(this);
                    income -= mac.getInput(this);
                }
                this.income = income;
            }
            return this.income;
        },
        getCapacity: function() {
            if (this.capacity == null){
                var capacity = this.baseCapacity;
                var containers = Containers;
                for(var mac in containers){
                    mac = containers[mac];
                    capacity += mac.getCapacity(this);
                }
                this.capacity = capacity;
            }
            return this.capacity;
        },
        addValue: function(amount){
            var cap = this.getCapacity();
            this.value = Math.min(cap,Math.max(0,this.value + amount));
            this.updateUi();
            updateMachineUi();
        },
        clearCache: function(){
            this.income = null;
            this.capacity = null;
        },
        updateUi: function(){
            if(this.hasOwnProperty('ui')){
                var income = this.getIncome();
                this.ui.value.textContent = textTemplates.resourceValue.format(toFixed(this.value),toFixed(this.getCapacity()));
                this.ui.income.textContent = textTemplates.resourceIncome.format(income>=0?'+':'',toFixed(income));
                this.updateBar();
            }
        },
        updateBar: function(){
            if(this.hasOwnProperty('ui')){
                var capacity = this.getCapacity();
                var percent = (capacity <= 0) ? 0 : (this.value / capacity * 100);
                this.ui.label.textContent = textTemplates.percent.format(toFixed(percent));
                this.ui.bar.style.height = textTemplates.percent.format(toFixed(percent));
            }
        },
    };

    var Resources = {
        power: Object.create(Resource).init('power'),
        water: Object.create(Resource).init('water'),
        wastewater : Object.create(Resource).init('wastewater'),
        air: Object.create(Resource).init('air'),
        metal: Object.create(Resource).init('metal'),
        dust: Object.create(Resource).init('dust'),
    };

    Resources.wastewater.getCapacity = function(){
        if (this.capacity == null){
            this.capacity = Resources.water.getCapacity();
        }
        return this.capacity;
    };

    Resources.power.ui = {
        value: Elements.txtPower,
        income: Elements.txtPowerIncome,
        bar: Elements.barPower,
        label: Elements.barLabelPower,
    };

    Resources.water.ui = {
        value: Elements.txtWater,
        income: Elements.txtWaterIncome,
        bar: [Elements.barWater, Elements.barWastewater],
        label: Elements.barLabelWater,
    };
    Resources.water.updateBar = function(){
        if(this.hasOwnProperty('ui')){
            var waste = Resources.wastewater;
            var waterCapacity = this.getCapacity();
            var waterPercent = (waterCapacity <= 0) ? 0 : (this.value / waterCapacity * 100);
            var wastePercent = (waterCapacity <= 0) ? 0 : (waste.value / waterCapacity * 100);
            this.ui.label.textContent = '{0}%'.format(toFixed(waterPercent+wastePercent));
            this.ui.bar[0].style.height = textTemplates.percent.format(toFixed(waterPercent));
            this.ui.bar[1].style.height = textTemplates.percent.format(toFixed(wastePercent));
        }
    };
    Resources.wastewater.ui = {
        value: Elements.txtWastewater,
        income: Elements.txtWastewaterIncome,
    };
    Resources.wastewater.updateBar = function(){
        Resources.water.updateBar();
    };

    Resources.air.ui = {
        value: Elements.txtAir,
        income: Elements.txtAirIncome,
        bar: [Elements.barAir, Elements.barWasteair],
        label: Elements.barLabelAir,
    };
    // Override air's method
    Resources.air.updateBar = function(){
        if(this.hasOwnProperty('ui')){
            var capacity = this.getCapacity();
            var percent = (capacity <= 0) ? 0 : (this.value / capacity * 100);
            this.ui.label.textContent = textTemplates.percent.format(toFixed(percent));
            this.ui.bar[0].style.height = textTemplates.percent.format(toFixed(percent));
            this.ui.bar[1].style.height = textTemplates.percent.format(toFixed(100-percent));
        }
    };
    Resources.metal.ui = {
        value: Elements.txtMetal,
        income: Elements.txtMetalIncome,
        bar: Elements.barMetal,
        label: Elements.barLabelMetal,
    };

    var Machines = {}
    var Containers = [];
    var Converters = [];

    function init(){
        // initFile is loaded via html before this file
        for(var key in initFile.Containers){
            var name = initFile.Containers[key];
            var machine = initFile.Machines[name];
            var container = Object.create(Machine).init(name,machine.price).asContainer(machine.capacity);
            Containers.push(container);
            Machines[name] = container;
            container.count = machine.count;
        }
        for(var key in initFile.Converters){
            var name = initFile.Converters[key];
            var machine = initFile.Machines[name];
            var converter = Object.create(Machine).init(name,machine.price).asConverter(machine.input,machine.output);
            Converters.push(converter);
            Machines[name] = converter;
            converter.count = machine.count;
        }
        for(var key in initFile.Resources){
            var value = initFile.Resources[key];
            Resources[key].value = value;
        }
    }

    function clearResourceCaches(){
        for(var key in Resources){
            Resources[key].clearCache();
            Resources[key].updateUi();
        }
    }

    function updateResourceUi(){
        for(var key in Resources){
            if (Resources[key].hasOwnProperty('updateUi')){
                Resources[key].updateUi();
            }
        }
    }

    function updateMachineUi(){
        for(var key in Machines){
            if (Machines[key].hasOwnProperty('updateUi')){
                Machines[key].updateUi();
            }
        }
    }

    function setupUi(){
        // Dynamic tabs setup
        for(var i = 0; i < Elements.navTabs.length; i++){
            Elements.navTabs[i].addEventListener('click', function(event){
                var panes = Elements.allTabPane;
                // removing .active class
                for(var p = 0; p < panes.length; p++){
                    panes[p].className = 'tab-pane';
                }
                // removing .active from navtabs
                for(var n = 0; n < Elements.navTabs.length; n++){
                    Elements.navTabs[n].className = '';
                }

                // making the clicked tab-pane active
                this.className = 'active';
                var linkPane = this.getElementsByTagName('a')[0].getAttribute('href');
                var pane = document.querySelector(linkPane);
                pane.className = 'tab-pane active';
            });
        }
        document.getElementById('tab-planet').style.display = 'none';

        // Button eventlisteners
        var machinePanels = document.querySelectorAll('.panel-machine');
        for(var i = 0; i < machinePanels.length; i++){
            var panel = machinePanels[i];
            var label = panel.querySelector('.machine-label');
            var buttonBuy = panel.querySelector('.btn-buy');
            // var buttonUpgrade = machinePanels[i].querySelector('.btn-upgrade');
            machineName = panel.id.split('-').pop();
            Machines[machineName].ui = {
                panel: panel,
                label: label,
                buy: buttonBuy,
            };

            // Hack to create onclick function with local variable
            buttonBuy.onclick = function(machineName){
                return function(){Machines[machineName].buy()};
            }(machineName);
        }

        // Save/Delete game buttons
        document.querySelector('#save-button').onclick = function(){
            saveGame();
        };
        document.querySelector('#delete-save-button').onclick = function(){
            deleteSaveGame();
        };
    }

    function setup(){
        init();
        setupUi();
    };

    function update(){
        clearResourceCaches();
        for(var key in Converters){
            Converters[key].updateState();
        }
        updateResourceUi();
        updateMachineUi();
    }

    var gameFileName = 'terraform_save';

    function saveGame(){
        var gameFile = {
            Resources: {},
            Machines: {},
        };
        
        for(var key in Resources){
            var resource = Resources[key];
            gameFile.Resources[key] = ['name','value','baseCapacity'].reduce(function(o, k) { o[k] = resource[k]; return o; }, {});
        }
        for(var key in Machines){
            var machine = Machines[key];
            gameFile.Machines[key] = ['name','count','capacity','price','input','output'].reduce(function(o, k) { o[k] = machine[k]; return o; }, {});
        }
        localStorage.setItem(gameFileName,JSON.stringify(gameFile));
    }

    function loadGame(){
        var gameFile = localStorage.getItem(gameFileName);
        if (gameFile != null){
            gameFile = JSON.parse(gameFile);
            for(var key in gameFile.Resources){
                var savedResource = gameFile.Resources[key];
                var resource = Resources[key];
                for(var k in savedResource){
                    if (resource.hasOwnProperty(k)){
                        resource[k] = savedResource[k];
                    }
                }
            }
            for(var key in gameFile.Machines){
                var savedMachine = gameFile.Machines[key];
                var machine = Machines[key];
                for(var k in savedMachine){
                    if (machine.hasOwnProperty(k)){
                        machine[k] = savedMachine[k];
                    }
                }
            }
        }
    }

    function deleteSaveGame(){
        localStorage.removeItem(gameFileName);
    }

    function main(){
        setup();

        loadGame();

        window.gameLoop = function () {
            update();
            setTimeout('window.gameLoop();', 1000);
        }

        window.saveGame = saveGame;

        setInterval('window.saveGame();',10000);
        
        window.gameLoop();
    }

    main();
};

