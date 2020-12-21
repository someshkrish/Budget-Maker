// BudgerController module
var budgetController = (function (){
    //private
    //function constructors
    var expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    expense.prototype.calcpercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    expense.prototype.getpercentage = function(){
        return this.percentage;
    }

    var income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum; 
    };
    var data = {
        allItems : {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1
    };
 
    //public
    return{
        addItem : function(type, des, value){
            var newItem, ID;

            //id = lastid + 1;
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            } else {
                ID = 0;
            }

            //creating new item based on "inc" or "exp"
            if(type === "inc"){
                newItem = new income(ID, des, value);
            } else if(type === "exp"){
                newItem = new expense(ID, des, value);
            }

            //Pushing the newly created item into the data structure
            data.allItems[type].push(newItem);

            //Return the newly created item 
            return newItem;
        },

        deleteItem: function(type, id) {
              //creating an array of the ids of the data in expenses or income array.
              //map() returns an array of the mapped items. It also have the access to currentElement, element's index and the entire array.
              //indexOf() returns the index of the element we want.
              var ids, index;

              ids = data.allItems[type].map(function(current){
                  return current.id;
              });

              // id is the element which we want to delete whose index in the ids array is stored in the index variable.
              index = ids.indexOf(id);

              if(index !== -1) {
                  // splice(index from which the removal has to be initiated, length of the segment starting from the index to be removed).
                  //In the below case 1 is the length of the data to be removed which is at the position index.
                  data.allItems[type].splice(index,1);
              }
        },

        //First calculate the percentage  for each expense and store it in the this.percentage method.
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcpercentage(data.totals.inc);
            });
        },

        //Second we return the percentage of each expense and store it in a separate array and return it.
        getPercentages : function(){
            var allperc = data.allItems.exp.map(function(cur){
                return cur.getpercentage();
            });
            return allperc;
        },

        calculateBudget : function(){
            //1. Calulate the total income and expenses
            calculateTotal("inc");
            calculateTotal("exp");

            //2. Calculate the budget income-expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        getBudget : function(){
            //To return more than one value we return it like an object
            return{
                budget: data.budget,
                income: data.totals.inc,
                expense: data.totals.exp,
                percentage: data.percentage
            }
        }
    };
})();
      
// UIController module
var uiController = (function (){
    //private
    //For making the naming less redundant to errors 
    var DOMstrings = {
        expensesContainer: ".expenses__list",
        inputDescription : ".add__description",
        incomeContainer  : ".income__list",
        inputValue       : ".add__value",
        inputType        : ".add__type",
        inputBtn         : ".add__btn",
        budgetLabel      : ".budget__value",
        incomeLabel      : ".budget__income--value",
        expensesLabel    : ".budget__expenses--value",
        percentageLabel  : ".budget__expenses--percentage",
        container        : ".container",
        expensesPercentageLabel   : ".item__percentage",
        dateLabel        : ".budget__title--month"
    };

    var formatNumber = function(num, type){
        var numSplit, int, dec, len;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        len = int.length;
        if(len>6 && len <=9){
            int = int.substr(0,int.length-6) + "," + int.substr(int.length-6, 3) + "," + int.substr(int.length-3, 3); 
        } else if(len>3 && len<=6){
            int = int.substr(0,int.length-3) + "," + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+')+ ' ' + int + '.' + dec;
    };

    var nodeListForEach = function(list, callback){
        for(var i=0; i<list.length; i++){
            callback(list[i], i);
        }
    };

    //public
    return{
        getinput: function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc for income or exp for expenses
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type){
            var html, newHtml, element;
            //Create a HTML string with some placeholder text(%id%,%description%,%value%)
            if(type === "inc"){
                element = DOMstrings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            else if(type === "exp"){
                element = DOMstrings.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace the placeholder text with the real data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML text into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorId){
            //In javascript we can't delete an element in DOM we can only delete the child element so we have to move upwards to find the parent element.

            //el is the element to be removed
            var el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);

        },

        clearFields : function() {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + "," + DOMstrings.inputValue);

            //Since fields is a list we can't use the methods availabe for arrays to it so we convert that into arrays 
            //We know that slice will return a shallow copy of an array from starting index to end index
            //So we pass the list to that but it can't accept list as a parameter
            //So we use call() method to bind it to that

            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index,array){
                //clearing the value//3. Add the newItem to the UI
      
                current.value = "";
            });

            //Making the focus to come back to the description again
            fieldsArr[0].focus();
        },

        displayBudget : function(obj) {
            var type;

            obj.budget>0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.income, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.expense,'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";            
            }
        },

        displayPercentages: function(percentages){
            //Now fields have a node list because each HTML element is called as a node.
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            // var nodeListForEach = function(list, callback){
            //     for(var i=0; i<list.length; i++){
            //         //the call back function definition is defined when the nodeListForEach function is called below.
            //         callback(list[i], i);
            //     }
            // };

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function() {
            var now, month, year, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = month + ' ' + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ','+
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(cur) {
                  cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings : function() {
            return DOMstrings;
        }
    };
})();

// Controller module
var controller = (function(bgtctrl, uictrl){
  //This function is used to add all the initialization and event listeners to the application.
  var setupEventlistener = function(){
    var DOM = uiController.getDOMstrings();

    document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);
    
    document.addEventListener("keypress",function(event){
      if(event.key === "Enter"){
          ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', uictrl.changedType);
  };
  
  var updateBudget = function(){
      //1. Calculate the budget
      bgtctrl.calculateBudget();

      //2. Return the budget
      var budget = bgtctrl.getBudget();

      //3. Display the budget on the UI
      uictrl.displayBudget(budget);
  };

  var updatePercentage = function(){
      //1. Calculate percentage
      bgtctrl.calculatePercentages();;
      
      //2. Read percentages from the budget controller
      var percentages = bgtctrl.getPercentages();
      
      //3. Update the UI with the new peercentages
      uictrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function(){
    var input, newItem;

      //1. Get the field input data
      input = uictrl.getinput();

      if(input.description !== "" && !isNaN(input.value) && input.value>0) {
          //2. Add the item to the budget controller
          newItem = bgtctrl.addItem(input.type, input.description, input.value);
      
          //3. Add the newItem to the UI
          uictrl.addListItem(newItem, input.type);
          
          //4. Removing the description and value
          uictrl.clearFields();

          //5. Calculate and update ui
          updateBudget();

          //6. Calculate and Update Percentage
          updatePercentage();
      } else {
          alert("Please enter a valid description and value.");
      }
    }; 

    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        //traversing the DOM to get the id (eg., inc-0, exp-0, inc-1, exp-1 etc.,)
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            //inc-1
            splitID = itemID.split('-')
            type = splitID[0];
            ID = parseInt(splitID[1]);//parseInt() -> converts a string to integer

            //1. delete the item from the data structure
            bgtctrl.deleteItem(type, ID);

            //2. delete the item from the UI
            uictrl.deleteListItem(itemID);

            //3. update and show the new budget
            updateBudget();

            //4. Calculate and Update percentages
            updatePercentage();
        }

    };
  //public return object
  return{
      init: function(){
          console.log("Application is started...");
          uictrl.displayMonth();
          uictrl.displayBudget({
              budget: 0,
              income: 0,
              expense: 0,
              percentage: -1
          });
          setupEventlistener();
      }
  };
})(budgetController, uiController);

controller.init();