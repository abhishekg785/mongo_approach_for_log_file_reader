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
						console.log(data);
					},
					error : function(err) {
						console.log(err);
						Functions.HideLoader().LogErrorMessage();
					}
				});

				return Functions;
			},

			HideMessage : function() {
				$Objects.Message.css('display', 'none');
				return Functions;
			},

			ShowMessage : function() {
				$Objects.Message.css('display', 'block');
			},

			ShowLoader : function() {
				$Objects.LoaderContainer.css('display', 'block');
			},

			HideLoader : function() {
				$Objects.LoaderContainer.css('display', 'none');
				return Functions;
			},

			EnableNavButtons : function() {
				$Objects.NavigationButton.prop("disabled", false);
			},

			DisableNavButtons : function() {
				$Objects.NavigationButton.prop("disabled", true);
			},

			LogErrorMessage : function() {
				$Objects.DataViewMessage.html("<p><span>Error Occurred :(</span> Try Again after some time !</p>");
			},

			DisplayFetchedLogs : function(dataArr) {
				$Objects.DataView.empty();
				var html = "<ul>";
				dataArr.forEach(function(data) {
					html += "<li>" + "[" + data.lineNumber + "]" + " " + data.log + "</li>";
				});
				html += "</ul>";
				$Objects.DataView.append(html);
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
				$Objects.DataViewMessage.html("<p><span>File Path</span> is Required !</p>");
				return false;
			}
			var action = 'initial';
			Functions.FetchFileData(filePath, action).ShowLoader();
		});

		$Objects.NavigationButton.bind('click', function(e) {
			var filePath = $Objects.PathString.val();
			var action = e.target.dataset.type;
			Functions.FetchFileData(filePath, action).ShowLoader();
		});

		Functions.DisableNavButtons();
	});

})(document, window, jQuery, jQuery(window), jQuery(document));
