(function (w) {
   w.scroll = {};

   function init({wrap,start,move,end,over}){

       //挑选一个适配方案
       var styleNode = document.createElement("style");
       var w = document.documentElement.clientWidth/16;
       styleNode.innerHTML = `html{font-size:${w}px!important}`;
       document.head.appendChild(styleNode)
       //禁止移动端事件的默认行为
       wrap.addEventListener("touchstart",(ev)=>{
           ev = ev || event;
           ev.preventDefault();
       })

       sxmove(wrap,start,move,end,over)
   }

   function sxmove(wrap,start,move,end,over){
       var node = wrap.children[0]
       var minY = wrap.clientHeight - node.offsetHeight;

       var eleStartX = 0;
       var eleStartY =0;
       var szStartX = 0;
       var szStartY = 0;

       var lastPoint = 0;
       var lastTime = 0;
       var pointDisY = 0; //滑屏元素实时滑动的位移
       var timeDisY = 0;

       //防抖动需要的变量
       var isFirst = true; //让一段逻辑只执行一次需要的变量
       var isY = true; //用户的滑屏方向是否是Y轴 

       //即点即停需要的变量 
       var clearTimer = 0;

       wrap.addEventListener("touchstart",(ev)=>{
           ev = ev || event;
           //防止minY在外部拿的不精确
           minY = wrap.clientHeight - node.offsetHeight;
           var touchC = ev.changedTouches[0];

           eleStartX = transform.css(node,"translateX");
           eleStartY = transform.css(node,"translateY");
           szStartX  = touchC.clientX;
           szStartY  = touchC.clientY;

           //touchstart时手指的位置
           lastPoint =  touchC.clientY;
           lastTime = new Date().getTime();

           node.style.transition="";
           node.handMove = false;
           pointDisY =0;
           timeDisY =1; //避免出现nan 导致意想不到的bug

           //防抖动的值得重新置回来
           isFirst = true;
           isY = true;

           //实现即点即停
           clearInterval(clearTimer)

           //定义touchstart的钩子函数
           start && (typeof start === "function") && start.call(node)
       })
       wrap.addEventListener("touchmove",(ev)=>{
           //看门狗
           if(!isY){
              //咬住
              return; //防的是后续的抖动  
           } 

           ev = ev || event;
           var touchC = ev.changedTouches[0];

           var nowPoint = touchC.clientY; //当次touchmove时 手指的位置
           var nowTime = new Date().getTime();
           pointDisY = nowPoint - lastPoint //当次touchmove 距离 上一次touchmove 我们手指移动的距离
           timeDisY = nowTime - lastTime;
           lastPoint = nowPoint;
           lastTime = nowTime;

           var szNowX = touchC.clientX;
           var szNowY = touchC.clientY;
           var szDisX = szNowX - szStartX;
           var szDisY = szNowY - szStartY;
           var translateY = eleStartY + szDisY;

           var scale = 1;
           if(translateY > 0){
               //左侧橡皮筋效果的逻辑
               node.handMove = true; //如果为true代表了进行了手动橡皮筋效果的
               scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + translateY)*2.5);
           }else if (translateY < minY) {
               //右侧橡皮筋效果的逻辑
               node.handMove = true;
               var over = minY - translateY;
               scale = document.documentElement.clientWidth / ((document.documentElement.clientWidth + over)*2.5);
           }
           translateY = transform.css(node,"translateY")+(pointDisY*scale);
           
           //判断用户上来的首次滑屏方向
           if(isFirst){
              isFirst = false
              //如果在手指的滑动方向是X轴 则需要停止整个滑屏逻辑
              if(Math.abs(szDisX) > Math.abs(szDisY)){
                 //说明滑动的方向 是偏向y轴的
                 isY = false;
                 return; //防的是首次抖动
              }
           }
           transform.css(node,"translateY",translateY)
           //为手动滑屏添加move钩子
           move && (typeof move === "function") && move.call(node)
       })
       wrap.addEventListener("touchend",()=>{


           if(node.handMove){
               var translateY = transform.css(node,"translateY");
               if(translateY > 0){
                   //左侧橡皮筋
                   translateY = 0;
               }else if (translateY < minY) {
                   //右侧橡皮筋
                   translateY = minY;
               }
               node.style.transition = ".5s transform"
               transform.css(node,"translateY",translateY);
           }else{
               fast()
           }
           //为touchend添加end钩子
           end && (typeof end === "function") && end.call(node)

           function fast() {

                //Tween算法相关的函数
                var Tween = {
                    Linear: function(t,b,c,d){ return c*t/d + b; },
                    Back: function(t,b,c,d,s){
                        if (s == undefined) s = 1.70158;
                        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
                    }
                }

                function tweenMove(type,translateY,time){
                    clearInterval(clearTimer);
                    var t=0;    //代表的是当前是哪一次
                    var b=transform.css(node,"translateY") //快速滑
                    var c=translateY - b;
                    var d=((time*1000)/(1000/60)); //总次数
                    clearTimer = setInterval(() => {
                        t++;
                        if(t>d){
                           clearInterval(clearTimer);
                           //快速滑屏结束
                           over && (typeof over === "function") && over.call(node)
                           return;  
                        }
                        //为快速滑屏添加move钩子
                        move && (typeof move === "function") && move.call(node)
                        transform.css(node,"translateY",Tween[type](t,b,c,d))
                    }, 1000/60);    
                }

               var time = 1; //快速滑屏的总时间     
               var speed = pointDisY / timeDisY;
               speed = Math.abs(speed) < 0.5 ? 0 : speed;
              
               var translateY = transform.css(node,"translateY");
               translateY = translateY + speed*200;

               var type = "Linear";
               if(translateY > 0){
                   //左侧橡皮筋
                   translateY = 0;
                  type = "Back";
               }else if (translateY < minY) {
                   //右侧橡皮筋
                   translateY = minY;
                   type = "Back";
               }
               tweenMove(type,translateY,time)
           }
       })
   }

   w.scroll.init = init;
})(window)