//  传一个jQuery对象$
//  因为es6个别浏览器存在兼容性问题,我不会预处理ES6,故参考一些开源代码用原始做法来实现一个banner
;
(function ($) {
  function Banner($container, options) {
    this.$container = $container;
    this.options = $.extend({ //原型重载
      //开始索引 0开始
      startSlide: 0,
      //子元素选择器
      item: ".chBanner-item",
      //是否自适应
      isFlexible: true,
      //原型链内是否支持触摸 html5 transform 
      isSupportTouch: "__proto__" in {},
      //是否显示分页按钮
      isShowPage: true,
      //是否显示标题栏
      isShowTitle: false,
      //标题文本存放的属性 或者回调函数(需要返回值)
      titleAttr: "data-title",
      //是否显示左右控制按钮
      isShowControls: false,
      //是否自动播放
      isAuto: true,
      //自动播放间隔时间
      intervalTime: 3000,
      //特效时间
      affectTime: 300
    }, options);
    this.init(); //初始化
  }

  Banner.prototype = { //原型
    init: function () { //构造函数
      this.$item = this.$container.find(this.options.item); //轮播元素
      this.size = this.$item.length; //轮播元素数量
      this.curIndex = this.options.startSlide; //当前页码
      this.setLayout(); //布局
      this.playTimer = null; //自动轮播时间id -> settimeout
      this.options.isAuto && this.autoPlay();
      //如果自动适配,则要执行resize这个方法,以绑定dom大小发生变化的是时间
      this.options.isFlexible &&
        $(window).on("resize.chBanner", $.proxy(this, 'resize'));
      this.options.isSupportTouch && this.touch();
    },

    setLayout: function () {
      //设置布局
      var opt = this.options; //基本构造属性
      var css = this.getSetCss(); //css样式
      this.$item.css(css.item); //给轮播图设置样式
      //    把<div class="chBanner-wrap"/>放在container中
      this.$container.css(css.container).wrap('<div class="chBanner-wrap"/>');
      this.$wrap = this.$container.parent(); //获取container父级元素
      this.$wrap.css(css.wrap); //设置样式中wrap属性
      if (this.options.isShowTitle) {
        //如果现实title,插入div到container中
        this.$title = $('<div class="chBanner-title"/>').insertAfter(
          this.$container
        );
        this.setTitle(); //设置标题
      }
      if (this.options.isShowPage) {
        //如果现实分页
        this.$pages = $(
          //插入分页元素
          '<div class="chBanner-pages">' + this.getPages() + "</div>"
        ).insertAfter(this.$container);
        this.pagesSwitch(); //分页选择事件
      }
      if (this.options.isShowControls) {
        //如果显示分页按钮插入对应元素
        this.$prev = $( //前
          '<a href="javascript:;" class="chBanner-btn-prev"></a>'
        );
        this.$next = $( //后
          '<a href="javascript:;" class="chBanner-btn-next"></a>'
        );
        this.$container.after(this.$prev.add(this.$next));
        this.controlsSwitch(); //事件
      }
      this.$container.append(this.$item.eq(0).clone().addClass("item-clone"));
      this.$item = this.$container.find(this.options.item);
      this.size = this.$item.length;

    },
    touch: function () {
      //移动端滑动处理
      var self = this;
      var touch = {};
      var opt = this.options;
      var min = opt.minSwipeLength;
      this.$container
        .on("touchstart", function (e) {
          var touches = e.originalEvent.touches[0];
          touch.x1 = touches.pageX;
          touch.y1 = touches.pageY;
        })
        .on("touchmove", function (e) {
          var touches = e.originalEvent.touches[0];
          touch.x2 = touches.pageX;
          touch.y2 = touches.pageY;
        })
        .on("touchend", function (e) {
          var dir = self.swipeDirection(touch.x1, touch.x2, touch.y1, touch.y2);
          self.moveTo(dir);
          touch = {};
        });
    },
    moveTo: function (dir) {  //通过判断移动的方向来轮播
      var self = this;
      if (dir == 'Right') {
        self.movePrev();
      } else if (dir == 'Left') {
        self.move();
      }
    },
    swipeDirection: function (x1, x2, y1, y2) { //通过touch的点来判断手势方向
      var xDelta = Math.abs(x1 - x2);
      var yDelta = Math.abs(y1 - y2);
      return x1 - x2 > 0 ? 'Left' : 'Right';
    },
    move: function () { //向后移动
      var self = this;
      self.options.isAuto && self.autoPlay();
      self.curIndex += 1;
      if (self.curIndex == self.size) {
        self.curIndex = 0;
        self.$container.css(self.getMove());
        self.curIndex += 1;
      }
      self.setTitle();
      self.setPages();
      self.$container
        .stop(false, true)
        .animate(self.getMove(), self.options.affectTime);
    },
    movePrev: function (flag) { //向前移动
      var self = this;
      if (flag != true) {
        if (self.curIndex == 0) {
          self.curIndex = self.size - 1;
          self.$container.css(self.getMove());
        }
        self.curIndex--;
      }
      //自动轮播
      self.options.isAuto && self.autoPlay();

      self.setTitle(); //设置标题
      self.setPages(); //设置分页
      self.$container //轮播的核心就是插入动画,通过改变left来轮播
        .stop(false, true)
        .animate(self.getMove(), self.options.affectTime);
    },
    getSetCss: function () { //获取及设置css样式
      var size = this.getSize();
      var css = {};
      var start = Math.min(this.options.startSlide, this.size);

      css.height = size.height;
      css.width = (this.size + 1) * 100 + "%";
      css.left = -(start * size.width);
      size.float = "left";
      css.position = "relative";

      return {
        item: size,
        container: css,
        wrap: {
          'overflow': "hidden",
          'position': "relative",
          'width': size.width,
          'height': size.height
        }
      };
    },
    getMove: function (flag) { //获取移动后的位置 
      var move = {};
      var size = this.getSize();
      move.left = -this.curIndex * size.width; //通过left去移动
      flag && (move.height = size.height);
      return move;
    },
    getPages: function () { //获取page的html文本
      var arr = [];
      var curIndex = this.curIndex;
      $(this.$item).each(function (idx) {
        var cls = null;
        if (idx == curIndex) cls = 'class="active"';
        arr.push('<a href="javascript:;" ' + cls + '>' + (idx + 1) + '</a>');
      });
      return arr.join('');
    },
    setPages: function () { //设置page的状态
      //设置分页
      if (!this.options.isShowPage || !this.$pages) return;
      var idx = this.curIndex;
      idx == this.size - 1 && (idx = 0);
      $("a", this.$pages)
        .eq(idx)
        .addClass("active")
        .siblings()
        .removeClass("active");
    },
    setTitle: function () { //设置标题
      //设置标题
      if (!this.options.isShowTitle || !this.$title) return;
      var $curItem = this.$item.eq(this.curIndex);
      this.$title.html(
        $.isFunction(this.options.titleAttr) ?
        this.options.titleAttr.call($curItem, this.curIndex) :
        $curItem.attr(this.options.titleAttr)
      );
    },
    getSize: function () {  //获取元素大小
      var $elem = this.$item.eq(0); //获取第一个元素
      var size = {}; //元素大小
      if (this.options.isFlexible) {
        //如果自适应
        var $ele = this.$wrap ? this.$wrap.parent() : this.$container.parent(); //取得父级或祖先元素
        size = {
          width: $ele.width()
        };
      }
      return size || {
        width: $elem.width(),
        height: $elem.height()
      };
    },
    resize: function () { //界面尺寸改变要重新计算一下
      var self = this;
      self.$wrap.add(self.$item).css(self.getSize());
      self.$container.css(self.getMove(true));
    },

    controlsSwitch: function () { //前后两个按钮点击事件
      var self = this;
      this.$next.on('click', $.proxy(self, 'move'));
      this.$prev.on('click', $.proxy(self, 'movePrev'));
    },
    pagesSwitch: function () {  //page点击事件
      if (!this.options.isShowPage || !this.$pages) return;
      var self = this;
      $('a', this.$pages).on('click', function () {
        if ($(this).hasClass('active')) return;
        self.curIndex = $(this).index();
        self.movePrev(true);
      })
    },
    autoPlay: function () { //自动播放
      var self = this;
      if (this.$item.length <= 1) return;
      clearTimeout(self.playTimer);
      self.playTimer = setTimeout($.proxy(self, 'move'), self.options.intervalTime);
    }
  };

  $.fn.chBanner = function (options) {  //jQuery插件绑定
    this.each(function () {
      $(this).data(new Banner($(this), options));
    });
    return this;
  }
})(window.jQuery);