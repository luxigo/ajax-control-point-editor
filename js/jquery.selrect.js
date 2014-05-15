/*
 *   selrect - jquery plugin implementing selection rectangle
 *   
 *   Copyright (C) 2010-2013 Luc Deschenaux - luc.deschenaux(a)freesurf.ch
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Example:
 * $('.container').selrect(selrect_callback);
 * $('.selrect').css({background:"#ccddee", opacity:"0.3"}) // (optional)
 *
*/

(function($) {

  var selrect = function(options) {

    if (!(this instanceof selrect)) {
      return new selrect(options);
    }

    var self=this;
    $.extend(this,options);

    this.init=function init() {

      if (this.container.getElementsByClassName('selrect').length) {
        throw("selrect: already initialized");
      }

      var rect=document.createElement('div');
      rect.className="selrect";
      rect.style.display="none";
      rect.style.position="absolute";
      rect.style.border="1px solid black";
      rect.style.borderStyle="dashed";
      $(this.container).append(rect);
      $(this.container).on('mousedown.selrect', this.mousedown);
      self.event={};
      this.callback('init');
    }
    
    this.mousedown=function mousedown(event) {

      if (event.button!=0) return;

      var x,y;
      x=event.pageX;
      y=event.pageY;
      self.event=event;

      if (self.callback("mousedown")===false) {
        return;
      }

      self.xorig=x;
      self.yorig=y;
      self.moving=false;
      
      $(document).on('mousemove.selrect', self.mousemove);
      $(document).on('mouseup.selrect', self.mouseup);

    }

    this.mousemove=function mousemove(event) {
   
      var x=event.pageX;                                                        
      var y=event.pageY;                                                        
      if (!self.moving) {

        if (!(Math.abs(self.xorig-x)>4 || Math.abs(self.yorig-y)>4)) return;

        $('.selrect',self.container).css({
            zIndex: 9999,
            display: 'block',
            top: self.xorig,
            left: self.yorig,
            width: 1,
            height: 1
        });
        self.moving=true; 
      }

      self.event=event;
      self.rect={};

      var w=x-self.xorig;
      if (w<0) {
        self.rect.left=x;
        self.rect.width=-w;
      } else {
        self.rect.left=self.xorig;
        self.rect.width=w;
      }
      
      var h=y-self.yorig;
      if (h<0) {
        self.rect.top=y;
        self.rect.height=-h;
      } else {
        self.rect.top=self.yorig;
        self.rect.height=h;
      }

      $('.selrect',self.container).css({
          left: self.rect.left,
          top: self.rect.top,
          width: self.rect.width,
          height: self.rect.height
      });

      self.callback("mousemove");

      return false;
    }

    this.mouseup=function mouseup(event) {

      self.event=event;
      
      $(document).off('mousemove.selrect',selrect.mousemove);
      $(document).off('mouseup.selrect',selrect.mouseup);

      if (self.moving) {

        $('.selrect',self.container).css({
          display: 'none'
        });
      
        self.callback("mouseup");
      }
    }

    this.init();
  }

  $.fn.selrect=function(callback) {
    this.each(function () {
      selrect({
          container: this,
          callback: callback
      });
    });
    return this;
  };

}) (jQuery);

