/*
* author : abhishek goswami
* abhishekg785@gmail.com
*/

;(function(d, w, $, $w, $d) {
	'use strict'

	var $Objects = {};
	var $Globals = {};

	var	Functions = {
			/**
			* sends an ajax request to the server with the file path.
			* this function will fetch the data of the file in the
			* path passed as a parameter.
			*
			* @param { string } filepath - path to the file
			* @param { string } action - action to take with the file
			* @return { object } Functions - object of functions
			*/
			FetchFileData : function(filePath, action) {
				$.ajax({
					url : 'http://localhost:3000',
					type : 'POST',
					data : {
						'filePath' : filePath,
						'action' : action
					},
					success : function(data) {
						Functions.HideMessage()
							.HideLoader()
							.EnableNavButtons();
						var data = JSON.parse(data);
						$Globals.dataArr = data; // cache the data for future queries
						Functions.DisplayFetchedLogs($Globals.dataArr);
						// console.log(data);
					},
					error : function(err) {
						console.log(err);
						Functions.HideLoader().LogErrorMessage("<p><span>Error Occurred :(</span> Try Again after some time !</p>");
					}
				});
				return Functions;
			},

			/**
			*	Hide the message paragraph
			* @return { object } Functions - object of functions
			*/
			HideMessage : function() {
				$Objects.Message.css('display', 'none');
				return Functions;
			},

			/**
			*	Show the message paragraph
			* @return { object } Functions - object of functions
			*/
			ShowMessage : function() {
				$Objects.Message.css('display', 'block');
				return Functions;
			},

			/**
			*	Show the Loader atfter processing
			* @return { object } Functions - object of functions
			*/
			ShowLoader : function() {
				$Objects.LoaderContainer.css('display', 'block');
				return Functions;
			},

			/**
			*	Hide the Loader atfter processing
			* @return { object } Functions - object of functions
			*/
			HideLoader : function() {
				$Objects.LoaderContainer.css('display', 'none');
				return Functions;
			},

			/**
			*	Enables the navigation buttons when the data has not been fetched
			* @return { object } Functions - object of functions
			*/
			EnableNavButtons : function() {
				$Objects.NavigationButton.prop("disabled", false);
				return Functions;
			},

			/**
			*	Disables the navigation buttons when the data has not been fetched
			* @return { object } Functions - object of functions
			*/
			DisableNavButtons : function() {
				$Objects.NavigationButton.prop("disabled", true);
				return Functions;
			},

			/**
			*	Used to displau the error message for ajax query
			*
			* @param { string } message - error message to log
			* @return { object } Functions - object of functions
			*/
			LogErrorMessage : function(message) {
				$Objects.DataViewMessage.html(message);
				return Functions;
			},

			/**
			*	Populates the data-view div with the data
			* @return { object } Functions - object of functions
			*/
			DisplayFetchedLogs : function(dataArr) {
				$Objects.DataView.empty();
				var html = "<ul>";
				dataArr.forEach(function(data) {
					html += "<li>" + "[" + data.lineNumber + "]" + " " + data.log + "</li>";
				});
				html += "</ul>";
				$Objects.DataView.append(html);
				return Functions;
			}
		}

	$d.ready(function() {
		$Objects.PathString = $('#path-string');
		$Objects.ViewButton = $('#view-button');
		$Objects.Message = $('.message');
		$Objects.DataViewMessage = $('#data-view .message');
		$Objects.LoaderContainer = $('#loader-container');
		$Objects.NavigationButton = $('.nav-button');
		$Objects.DataView = $('#data-view');

		$Objects.ViewButton.bind('click', function(e) {
			var filePath = $Objects.PathString.val();
			if(filePath == "") {
				Functions.LogErrorMessage("<p><span>File Path</span> is Required !</p>");
				return false;
			}
			var action = 'initial'; // action defines the navigation
			Functions.FetchFileData(filePath, action).ShowLoader();
		});

		$Objects.NavigationButton.bind('click', function(e) { // bind click event to the navigation buttons
			var filePath = $Objects.PathString.val();
			var action = e.target.dataset.type;
			Functions.FetchFileData(filePath, action).ShowLoader();
		});

		Functions.DisableNavButtons(); // diable navigation functions at the start
	});

})(document, window, jQuery, jQuery(window), jQuery(document));
