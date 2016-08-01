
function ci(options) {
    //input标签
    this.fileNode = this.f(options.file);

    //默认不进行缩放
    this.zoom = options.zoom || function () {
            return 100;
        };

    //用来展示文件的容器
    this.imageContainer = this.f(options.container);

    //执行压缩的最小文件大小。
    this.limit = options.limit || true;


    //注册全部文件执行完后的回调函数。
    this.callback = options.callback;

    //自定义质量
    this.quality = options.quality || false;


    //图片的class
    this.className = options.className || '';


    //图片插入之前执行的函数
    this.imageWillMount = options.imageWillMount || function () {
            return true;
        };

    //压缩过后的图片集合
    this.results = [];

    this.count = 0;

    //图片插入之后执行的函数
    this.imageDidMount = options.imageDidMount || function () {
            return true;
        };

    //默认为不缩放
    this.zoom = options.zoom || function (obj) {
            if (obj.width) {
                return obj.width;
            } else if (obj.height) {
                return obj.height;
            }
        };

    //文件数超出
    this.maxFiles = options.maxFiles || false;

    this.fileWillStart = options.fileWillStart || false;

    this.constructor();
}

ci.prototype = {
    constructor: function (obj) {

        var self = this;
        //设置为允许选取多文件
        this.fileNode.setAttribute('multiple', 'multiple');

        //设置为仅选取图片
        this.fileNode.setAttribute('accept', 'image/*');


        this.fileNode.addEventListener('change', function () {
            var files = this.files;
            self.count = files.length;

            if (self.maxFiles) {
                if (files.length > self.maxFiles.number) {
                    self.maxFiles.onoverflow(files);
                    return false;
                }
            }


            for (var i = 0; i < this.files.length; i++) {

                if (self.fileWillStart) {
                    if (!self.fileWillStart(files)) {
                        self.count--;
                        return false;
                    }
                }
                self.start(files[i]);
            }

        });


    },
    f: function (s) {
        return typeof s == 'object' ? s : document.querySelector(s);
    },
    writeDOM: function (option) {
        var tempImage = document.createElement("img");
        tempImage.setAttribute('src', option.base64);
        tempImage.setAttribute('class', this.className);
        this.imageContainer.appendChild(tempImage);
        option.imageNode = tempImage;
        this.imageDidMount(option);
    },
    start: function (file) {

        var filesize = parseFloat(file.size / 1024).toFixed(2),  //单位为KB
            fReader = new FileReader(),
            _option = {
                format: file.type
            },
            self = this;

        //载入文件
        fReader.readAsDataURL(file);
        fReader.onload = function (e) {


            _option.src = this.result;              //原图的base64值
            _option.filesize = filesize;            //文件大小。单位为K
            _option.filename = file.name;           //文件名


            // 如果有定义压缩比率
            if (self.quality) {
                //执行自定义质量函数。传过去当前文件大小
                _option.quality = self.quality(filesize);
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

            self.transform(_option);


        }


    },
    transform: function (option) {

        var result = {},
            self = this,
            _hide_img_node = self.createElement("img"),
            _image = new Image();

        //用于画布
        _image.src = option.src || "";


        result.filename = option.filename;


        _hide_img_node.src = option.src;
        _hide_img_node.onload = function () {

            var _width = this.width,
                _height = this.height;


            option.width = _width;
            option.height = _height;

            if (option.limit < 0) {
                option.base64 = option.src;
            }
            else if (option.limit === true || option.filesize >= option.limit) {
                var _canvas = self.createElement("canvas"),
                    _context = _canvas.getContext('2d');
                _canvas.width = self.zoom({width: _width});
                _canvas.height = self.zoom({height: _height});
                _context.drawImage(_image, 0, 0, _canvas.width, _canvas.height);
                option.base64 = _canvas.toDataURL(option.format, option.quality / 100); //这里的quality是计算过后的质量，并非self.quality方法
                self.remove(_canvas);
                self.remove(_hide_img_node);
            } else {
                option.base64 = option.src;
            }


            result.base64 = option.base64;
            result.filesize = option.filesize;
            result.source = option.src;

            self.results.push(result);


            if (self.imageWillMount(option)) {
                self.writeDOM(option);
            }


            if (self.results.length == self.count) {
                self.callback(self.results);
                self.results = [];
            }

        };
    }

    ,
    remove: function (_element) {
        if (!_element) {
            return false;
        }
        var _parentElement = _element.parentNode;
        if (_parentElement) {
            _parentElement.removeChild(_element);
        }
    }
    ,
    createElement: function (tag) {
        var el = document.createElement(tag);
        el.style.display = "none";
        document.body.appendChild(el);
        return el;
    }
};

