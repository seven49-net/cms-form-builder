///////////////////////
// formBuilder() version 1.0
//////////////////////
var formBuilder = {
	helpers: {
		languageCode: function(defaultLang) {
			defaultLang = (defaultLang === undefined || defaultLang === null) ? "de" : defaultLang;
			var path = location.pathname;
			var lang;
			if (path === "/") {
				lang = defaultLang;
			} else {
				lang = path.substr(1, 2);
			}
			return lang;
		},
		badIE: function() {
			return (typeof FormData === 'undefined') ? true : false;
		},
		///////////////////////
		// test for undefined and null => true
		//////////////////////
		isEmpty: function(val) {
			return (typeof val === 'undefined' || val === null);
		},
		///////////////////////
		// test for undefined, null and "" =>true
		//////////////////////
		isReallyEmpty: function(val) {
			return (formBuilder.helpers.isEmpty(val) || val.length === 0);
		},
		renderMessage: function(obj) {
			var formContent = [];
			formContent.push('<table class="form-data">');
			obj.find("input,select,textarea").not('[type=hidden]').each(function() {
				if ($(this).attr('type') === "file") {
					if ($(this)[0].files[0] !== undefined && $(this)[0].files[0] !== null) {
						formContent.push('<tr><td>' + $(this).attr('id') + '</td><td>' + $(this)[0].files[0].name + '</td></tr>');
					}
				} else if ($(this).attr('type') === "radio") {
					formContent.push('<tr><td>' + $(this).attr("name") + " " + $(this).val() + '</td><td>' + $(this)[0].checked + '</td></tr>');
				} else {
					formContent.push('<tr><td>' + $(this).attr("name") + '</td><td>' + $(this).val() + '</td></tr>');
				}
			});
			formContent.push('</table>');
			return formContent;
		},
		buildFormdata: function(content, obj) {
			$(content).find("input,select,textarea").not('[type=hidden]').each(function() {
				if ($(this).attr('type') === "file") {
					if ($(this)[0].files[0] !== undefined && $(this)[0].files[0] !== null) {
						obj.append($(this).attr('id'), $(this)[0].files[0]);
					}
				} else if ($(this).attr('type') === "radio") {
					obj.append($(this).attr("name") + '_' + $(this).val(), $(this)[0].checked);
				} else {
					obj.append($(this).attr('name'), $(this).val());
				}
			});
			return obj;
		},
		renderErrorMessage: function(container, msg){
			$(container).html("<div class='error error-message'>" + msg + "</div>");
		}
	},

	sendForm: function(params) {
		var options = $.extend({
			apiUrl: "http://cmsapi.seven49.net/FormMail/",
			sendButton: "#send-form",
			mailTo: "info@seven49.net", // could also be $('input[name=MailTo]).val()
			replyTo: "MailFrom", // name of input: client's email in input-field
			mailFrom: "noreply@seven49.net", // leave it for SPAM filtering
			mailSubject: "Kontaktformular",
			validation: true, // default
			formName: ".aspnetForm",
			formContent: "#aspnetForm",
			sendCCToSender: false,
			redirectOnSuccess: $('input[name=MailThanks]').val(), // if undefined or '' the alternateSuccessMessage will be displayed in formContent
			errorMessage: "Some errors ocurred while transmitting the form! Please refresh the page and try again!",
			alternateSuccessMessage: "This form was successfully sent!",
			loader: "<img class='send-form' src='http://cdn.seven49.net/common/images/loading/ajax-loader-2.gif' />"
		}, params);

		if (options.validation) {
			var langCode = formBuilder.helpers.languageCode('de');
			$('head').append('<script src="http://cdn.seven49.net/common/js/jquery/plugins/jquery-validation/jquery.validate.min.js"></script>');

			if (langCode !== 'en') {
				setTimeout(function(){
					$('head').append('<script src="http://cdn.seven49.net/common/js/jquery/plugins/jquery-validation/localization/messages_' + langCode + '.js"></script>');
				}, 200);

			}

		}

		$(options.sendButton).on('click', function() {

			if (options.validation) {
				if ($(options.formName).valid()) {
					formBuilder.processForm({
						formContent: options.formContent,
						apiUrl: options.apiUrl,
						mailTo: options.mailTo,
						replyTo: $('input[name='+options.replyTo+']').val(),
						mailFrom: options.mailFrom,
						mailSubject: options.mailSubject,
						formName: options.formName,
						redirectOnSuccess: options.redirectOnSuccess,
						sendCCToSender: options.sendCCToSender,
						errorMessage: options.errorMessage,
						alternateSuccessMessage: options.alternateSuccessMessage,
						loader: options.loader
					});
				}

			} else {
				formBuilder.processForm({
					formContent: options.formContent,
					apiUrl: options.apiUrl,
					mailTo: options.mailTo,
					replyTo: $('input[name='+options.replyTo+']').val(),
					mailFrom: options.mailFrom,
					mailSubject: options.mailSubject,
					sendCCToSender: options.sendCCToSender,
					formName: options.formName,
					errorMessage: options.errorMessage,
					redirectOnSuccess: options.redirectOnSuccess,
					alternateSuccessMessage: options.alternateSuccessMessage,
					loader: options.loader
				});
			}

		});
	},
	processForm: function(params) {
		var options = $.extend({
			formContent: "#aspnetForm",
			apiUrl: "http://cmsapi.seven49.net/FormMail/",
			mailTo: "info@seven49.net",
			replyTo: $('input[name=Email]').val(),
			mailFrom: "noreply@seven49.net",
			mailSubject: "Kontaktformular",
			formName: ".aspnetForm",
			redirectOnSuccess: '',
			sendCCToSender: false,
			errorMessage: "Some errors ocurred while transmitting the form! Please refresh the page and try again!",
			alternateSuccessMessage: "This form was successfully sent!",
			loader: "<img class='send-form' src='http://cdn.seven49.net/common/images/loading/ajax-loader-2.gif' alt='sending form' />"
		}, params);
		var redirectUrl;
		var loader = "<div class='loader' id='form-process-indicator'>" + options.loader + "</div>";
		$(options.formContent).append(loader);

		if (!formBuilder.helpers.isReallyEmpty(options.redirectOnSuccess)) {
			if(options.redirectOnSuccess.indexOf('http://') === -1) {
				redirectUrl = location.protocol + "//" + location.hostname +"/" + options.redirectOnSuccess;
			}
		}

		if (formBuilder.helpers.badIE()) {
			var formContent = formBuilder.helpers.renderMessage($(options.formContent));
			$.post(options.apiUrl, {
				"MailFrom": options.mailFrom,
				"MailTo": options.mailTo,
				"ReplyTo": options.replyTo,
				"MailSubject": options.mailSubject,
				"MailBody": formContent.join("") + "<br/>" + "Wichtig:" + "Der Kunde hat das Formular mit einem veralteten Browser abgeschickt - bei diesen steht der Dokumenten-Upload nicht zur Verfügung. Bitte fordern Sie diese, falls nötig,  per E-Mail vom Kunden an."
			}, function(){
				if (options.sendCCToSender) {
					$.post(options.apiUrl, {
						"MailFrom": options.mailFrom,
						"MailTo": options.replyTo,
						"ReplyTo": options.mailTo,
						"MailSubject": options.mailSubject,
						"MailBody": formContent.join("")
					});
				}

				if (formBuilder.helpers.isReallyEmpty(options.redirectOnSuccess)) {
					$(options.formContent).html("<div class='success-message'>"+options.alternateSuccessMessage+"</div>");
				} else {
					window.location.href = redirectUrl;
				}
			}).error(function() {
				formBuilder.helpers.renderErrorMessage(options.formContent, options.errorMessage);
			});


		} else {
			var formData = new FormData();
			formData.append('MailTo', options.mailTo);
			formData.append('MailFrom', options.mailFrom);
			formData.append('ReplyTo', options.replyTo);
			formData.append('MailSubject', options.mailSubject);

			formBuilder.helpers.buildFormdata(options.formContent, formData);
			$.ajax({
					url: options.apiUrl,
					data: formData,
					type: "POST",
					contentType: false,
					processData: false,
					success: function() {
						if (options.sendCCToSender) {
							var customerForm = formBuilder.helpers.renderMessage($(options.formContent));
							$.post(options.apiUrl, {
								"MailFrom": options.mailFrom,
								"MailTo": options.replyTo,
								"ReplyTo": options.mailTo,
								"MailSubject": options.mailSubject,
								"MailBody": customerForm.join("")
							});
						}
						if (formBuilder.helpers.isReallyEmpty(options.redirectOnSuccess)) {
							$(options.formContent).html("<div class='success-message'>"+options.alternateSuccessMessage+"</div>");
						} else {
							window.location.href = redirectUrl;
						}


					},
					error: function() {
						formBuilder.helpers.renderErrorMessage(options.formContent, options.errorMessage);
				}
			});
		}

	}

};