$("document").ready(function() {
	//Get and add all Employee rows from the Employee table to the dom
	getEmployees();

	$("#employeeForm").on("submit", function(event) {
		event.preventDefault();

		// this is what we send to the server in a post
		var newEmployee = {};

		// this is going to loop over each field in the form and for each field it will add a new property to the newEmployee object
		$.each($("#employeeForm").serializeArray(), function(i, field) {
			//The name of each field will be used to create a new property on the newEmployee object
			//It will also set each property with the value of the field
			//This converts a array of field objects (name, value) to an object of properties with values
			newEmployee[field.name] = field.value;
		});

		// Add new employee row to the Employee database table
		$.ajax({
			type: 'post',
			url: '/employee',
			data: newEmployee,
			success: function () {
				//Remove all employee rows from the dom so we don't have to add the new Employee to the dom right away
				//Wipe out the rows on the DOM
				$('.empRecord').remove();
				//Add back all the rows from the Employee database table, which will include the new row we just posted
				getEmployees();
			},
			error: function (err) {
				console.log(err);
			}
		});
	});
});

// This can be called at anytime to append the rows in the Employees table to the dom
function getEmployees() {
	$.ajax(
		{
			type: 'get',
			url: '/employees',
			success: function(employees) {
				//employees holds all the rows from the employee table as an array.
				//Think of employee as a row that came from the employee table.
				$(employees).each(function(i, employee){
					//create a html row(tr) element and create cells(td) for each column in the database.
					var row = document.createElement("tr");
					var fName = document.createElement("td");
					var lName = document.createElement("td");
					var EIN = document.createElement("td");
					var jobTitle = document.createElement("td");
					var salary = document.createElement("td");

					//put the column values in the right cells.
					//the jQuery html method sets the content for the element.
					$(fName).html(employee.first_name);
					$(lName).html(employee.last_name);
					$(EIN).html(employee.ein);
					$(jobTitle).html(employee.job_title);
					$(salary).html(employee.salary);
					//add the cells to the row
					$(row).append(fName);
					$(row).append(lName);
					$(row).append(EIN);
					$(row).append(jobTitle);
					$(row).append(salary);

					//Setting a class for the row to target it with jQuery.
					$(row).addClass("empRecord");
					//Find the totals row and inset the new row above it.
					$(row).insertBefore($("#empRecords > table tr").last());
				})

				// This is happening after all the employees have been added to the DOM
				var salaryTotal = 0;

				//Only the rows in between the header row and the total row will have a class of empRecord
				// Get each row with a class of empRecord, then get the last cell value of each row and add it to the salaryTotal variable
				$("#empRecords > table .empRecord").each(function(i, empRecord) {
					salaryTotal += parseInt($(empRecord).find("td").last().text());
				});

				//Get the last cell of the Total row and replace its content with the salaryTotal variable
				$("#empRecords > table #total td").last().text(salaryTotal);
			},
			error: function(error) {
				console.log(error);
			}

		}
	);
}