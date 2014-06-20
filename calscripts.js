var layOutDay = (function (){
	var eventValues = (function() {
		var allEventsObject = {}; //store this value in the closure
		//each event contains the following properties: width, left, id, start, and end and the event id is the property name of the object
		/*for example {
			P34323: {
				width: 20,
				left: 40,
				id: P34323,
				start: 60,
				end: 180
			}
		}
		*/

		return {
			getEvents: function() {
				return allEventsObject;
			},
			addEvent: function(eventID, eventValues) {
				allEventsObject[eventID] = eventValues;
			},
			updateProperty: function(property, key, value) {
				allEventsObject[property][key] = value;
			}
		};

	})();
	var fn = {
		checkConflicts: function() {
			//** "this" refers to a new event

			var eventObject, //eventObject is a singular event eg:{start:60, end: 180}
          singularEvent,
				noConflictArray = [],
				allEventsObject = eventValues.getEvents();
			
			//reset storage arrays
			fn.conflictArray.length = 0;
			fn.widthArray.length = 0;
			fn.leftArray.length = 0;
			fn.secondaryConflicts.length = 0;
			fn.secondaryWidths.length = 0;

			//loop through events to find conflicts
			for(singularEvent in allEventsObject) {
				if(allEventsObject.hasOwnProperty(singularEvent)) {
					eventObject = allEventsObject[singularEvent];

					//if true, this object conflicts with the new event
					if(eventObject.start < this.end && eventObject.end > this.start) {
						
						//store the object, its width, and left positions for later
						fn.conflictArray.push(eventObject);
						fn.leftArray.push(eventObject.left);
						fn.widthArray.push(eventObject.width);
					}
					else {
						noConflictArray.push(eventObject);
					}
				}
			}
			var checkSecondary = function(conflict) {
				for (var j = 0; j < noConflictArray.length; j++) {
					//if true, this object conflicts with the existing object
					if(conflict.start < noConflictArray[j].end && conflict.end > noConflictArray[j].start) {
						fn.secondaryConflicts.push(noConflictArray[j]);
						fn.secondaryWidths.push(noConflictArray[j].width);
					}
				}
			};
			//check for secondary conflicts
			for(var i = 0; i < fn.conflictArray.length; i ++){
				checkSecondary(fn.conflictArray[i]);
			}
			fn.setWidthsAndPositions.init.call(this);	
		},
		setWidthsAndPositions: {
			//see if you can find space somewhere. 
			lookForSpace: function(eventWidth){
				var endPosition,
				lastEvent;

				//sort left values to get the first left
				fn.leftArray.sort(function (a,b) {
					return a-b;
				});
				
				//if there's room in the front, put it there first and nothing else needs to be adjusted
				if(fn.leftArray[0] > 0) {
					this.left = 0;
					return true;
				}
				//see if there's room in between two events
				//do a sanity check before looping through everything
				if((eventWidth * fn.leftArray.length) < 600) {
					for(var i = 0; i < fn.leftArray.length - 1; i++) {
						endPosition = fn.leftArray[i] + eventWidth;
						//if the two left points in sequence aren't the same, and if gap between the next two events is large enough to fit in
						if (fn.leftArray[i] !== fn.leftArray[i+1] && fn.leftArray[i+1] - endPosition > eventWidth  ) {
							this.left = endPosition;
							return true;
						}
					}
				}
				//see if there's room at the end
				lastEvent = fn.leftArray[fn.leftArray.length - 1];
				endPosition = lastEvent + eventWidth;
				if(endPosition + eventWidth <= 600 ) {
					this.left = endPosition;
					return true;
				}
				return false;
			},
			//see if all widths of all conflicts are the same
			checkEqualWidths: function(allWidths) {
				//since the values are sorted, if the first equals the last value, then they're all the same
				if(allWidths[0] === allWidths[allWidths.length -1])
				return true;
			},
			adjustAllWidths: function(allWidths, allConflicts) {
				var conflictedObject,
					leftPosition,
					newWidth,
					eventWidth;

				//sort width values to get the shortest one
				allWidths.sort(function (a,b) {
					return a-b;
				});

				//set width for new  object
				newWidth = Math.floor(600/(Math.floor(600/allWidths[0]) + 1));
				this.width = newWidth;

				//reset left array
				fn.leftArray.length = 0;

				for (var i=0; i < allConflicts.length; i++) {
					conflictedObject = allConflicts[i];

					//adjust width and left position of existing objects
					leftPosition =  (Math.floor(conflictedObject.left/conflictedObject.width)) * newWidth;
					fn.leftArray.push(leftPosition);
					eventWidth = newWidth;
					$("#"+conflictedObject.id).css({"width": eventWidth+"px", "left": leftPosition+"px"});

					//update the existing object's width and left position in storage
					eventValues.updateProperty(conflictedObject.id, "width", eventWidth);
					eventValues.updateProperty(conflictedObject.id, "left", leftPosition);
				}
				//sort left values
				fn.leftArray.sort(function (a,b) {
					return a-b;
				});

				this.left =  fn.leftArray[fn.leftArray.length - 1] + newWidth;
			},
			init: function() {
				var allConflicts,
					allWidths,
					isEqual,
					hasSpace;

				//if there are conflicts, all widths and positions need to be adjusted
				if(fn.conflictArray.length > 0) {

					//combine all conflicts
					allConflicts = fn.conflictArray.concat(fn.secondaryConflicts);
					allWidths = fn.widthArray.concat(fn.secondaryWidths);

					//sort Widths
					//sort left values to get the first left
					allWidths.sort(function (a,b) {
						return a-b;
					});

					//check properties and assign to variables to hold. Don't check equality if there's only one value.
					allConflicts.length > 1 ? isEqual = fn.setWidthsAndPositions.checkEqualWidths(allWidths) : isEqual = false;

					//don't bother to check for space if the widths aren't equal
					isEqual === true ? hasSpace = fn.setWidthsAndPositions.lookForSpace.call(this, allWidths[0]) : hasSpace = false;

					//if the widths are the same, look for space, if they aren't the same or there is no space then adjust all widths.
					if (allConflicts.length === 1 || isEqual === false || hasSpace === false || (isEqual === true && hasSpace === false)) {
						fn.setWidthsAndPositions.adjustAllWidths.call(this, allWidths, allConflicts);	
						
					} else if (isEqual === true && hasSpace === true) {
						//set width for event
						this.width = allWidths[0];
					} 

				} else {
					this.width = 600;
					this.left = 0;
				}
				fn.saveNewEvent.call(this);
			}
		},
		saveNewEvent: function() {	
			this.id = "P"+Math.floor((Math.random() * 10000) + 1); 
			eventValues.addEvent(this.id,this);
			fn.createNewEvent.call(this);
		},
		createNewEvent: function() {
			var eventHeight = this.end - this.start,
				eventLeft = this.left,
				eventTop = this.start,
				eventWidth = this.width,
				eventElement = 
				"<div class=\"events\" style=\"top:"+ eventTop + "px; height:" + eventHeight + "px; left:" + eventLeft +"px; width:" + eventWidth + "px; display: none;\" id=\"" + this.id + "\">" +
				"<span class=\"bar\"></span>"+
				"<div class=\"event-contents\">"+
				"<h5>Sample Item</h5>" +
				"<p>Sample Location</p>" +
				"</div></div>";
			$("#EventsContainer").append(eventElement);

			//add a different style if the box is too small
			if (eventHeight < 45 && eventHeight > 30) {
				$("#"+this.id+" .event-contents").addClass("small");
			}
			if (eventHeight <= 30 && eventHeight > 20) {
				$("#"+this.id+" .event-contents").addClass("very small");
			}
			if (eventHeight <= 20) {
				$("#"+this.id+" .event-contents").addClass("super small");
			}
			fn.showElements(this.id);
		},
		showElements: function(id) {
			$("#"+id).fadeIn();
		},
		init: function(events) { //arg: events is an array of objects eg: [{start:60, end: 180}, {start: 300, end 330}]
			//set object properties for storage
			fn.conflictArray = [];
			fn.widthArray = [];
			fn.leftArray = [];
			fn.secondaryConflicts = [];
			fn.secondaryWidths = [];
			
			//loop through events in array and add them to the page
			for (var i=0; i < events.length; i++) {
				fn.checkConflicts.call(events[i]);
			}
		}
	};
	return function(events) {
		//make a copy of the object so that there are no conflicts
		var calendar = Object.create(fn);
		calendar.init(events);
	};
})();

//events: 9:30AM - 11:30AM, 6:00PM - 7:00PM, 6:20PM - 7:20PM, and 7:10PM - 8:10PM
layOutDay([ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);
