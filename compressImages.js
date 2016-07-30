var compressImages = {
    find: function (selector) {
        return document.getElementById(selector);
    },
    remove: function removeElement(_element) {
        if (!_element) {
            return false;
        }
        var _parentElement = _element.parentNode;
        if (_parentElement) {
            _parentElement.removeChild(_element);
        }
    },
    container: null,
    results: [],
    count: 0,
    writeDom: function (option, imageLoad) {

        var _img_hide = "_img_hide" + compressImages.results.length,
            result = {},
            _canvas = "_canvas" + compressImages.results.length,
            _image = new Image();


        compressImages.container.innerHTML = '<canvas id="' + _canvas + '" style="display: none;"></canvas><img id="' + _img_hide + '" style="display: none;" >';


        var _hide_img_node = compressImages.find(_img_hide);


        result.filename = option.filename;


        _hide_img_node.src = option.src;

        _hide_img_node.onload = function () {
            var _hide_canvas_node = compressImages.find(_canvas),
                _context = _hide_canvas_node.getContext('2d');
            if (option.limit === 0 || option.filesize >= option.limit) {
                _hide_canvas_node.width = this.offsetWidth;
                _hide_canvas_node.height = this.offsetHeight;
                _context.drawImage(_image, 0, 0);
                option.base64 = _canvas.toDataURL(option.format, option.quality / 100);
            } else {
                option.base64 = option.src;
            }


            result.base64 = option.base64;
            compressImages.results.push(result);


            var tempImage = document.createElement("img");
            tempImage.setAttribute('src', option.base64);
            tempImage.setAttribute('class', compressImages.className);
            compressImages.imageContainer.appendChild(tempImage);
            option.imageNode = tempImage;
            imageLoad(option);


            if (compressImages.results.length == compressImages.count) {
                compressImages.remove(compressImages.container);
                compressImages.callback(compressImages.results);
            }

        };
    },
    transform: function (file, limit, quality, imageLoad) {
        var filesize = parseFloat(file.size / 1024).toFixed(2),  //单位为KB
            fReader = new FileReader(),
            _option = {};
        _option.format = file.type;

        fReader.readAsDataURL(file);
        fReader.onload = function (e) {

            //原图的base64值
            _option.src = this.result;
            _option.limit = limit;
            _option.filesize = filesize;
            _option.filename = file.name;


            // 如果有定义压缩比率
            if (quality) {
                //执行自定义质量函数。传过去当前文件大小
                _option.quality = quality(filesize);
            } else {
                //默认压缩率,0~100
                if (filesize / 1024 > 4) {
                    _option.quality = 20;
                } else if (filesize > 2) {
                    _option.quality = 40;
                } else if (filesize > 1) {
                    _option.quality = 60;
                } else if (filesize < 0.2) {
                    _option.quality = 100;
                } else {
                    _option.quality = 85;
                }
            }

            compressImages.writeDom(_option, imageLoad);


        }


    },
    init: function (options) {
        var obj = {};

        //input标签
        obj.fileNode = this.find(options.file);

        //设置为允许选取多文件
        obj.fileNode.setAttribute('multiple', 'multiple');

        //设置为仅选取图片
        obj.fileNode.setAttribute('accept', 'image/*');


        //用来展示文件的容器
        compressImages.imageContainer = compressImages.find(options.container);


        //执行压缩的最小文件大小。
        obj.limit = options.limit || 4000;

        //注册回调函数。
        compressImages.callback = options.callback;

        //图片的class
        compressImages.className = options.className || '';

        //回调函数
        obj.imageLoad = options.imageLoad || function () {
            };

        //回调函数
        obj.callback = options.callback || function () {
            };

        //绑定事件
        obj.fileNode.addEventListener('change', function () {

            compressImages.container = document.createElement("div");
            compressImages.container.style.display = "none";
            document.body.appendChild(compressImages.container);
            var files = this.files;
            compressImages.count = files.length;

            for (var i = 0; i < this.files.length; i++) {
                compressImages.transform(files[i], obj.limit, options.quality || false, obj.imageLoad);
            }


        });
    }
};