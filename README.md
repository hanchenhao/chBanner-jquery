
# chBanner
## 一款兼容性良好,支持移动端的jQuery图片轮播插件


## 使用步骤

### 引入资源文件

```html
    <link rel="stylesheet" href="./jquery.chBanner.css">
    <script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
    <script src="./jquery.chBanner.js"></script>
```

### Step 2: 编写

```html
        <div class="chBanner normal">
            <div  data-title="test1" class="chBanner-item"><img src="images/1.jpg" alt="test1"></div>
            <div  data-title="test2" class="chBanner-item"><img src="images/2.jpg" alt="test1"></div>
            <div  data-title="test3" class="chBanner-item"><img src="images/3.jpg" alt="test1"></div>
        </div>
```

### Step 3: 调用 

```javascript
       $('.normal').chBanner();

```

## 配置

以下参数全部为默认值
```
      //开始索引位置 0开始
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
```

