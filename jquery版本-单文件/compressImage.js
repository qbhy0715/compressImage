(function ($) {
    $.fn.extend({
        "compressImage": function (option) {
            var _option = {
                    'file': $(option.file),
                    'img': $(option.img),
                    'limit': option.limit ? option.limit : 200   //默认两百KB一下的图片不进行压缩
                },
                _file = _option.file,
                _callback = option.callback || function () {
                    };

            _file.change(function () {
                var file = $(this)[0].files[0],
                    filesize = parseFloat(file.size / 1024).toFixed(2), //单位为KB
                    fReader = new FileReader();
                console.log("压缩前大小是" + filesize + 'KB');

                if (option.change) {
                    if (!option.change(file)) {
                        return false;
                    }
                }

                _option.filetype = file.type;
                _option.filesize = filesize;
                _option.filename = file.name;

                fReader.readAsDataURL(file);
                fReader.onload = function (e) {

                    _option.src = this.result;

//                如果有定义压缩比率
                    if (option.quality) {
                        //执行自定义质量函数。传过去当前文件大小
                        _option.quality = option.quality(filesize);
                    } else {
//                    默认压缩率,0~100
                        if (filesize > 4) {
                            _option.quality = 10;
                        } else if (filesize > 2) {
                            _option.quality = 20;
                        } else if (filesize > 1) {
                            _option.quality = 20;
                        } else if (filesize < 0.2) {
                            _option.quality = 100;
                        } else {
                            _option.quality = 85;
                        }
                    }
                    writeDom(_option, _callback);
                };
            });
        }
    });


    function writeDom(option, callback) {
        $('#_img_hide,#_canvas').remove();
        $('body').append($('<canvas id="_canvas" style="display: none;"></canvas><img id="_img_hide" style="display: none;" >'));
        var _image = new Image();
        _image.src = option.src || "";


        $('#_img_hide').attr('src', option.src)[0].onload = function () {

            var _this = $(this),
                _canvas = document.getElementById('_canvas'),
                _context = _canvas.getContext('2d');

            if (option.limit === 0 || option.filesize >= option.limit) {


                console.log(this.width);
                console.log(this.height);

                _canvas.width = _this.width();
                _canvas.height = _this.height();
                _context.drawImage(_image, 0, 0);
                option.base64 = _canvas.toDataURL('image/jpeg', option.quality / 100);
            } else {
                option.base64 = option.src;
            }

            //  图片预览
            option.img.attr({src: option.base64});

            callback(option);
        };
    }
})(jQuery);
