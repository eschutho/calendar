calendar
========

Calendar project that enters events by running a function.

This is a simple project that enters tasks into a calendar by calling the function layOutDay()
with an array of objects that have the properties start and end. 
e.g., layOutDay([ {start: 30, end: 150}, {start: 540, end: 600}, {start: 560, end: 620}, {start: 610, end: 670} ]);

The value of these attributes is the number of minutes since 9am. So {start:30, end:90) represents an event from 9:30am to 10:30am. 
