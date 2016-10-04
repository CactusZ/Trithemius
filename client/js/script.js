    /* global $ white */
    $(document).ready(function() {

        $("#operation").change(function() {
            $(".progress-bar").hide("fast");
            $("#error-div").hide("fast");
            $("#result-div").hide("fast");
            if ($(this).val() == "hide") {
                $("#retrieve-div").hide("fast");
                $("#hide-div").show("slow", "swing");
            }
            else {
                $("#hide-div").hide("fast");
                $("#retrieve-div").show("slow", "swing");
            }
        });

        /* Object type select */
        $("#object-type").change(function() {
            if ($(this).val() == "string") {
                $("#upload-file").hide("fast");
                $("#upload-string").show("slow", "swing");
            }
            else {
                $("#upload-string").hide("fast");
                $("#upload-file").show("slow", "swing");
            }
        });


        /* File selection */
        $('#upload-obj-file').click(function() {
            $('#upload-obj-input').click();
        });

        $('#upload-obj-input').change(function() {
            var filename = $('#upload-obj-input').val().split('\\').pop();
            $('#upload-obj-file').val(!filename ? "" : filename + " [Click to change]");
            var upload_carrier_file = $('#upload-obj-file');
            upload_carrier_file.val(!filename ? "" : filename + " [Click to change]");
            if (!upload_carrier_file.val()) {
                upload_carrier_file.css("background-color", "");
            }
            else {
                upload_carrier_file.css("background-color", "lightCyan");
            }
        });

        $('#upload-carrier-file').click(function() {
            $('#upload-carrier-input').click();
        });

        $('#upload-carrier-input').change(function(event) {
            var filename = $('#upload-carrier-input').val().split('\\').pop();
            var upload_carrier_file = $('#upload-carrier-file');
            upload_carrier_file.val(!filename ? "" : filename + " [Click to change]");
            if (!upload_carrier_file.val()) {
                upload_carrier_file.css("background-color", "");
            }
            else {
                upload_carrier_file.css("background-color", "lightCyan");
            }

        });


        $('#stego-file').click(function() {
            $('#stego-input').click();
        });

        $('#stego-input').change(function(event) {
            var filename = $('#stego-input').val().split('\\').pop();
            var stego_file = $('#stego-file');
            stego_file.val(!filename ? "" : filename + " [Click to change]");
            if (!stego_file.val()) {
                stego_file.css("background-color", "");
            }
            else {
                stego_file.css("background-color", "lightCyan");
            }

        });

        /* Button pressed. Upload! */
        $("#upload-btn").click(function() {
            $("#result-div").hide("fast");
            $("#error-div").hide();
            var fileObj;
            var fileCar;
            fileCar = $('#upload-carrier-input').get(0).files[0];

            /*Create Form*/
            var formData = new FormData();

            formData.append('fileCarrier', fileCar, fileCar.name);
            formData.append('objectType', $("#object-type").val());
            if ($("#object-type").val() == 'file') {
                if ((!$('#upload-carrier-input').val()) || (!$('#upload-obj-input').val())) {
                    $("#error-div").show();
                    $("#error-div").html("You have to select 2 files!");
                    return;
                }
                fileObj = $('#upload-obj-input').get(0).files[0];
                formData.append('fileObject', fileObj, fileObj.name);
            }
            else {
                if ((!$('#upload-carrier-input').val()) || (!$('#upload-obj-string').val())) {
                    $("#error-div").show();
                    $("#error-div").html("You have to select a file and input string!");
                    return;
                }
                formData.append('stringObject', $('#upload-obj-string').val());
            }

            /* Reset and show progress bar */
            $("#progress").css("display", "block");
            $("#progressBar").css("width", "0%");
            $("#label").html("0%");

            $.ajax({
                url: '/upload/hide',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    if (data.status == "error") {
                        $("#error-div").html(data.error);
                        $("#error-div").show();
                    }
                    else {
                        $("#result-div").html("Download your file <a href=/getresult/" + data.result + "> HERE </a>");
                        $("#result-div").show();
                    }
                },
                xhr: function() {
                    // create an XMLHttpRequest
                    var xhr = new XMLHttpRequest();

                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', function(evt) {

                        if (evt.lengthComputable) {
                            // calculate the percentage of upload completed
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);

                            // update the Bootstrap progress bar with the new percentage
                            $('.progress-bar-box').text(percentComplete + '%');
                            $('.progress-bar-box').css({
                                width: percentComplete + '%'
                            });

                            // once the upload reaches 100%, set the progress bar text to done
                            if (percentComplete === 100) {
                                $('.progress-bar-box').html('Done');
                            }

                        }

                    }, false);

                    return xhr;
                }
            });
        });

        $("#retrieve-btn").click(function() {
            $("#error-div").hide();
            $("#result-div").hide("fast");
            var fileObj;
            var fileCar;
            fileCar = $('#stego-input').get(0).files[0];

            /*Create Form*/
            var formData = new FormData();
            var objectRetrieveType = $("#object-retr-type").val();
            formData.append('fileCarrier', fileCar, fileCar.name);
            formData.append('objectType', objectRetrieveType);

            if (!$('#stego-input').val()) {
                $("#error-div").show();
                $("#error-div").html("You have to select file!");
                return;
            }

            /* Reset and show progress bar */
            $("#progress").css("display", "block");
            $("#progressBar").css("width", "0%");
            $("#label").html("0%");

            $.ajax({
                url: '/upload/retrieve',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data) {
                    if (data.status == "error") {
                        $("#error-div").html(data.error);
                        $("#error-div").show();
                    }
                    else {
                        if (objectRetrieveType == "file") {
                            $("#result-div").html("Download your file <a href=/getresult/" + data.result + "> HERE </a>");
                        }
                        else {
                            $("#result-div").html("Result string:  " + data.result);
                            $("#result-div").show();
                        }
                    }
                },
                xhr: function() {
                    // create an XMLHttpRequest
                    var xhr = new XMLHttpRequest();

                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', function(evt) {

                        if (evt.lengthComputable) {
                            // calculate the percentage of upload completed
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);

                            // update the Bootstrap progress bar with the new percentage
                            $('.progress-bar-box').text(percentComplete + '%');
                            $('.progress-bar-box').css({
                                width: percentComplete + '%'
                            });

                            // once the upload reaches 100%, set the progress bar text to done
                            if (percentComplete === 100) {
                                $('.progress-bar-box').html('Done');
                            }

                        }

                    }, false);

                    return xhr;
                }
            });
        });
    });