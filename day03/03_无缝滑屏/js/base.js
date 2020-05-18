    // 1. 加meta标签
    // 2. 挑选一个适配方案
    // 3. 禁止移动端事件的默认行为
    (function(w){
       w.swiper = {};
       //wrap:移动端开发时的包裹节点
       function init(wrap){
           //挑选一个适配方案
           const styleNode = document.createElement("style");
           const w = document.documentElement.clientWidth/16;
           styleNode.innerHTML = `html{font-size:${w}px!important}`;
           document.head.appendChild(styleNode)
           //禁止移动端事件的默认行为
           wrap.addEventListener("touchstart",(ev)=>{
               ev=ev||event;
               ev.preventDefault();
           })
       };
       //arr当前无缝滑屏需要的图片的地址
       function slide(arr){
          let swiperWrap = document.querySelector(".swiper-wrap");//滑屏区域
          let ulNode = document.createElement("ul");//滑屏元素
          let pointWrap = document.querySelector(".swiper-wrap > .point-wrap");
          let liNode = document.querySelector(".swiper-wrap .list li");
          let styleNode = document.createElement("style");
           // console.log(swiperWrap)
          if(!swiperWrap){
              throw new Error("页面上缺少swiper-wrap这个滑屏区域")
              return ;
          }

          //根据arr动态的去创建滑屏元素ul和li
           ulNode.classList.add("list");
           for(let i = 0;i < arr.length;i++){
               ulNode.innerHTML += "<li><img src=" + (arr[i]) + "></li>";
           }
           swiperWrap.appendChild(ulNode);
           //动态写入ul和li的宽度
           styleNode.innerHTML=".swiper-wrap .list{width:"+(arr.length)+"00%}";
           styleNode.innerHTML+=".swiper-wrap .list li{width:"+(1/arr.length)*100+"%}";
           document.head.appendChild(styleNode);

           //小圆点相关的逻辑
           if(pointWrap){
               for(let i = 0; i < arr.length; i++){
                   if(i==0){
                       pointWrap.innerHTML += "<span class='active'></span>"
                   }else{
                       pointWrap.innerHTML += "<span></span>"
                   }
               }
           }
           //重新渲染滑屏区域的高度
           liNode = document.querySelector(".swiper-wrap .list li");
           //代码执行到第54行时 界面可能还没有渲染成功
           setTimeout(()=>{
               swiperWrap.style.height = liNode.offsetHeight + 'px';
           },200)
           move(swiperWrap,ulNode,arr)
       }
       //滑屏的主体方法
       function move(wrap,node,arr){
           /*基本逻辑
               1.拿到滑屏元素
               2.计算出手指滑动的距离
               3.将手指滑动的距离给滑屏元素加上
           */
           let eleStartX = 0;//滑屏元素一开始的位置
           let touchStartX = 0; //手指一开始的位置
           let touchDisX = 0;
           let index = 0;
          wrap.addEventListener("touchstart",function(ev){
              ev =ev||event;
              node.style.transition = ""
              let touchC = ev.changedTouches[0];
              touchStartX = touchC.clientX;//手指一开始的位置
              eleStartX = node.offsetLeft;//滑屏元素一开始的位置
          })
          wrap.addEventListener("touchmove",function(ev){
              ev=ev||event;
              let touchC = ev.changedTouches[0];
              let touchNowX = touchC.clientX;//手指的实时位置
              touchDisX = touchNowX - touchStartX;//手指滑动的距离
              node.style.left = eleStartX + touchDisX +'px';
          })
          wrap.addEventListener("touchend",function(){
              //判断下往左滑还是往右滑
              if(touchDisX > 0){
                //往右滑 正值  图片下标
                 index--;
              }else if(touchDisX < 0){
                  //往左滑 负值 图片下标
                   index ++;
              }
               //判断一下边界情况
              if(index < 0){
                  index = 0
              }else if(index > (arr.length - 1)){
                 index = arr.length - 1
              }
              node.style.transition = ".5s left";
              node.style.left = -index*document.documentElement.clientWidth+"px";
          })
       }
       w.swiper.init = init
       w.swiper.slide = slide
    })(window)