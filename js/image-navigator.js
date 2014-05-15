/*
 *  imagenavigator.js
 *
 *  Copyright (C) 2014 Foxel www.foxel.ch
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 *      Author: luc.deschenaux@foxel.ch
 */

(function($){

  var inav=[];

  function image_navigator(options){
    if (!(this instanceof arguments.callee)) {
      return new arguments.callee(options);
    }
    this.mode={};
    if (false)
    $(['zoom','scrollLeft_value','scrollTop_value']).each(function(i,property){
      if (typeof(options[property]=="string")) options[property]=parseFloat(options[property]);
      if (isNaN(options[property])) options[property]=0;
    });
    this.init(options);
  }

  function isMode(mode) {
    var result=false;
    $(inav).each(function(){
      var _this=this;
      if (!(this instanceof image_navigator)) return true; 
      if (this.mode[mode]) {
        result=true;
        return false;
      }
    });
    return result;
  }

  function setMode(mode,val) {
    $(inav).each(function(){
      var _this=this;
      if (!(this instanceof image_navigator)) return true; 
      this.mode[mode]=val;
    });
  }

  $.extend(image_navigator.prototype,{

    defaults:{
      zoom: 1,
      max: 200,
      scrollLeft_value: 0,
      scrollTop_value: 0,
      _scrollHeight: 0,
      _scrollWidth: 0,
      speed0: 1.01,
      accel0: 2,
      delay: 1000/30,
      callback: function(e){},
      color: true
    },

    getList: function getList(){
      return inav;
    },

    oldsetupCanvasUpdate: function setupCanvasUpdate(){
      var container=$(this.target);
      var canvas=this.canvas;
      var zoom=this.zoom;
      var img=this.img[this.view];

      var destWidth=container.width();
      var destHeight=container.height();
      var imgWidth=img.width;
      var imgHeight=img.height;


      var srcWidth;
      var srcHeight; 
      if (destHeight>destWidth){
        srcHeight=/*Math.floor*/(imgHeight/zoom);
        srcWidth=/*Math.floor*/(srcHeight*destHeight/destWidth);
        if (srcWidth>/*Math.floor*/(imgWidth/zoom)) {
          srcWidth=/*Math.floor*/(imgWidth/zoom);
          destHeight=/*Math.floor*/(destWidth/(imgWidth/imgHeight));
        }
      } else {
        srcWidth=/*Math.floor*/(imgWidth/zoom);
        srcHeight=/*Math.floor*/(srcWidth/(destWidth/destHeight));
        if (srcHeight>/*Math.floor*/(imgHeight/zoom)) {
          srcHeight=/*Math.floor*/(imgHeight/zoom);
          destWidth=/*Math.floor*/(destHeight/(imgHeight/imgWidth));
        }
      }

      this._scrollHeight=imgHeight-srcHeight;
      this._scrollWidth=imgWidth-srcWidth;

      if (canvas.width!=destWidth) {
        canvas.width=destWidth;
      }
      if (canvas.height!=destHeight) {
        canvas.height=destHeight;
      }
     
      var scrollLeft;
      var scrollTop;
      if (this.center && !isMode('scrolling')){
        scrollLeft=this.center.h-srcWidth/2;
        scrollLeft=Math.max(0,Math.min(scrollLeft,this._scrollWidth));
        scrollTop=this.center.v-srcHeight/2;
        scrollTop=Math.max(0,Math.min(scrollTop,this._scrollHeight));
        this.scrollLeft_value=scrollLeft;
        this.scrollTop_value=scrollTop;
      }
      if (!this.center || (!this.center.lock && !isMode('zooming'))) { 
        scrollLeft=Math.min(this.scrollLeft_value,this._scrollWidth);
        scrollTop=Math.min(this.scrollTop_value,this._scrollHeight);
        this.scrollLeft_value=scrollLeft;
        this.scrollTop_value=scrollTop;
        this.center={
          h: /*Math.floor*/(scrollLeft+srcWidth/2),
          v: /*Math.floor*/(scrollTop+srcHeight/2),
        }
      }

      if (this.scrollLeft_value+srcWidth>imgWidth) {
        this.scrollLeft_value=imgWidth-srcWidth;
      }

      if (this.scrollTop_value+srcHeight>imgHeight) {
        this.scrollTop_value=imgHeight-srcHeight;
      }

      this.scrollTop_value=/*Math.floor*/(this.scrollTop_value);
      this.scrollLeft_value=/*Math.floor*/(this.scrollLeft_value);

      this.srcWidth=srcWidth;
      this.srcHeight=srcHeight;
    },

    setupCanvasUpdate: function setupCanvasUpdate(){
      var container=$(this.target);
      var canvas=this.canvas;
      var zoom=this.zoom;
      var img=this.img[this.view];
      var canvasWidth=container.width();
      var canvasHeight=container.height();
      var imgWidth=img.width;
      var imgHeight=img.height;
      var srcWidth;
      var srcHeight;

      // Compute source region and container size
      // so that image fill the container horizontally
      // and container is resized vertically as needed
     
      srcWidth=imgWidth/zoom/zoom;
      var scale=canvasWidth/srcWidth;

      var imgRatio=imgWidth/imgHeight;

      srcHeight=imgHeight/zoom;
      if (srcHeight>imgHeight) {
        srcHeight=imgHeight;
      }
      canvasHeight=canvasWidth/imgRatio*zoom;
      if (canvasHeight>container.height()) {
        var heightRatio=container.height()/canvasHeight;
        canvasHeight=container.height();
        srcHeight*=heightRatio;
      }

      if (canvas.width!=canvasWidth) {
        canvas.width=canvasWidth;
      }
      if (canvas.height!=canvasHeight) {
        canvas.height=canvasHeight;
      }

      this._scrollHeight=imgHeight*zoom-srcHeight;
      this._scrollWidth=imgWidth*zoom-srcWidth;

      var scrollLeft;
      var scrollTop;
      if (this.center && !isMode('scrolling')){
        scrollLeft=this.center.h-srcWidth/2;
        scrollLeft=Math.max(0,Math.min(scrollLeft,this._scrollWidth));
        scrollTop=this.center.v-srcHeight/2;
        scrollTop=Math.max(0,Math.min(scrollTop,this._scrollHeight));
        this.scrollLeft_value=scrollLeft;
        this.scrollTop_value=scrollTop;
      }
      if (!this.center || (!this.center.lock && !isMode('zooming'))) { 
        scrollLeft=Math.min(this.scrollLeft_value,this._scrollWidth);
        scrollTop=Math.min(this.scrollTop_value,this._scrollHeight);
        this.scrollLeft_value=scrollLeft;
        this.scrollTop_value=scrollTop;
        this.center={
          h: (scrollLeft+srcWidth/2),
          v: (scrollTop+srcHeight/2)
        }
      }

      if (this.scrollLeft_value+srcWidth>imgWidth) {
        this.scrollLeft_value=imgWidth-srcWidth;
      }

      if (this.scrollTop_value+srcHeight>imgHeight) {
        this.scrollTop_value=imgHeight-srcHeight;
      }

      this.scrollTop_value=(this.scrollTop_value);
      this.scrollLeft_value=(this.scrollLeft_value);

      this.srcWidth=srcWidth;
      this.srcHeight=srcHeight;
    },

    updateCanvas: function updateCanvas() {
      if (!(this instanceof image_navigator)) {
        console.trace();
        return;
      }
      this.setupCanvasUpdate();
      var img=this.img[this.view];
      this.ctx.drawImage(img,this.scrollLeft_value,this.scrollTop_value,this.srcWidth,this.srcHeight,0,0,this.canvas.width,this.canvas.height);
      if (this.redrawImageTimeout) clearTimeout(this.redrawImageTimeout);
      if (!this.interpolate || !this.color) {
        var self=this;
        this.redrawImageTimeout=setTimeout(function(){
          var img=self.img[self.view];
          self.redrawImage(img,self.scrollLeft_value,self.scrollTop_value,self.srcWidth,self.srcHeight,0,0,self.canvas.width,self.canvas.height);
          self.redrawImageTimeout=null;
        },500);
      }

      this.callback.apply(this,[{type: 'updatecanvas', target: this}]);
    },

    getPixel: function(imgData,x,y) {
      var offset=4*(y*imgData.width+x);
      return [
        imgData.data[offset],
        imgData.data[offset+1],
        imgData.data[offset+2],
        imgData.data[offset+3],
      ];
    },

    setPixel: function (imgData,x,y,rgba) {
      var offset=4*(y*imgData.width+x);
      imgData.data[offset]=rgba[0];
      imgData.data[offset+1]=rgba[1];
      imgData.data[offset+2]=rgba[2];
      imgData.data[offset+3]=rgba[3];
    },

    redrawImage: function(img,scrollLeft,scrollTop,srcWidth,srcHeight,unused,unused2,destWidth,destHeight) {
      var canvas=this.offscreen_canvas;
      if (!canvas) {
       this.offscreen_canvas=document.createElement('canvas');
      }
      var ctx=this.offscreen_canvas.getContext('2d');
      if (!canvas || canvas.update) {
        canvas=this.offscreen_canvas;
        canvas.width=img.width;
        canvas.height=img.height;
        ctx.drawImage(img,0,0);
        canvas.update=false;
      }
      var sx=destWidth/srcWidth;
      var sy=destHeight/srcHeight;
      var srcImageData=ctx.getImageData(scrollLeft,scrollTop,srcWidth,srcHeight);
      var dstImageData=this.ctx.createImageData(destWidth,destHeight);

      if (this.color) {
        if (this.interpolate) {
          for (var y=0; y<destHeight; ++y) {
            for(var x=0; x<destWidth; ++x) {
              bicubic_atXY(srcImageData,x/sx,y/sy,dstImageData,x,y);
            }
          }
        } else {
          for (var y=0; y<destHeight; ++y) {
            for(var x=0; x<destWidth; ++x) {
              this.setPixel(dstImageData,x,y,this.getPixel(srcImageData,Math.floor(x/sx),Math.floor(y/sy)));
            }
          }
        }
      } else {
        if (this.interpolate) {
          for (var y=0; y<destHeight; ++y) {
            for(var x=0; x<destWidth; ++x) {
              var rgba=bicubic_atXY(srcImageData,x/sx,y/sy);
              rgba[0]=rgba[1]; rgba[1]= rgba[2]=rgba[1];
              rgba[3]=255;
              this.setPixel(dstImageData,x,y,rgba);
            }
          }
        } else {
          for (var y=0; y<destHeight; ++y) {
            for(var x=0; x<destWidth; ++x) {
              var rgba=this.getPixel(srcImageData,Math.floor(x/sx),Math.floor(y/sy));
              rgba[0]=rgba[1]; rgba[1]= rgba[2]=rgba[1];
              rgba[3]=255;
              this.setPixel(dstImageData,x,y,rgba);
            }
          }
        }
      }
      this.ctx.putImageData(dstImageData,0,0);
    },

    getZoom: function getZoom() {
      return this.zoom;
    },

    setZoom: function setZoom(zoom) {
      this.zoom=zoom;
      this.updateCanvas();
    },

    isGrouped: function(e, elem){
      if (e) {
        this.isGroupedBool=e.shiftKey;
      }
      return this.isGroupedBool;
    },

    scrollLeft: function scrollLeft(val){
      if (val) {
        if (val<0) val=0;
        else {
          var width=this.scrollWidth();
          if (val>width) val=width;
        }
        this.scrollLeft_value=val;//Math.floor(val);
        this.updateCanvas();
      } else {
        return this.scrollLeft_value;
      }
    },

    scrollTop: function scrollTop(val){
      if (val) {
        if (val<0) val=0;
        else {
          var height=this.scrollHeight();
          if (val>height) val=height;
        }
        this.scrollTop_value=val;//Math.floor(val);
        this.updateCanvas();
      } else {
        return this.scrollTop_value;
      }
    },

    scrollHeight: function scrollHeight(){
      return this._scrollHeight;
    },

    scrollWidth: function scrollWidth(){
      return this._scrollWidth;
    },

    ctrl_mousedown: function ctrl_mousedown(e,elem,iteration,init){
      if (e.button!=0) return;
      if (this.callback(e)===false) return;

      var self=this;
      var modeName=$(elem).data('modeName');
      this.mode[modeName]=true;

      if (this.isGrouped(e)) {
        $(inav).each(function(){
          if (!(this instanceof image_navigator)) return true; 
          init.call(this);
        });
      } else {
        init.call(this);
      }
    
      $(elem).data('interval',setInterval(function(){
        if (self.isGrouped()) {
          $(inav).each(function(){
            if (!(this instanceof image_navigator)) return true; 
            iteration.call(this);
          });
        } else {
          iteration.call(self);
        }
      },self.delay));
    },

    zoom_init: function zoom_init() {
      this.speed=this.speed0;
      this.accel=this.accel0;
      this.zoomMin=1;
      if (!this.center || (this.center && !this.center.lock)) {
    /*      this.center={
            h: this.scrollLeft/this.scrollWidth*this.img.width,
            v: this.scrollTop/this.scrollHeight*this.img.height
          }
          */
      }
    },

    zout_iteration: function zout_iteration() {
      this.zoom/=this.speed;
      if (this.zoom<this.zoomMin) {
        this.zoom=this.zoomMin;
        clearInterval($(this.zoomout_elem).data('interval'));
      }
      this.setZoom(this.zoom);
      this.speed+=this.accel/100;
      this.accel=this.accel*this.accel/2;
      this.callback.apply(this,[{type: 'iteration', target: this}]);
    },

    zin_iteration: function zin_iteration() {
      var target=$(this.target);
      this.zoom*=this.speed;
      if (this.zoom>this.max) {
        this.zoom=this.max;
        clearInterval($(this.zoomout_elem).data('interval'));
      }
      this.setZoom(this.zoom);
      this.speed+=this.accel/100;
      this.accel=this.accel*this.accel/2;
      this.callback.apply(this,[{type: 'iteration', target: this}]);
    },

    scroll_init: function scroll_init(){
      this.mode.scrolling=true;
      this.speed=this.speed0;
      this.accel=this.accel0;
      this.scrollTop_value=this.scrollTop();
      this.scrollLeft_value=this.scrollLeft();
    },

    sup_iteration: function sup_iteration() {
      this.scrollTop_value-=this.speed;
      if (this.scrollTop_value<0) this.scrollTop_value=0;
      this.scrollTop(this.scrollTop_value);
      this.speed+=this.accel;
      this.accel=this.accel*this.accel/2;
      this.callback.apply(this,[{type: 'iteration', target: this}]);
    },

    sdown_iteration: function sdown_iteration(){
      this.scrollTop_value+=this.speed;
      if (this.scrollTop_value>this.scrollHeight()) this.scrollTop_value=this.scrollHeight();
      this.scrollTop(this.scrollTop_value);
      this.speed+=this.accel;
      this.accel=this.accel*this.accel/2;
      this.callback.apply(this,[{type: 'iteration', target: this}]);
    },

    sright_iteration: function sright_iteration(){
      this.scrollLeft_value+=this.speed;
      if (this.scrollLeft_value>this.scrollWidth()) this.scrollLeft_value=this.scrollWidth();
      this.scrollLeft(this.scrollLeft_value);
      this.speed+=this.accel;
      this.accel=this.accel*this.accel/2;
      this.callback.apply(this,[{type: 'iteration', target: this}]);
    },

    sleft_iteration: function sleft_iteration(){
      this.scrollLeft_value-=this.speed;
      if (this.scrollLeft_value<0) this.scrollLeft_value=0;
      this.scrollLeft(this.scrollLeft_value);
      this.speed+=this.accel;
      this.accel=this.accel*this.accel/2;
      this.callback.apply(this,[{type: 'iteration', target: this}]);
    },

    init: function init(options){
      var self=this;

      $.extend(true,this,{},this.defaults,options);

      $(document).off('.zoomout',this.zoomout_elem).on('mousedown.zoomout',this.zoomout_elem,function(e){
        console.log('down');
        self.ctrl_mousedown.apply(self,[e,self.zoomout_elem,self.zout_iteration,function(){
          if (this.zoomout_elem!=self.zoomout_elem) {
            this.zoom=self.zoom;
          }
          this.zoom_init();
        }]);
      });
      $(this.zoomout_elem).data('modeName','zooming');

      $(document).off('.zoomin',this.zoomin_elem).on('mousedown.zoomin',this.zoomin_elem,function(e){
        self.ctrl_mousedown.apply(self,[e,self.zoomin_elem,self.zin_iteration,function(){
          if (this.zoomin_elem!=self.zoomin_elem) {
            this.zoom=self.zoom;
          }
          this.zoom_init();
        }]);
      });
      $(this.zoomin_elem).data('modeName','zooming');

      $(document).off('.scrollup',this.scrollup_elem).on('mousedown.scrollup',this.scrollup_elem,function(e){
        self.ctrl_mousedown.apply(self,[e,self.scrollup_elem,self.sup_iteration,self.scroll_init]);
      });
      $(this.scrollup_elem).data('modeName','scrolling');

      $(document).off('.scrolldown',this.scrolldown_elem).on('mousedown.scrolldown',this.scrolldown_elem,function(e){
        self.ctrl_mousedown.apply(self,[e,self.scrolldown_elem,self.sdown_iteration,self.scroll_init]);
      });
      $(this.scrolldown_elem).data('modeName','scrolling');

      $(document).off('.scrollright',this.scrollright_elem).on('mousedown.scrollright',this.scrollright_elem,function(e){
        self.ctrl_mousedown.apply(self,[e,self.scrollright_elem,self.sright_iteration,self.scroll_init]);
      });
      $(this.scrollright_elem).data('modeName','scrolling');

      $(document).off('.scrollleft',this.scrollleft_elem).on('mousedown.scrollleft',this.scrollleft_elem,function(e){
        self.ctrl_mousedown.apply(self,[e,self.scrollleft_elem,self.sleft_iteration,self.scroll_init]);
      });
      $(this.scrollleft_elem).data('modeName','scrolling');

      var elements=[
        this.zoomout_elem,
        this.zoomin_elem,
        this.scrollright_elem,
        this.scrollleft_elem,
        this.scrolldown_elem,
        this.scrollup_elem
      ];

      $(document)
      .off('mouseout.image_navigator mouseup.image_navigator',elements)
      .on('mouseout.image_navigator mouseup.image_navigator',elements,
      function(e){
        $.each(elements,function(i,elem){
          var interval=$(elem).data('interval');
          if (interval) {
            clearInterval(interval);
            $(elem).removeData('interval');
            var modeName=$(elem).data('modeName');
            if (modeName) {
              setMode(modeName,false);
            }
          }
        });
        self.callback(e);
      });

      self.updateCanvas();
      $(document).off('resize.image_navigator').on('resize.image_navigator',function(e){
        clearTimeout(self.resizeTimeout);
        self.resizeTimeout=setTimeout(function(e){
          self.updateCanvas.call(self);
        },20); 
      });
    }
  });

  $.image_navigator=image_navigator;

})(jQuery);

