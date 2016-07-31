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
    results: [],
    createElement: function (tag) {
        var el = document.createElement(tag);
        el.style.display = "none";
        document.body.appendChild(el);
        return el;
    },
    count: 0,
    writeDom: function (option, imageLoad) {

        var result = {},
            _image = new Image();
        _image.src = option.src || "";

        var _canvas = compressImages.createElement("canvas");
        var _hide_img_node = compressImages.createElement("img");


        result.filename = option.filename;

        _hide_img_node.src = option.src;

        _hide_img_node.onload = function () {
            var _context = _canvas.getContext('2d');
            if (option.limit === 0 || option.filesize >= option.limit) {

                _canvas.width = this.width * (compressImages.zoom({width: this.width}) / 100);
                _canvas.height = this.height * (compressImages.zoom({height: this.height}) / 100);

                _context.drawImage(_image, 0, 0, _canvas.width, _canvas.height);
                option.base64 = _canvas.toDataURL(option.format, option.quality / 100);
                // option.base64 = _canvas.toDataURL(option.format, 1);
            } else {
                option.base64 = option.src;
            }


            result.base64 = option.base64;
            result.source = option.src;

            compressImages.results.push(result);

            compressImages.remove(_canvas);
            compressImages.remove(_hide_img_node);

            var tempImage = document.createElement("img");
            tempImage.setAttribute('src', option.base64);
            tempImage.setAttribute('class', compressImages.className);
            compressImages.imageContainer.appendChild(tempImage);

            option.imageNode = tempImage;
            imageLoad(option);

            if (compressImages.results.length == compressImages.count) {
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

        compressImages.zoom = options.zoom || function () {
                return 100;
            };


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

            var files = this.files;
            compressImages.count = files.length;

            for (var i = 0; i < this.files.length; i++) {
                compressImages.transform(files[i], obj.limit, options.quality || false, obj.imageLoad);
            }


        });
    }
};