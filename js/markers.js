/*
 *  markers.js
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

function sign(value) {
  return (value<0)?-1:(value>0)?1:0;
}

var Marker=function Marker(options){
  if (!(this instanceof arguments.callee)) {                                                                                                                 
    return new arguments.callee(options);
  }           
  this.init(options);
}

$.extend(true,Marker.prototype,{
  defaults: {
    div: null,
    pos: {
      x: 0,
      y: 0
    },
    azimuth: 0,
    elevation: 0
  },
  init: function marker_init(options) {
    $.extend(true,this,this.defaults,options);
    this.parseNum=(true||this.inav.interpolate)?parseFloat:parseInt;
    this.div=$('<div class="marker">').appendTo(this.inav.target);
    $(this.div).data('marker',this);
    setTimeout(updateMarkers,100);
  },
  getCoords: function marker_getCoords(){
    this.rel_azimuth=180/Math.PI*Math.atan((this.pos.xImg[0]-this.inav.img[0].width/2)*Math.PI*Alpha()/180);
    this.rel_elevation=180/Math.PI*Math.atan((this.inav.img[0].height/2-this.pos.yImg[0])*Math.PI*Alpha()/180);
//      this.azimuth=180/Math.PI*Math.atan((this.pos.xImg[0]-this.inav.camera.x0)*Alpha());
//      this.elevation=180/Math.PI*Math.atan((this.inav.camera.y0-this.pos.yImg[0])*Alpha());
    var coords=this.inav.getCoords(this.pos.xImg[0],this.pos.yImg[0]);
    this.azimuth=coords.azimuth;
    this.elevation=coords.elevation;
  },
  getAzimuth: function marker_getAzimuth(){
    return this.azimuth;
  },
  getElevation: function marker_getElevation() {
    return this.elevation;
  },
  showInfo: function marker_showInfo() {
    this.getCoords();
    if (!this.inav.info) {
      this.inav.info=$('<div class="info">').appendTo($(this.inav.target).parent());
    }
    var html='<div><table>';
    if (this.inav.img[this.inav.view].src.match('_EQR')) {
      html+='<tr><td>Azimuth:</td><td>'+Math.round((this.getAzimuth())*1000)/1000+'&deg;</td></tr>';
      html+='<tr><td>Elevation:</td><td>'+Math.round((this.getElevation())*1000)/1000+'&deg;</td></tr>';
    } else {
      html+='<tr><td>X:</td><td>'+Math.round((this.xImg[0])*1000)/1000+'&deg;</td></tr>';
      html+='<tr><td>Y:</td><td>'+Math.round((this.YImg[0])*1000)/1000+'&deg;</td></tr>';
    } 
  //    html+='<tr class=".info.range"><td>Distance:</td><td>'+(Math.round(this.distanceFromCamera)/100)+'m</td></tr>';
    html+='</table></div>';
    this.inav.info.html(html);
  },
  draw: function marker_draw(){
    $(this.div).css({
      top: this.pos.y-8,
      left: this.pos.x-8,
      width: 17,
      height: 17
    }); 
    if (this.num) {
      $(this.div).text(this.num);
    }
  },

  updatePos: function marker_updatePos(){
    var sx=this.inav.canvas.width/this.inav.srcWidth;
    var sy=this.inav.canvas.height/this.inav.srcHeight;
    if (true || this.inav.interpolate) {
      this.pos.x=(this.pos.xImg[this.inav.view]-this.inav.scrollLeft_value)*sx;
      this.pos.y=(this.pos.yImg[this.inav.view]-this.inav.scrollTop_value)*sy;
    } else {
      this.pos.x=Math.floor((this.pos.xImg[this.inav.view]-this.inav.scrollLeft_value+0.5)*sx);
      this.pos.y=Math.floor((this.pos.yImg[this.inav.view]-this.inav.scrollTop_value+0.5)*sy);
    }
  },

  setPos: function marker_setPos(offsetX,offsetY) {
    var self=this;
    var roll=this.inav.camera.roll;
    roll=parseInt((roll+45*sign(roll))/90)*90;
    var sx=self.inav.canvas.width/self.inav.srcWidth;
    var sy=self.inav.canvas.height/self.inav.srcHeight;
    var X,Y;
    if (true || this.inav.interpolate) {
      X=self.inav.scrollLeft_value+offsetX/sx;
      Y=self.inav.scrollTop_value+offsetY/sy;
    } else {
      X=Math.floor(self.inav.scrollLeft_value+offsetX/sx);
      Y=Math.floor(self.inav.scrollTop_value+offsetY/sy);
    }
    var _Y,_X;
    if (self.inav.view==0) {
      _X=X;
      _Y=Y;
    } else {

      if (_mode.rotate) {
        switch(roll) {
        case -90:
          _X=self.inav.img[1].height-Y-1;
          _Y=X;
          break;
        case 90:
          _X=Y;
          _Y=self.inav.img[1].width-X-1;
          break;
        default:
          _X=X;
          _Y=Y;
          break;
        }
      } else {
        _X=X;
        _Y=Y;
      }

      /*
      var Xo,Yo;
      Xo=(X-self.inav.img[1].width/2)/(self.inav.img[1].width/2);
      Yo=(Y-self.inav.img[1].height/2)/(self.inav.img[1].height/2);
      _X=Xo*cos(self.inav.camera.roll)-Yo*sin(self.inav.camera.roll);
      _Y=Xo*sin(self.inav.camera.roll)+Yo*cos(self.inav.camera.roll);
      _X=_X*(self.inav.img[1].width/2)+(self.inav.img[1].width/2);
      _Y=_Y*(self.inav.img[1].height/2)+(self.inav.img[1].height/2);
      console.log(_X,_Y);
      */
      /*
      switch(self.inav.camera.channel) {
      case 24:
        _X=Y;
        _Y=self.inav.img[1].width-X;
        break;
      case 25:
        _X=self.inav.img[1].height-Y;
        _Y=X;
        break;
      default:
        _X=self.inav.img[1].height-Y;
        _Y=X;
        break;
      }
      */
    }

    $.ajax({
      url: 'php/pixel.php',
      type: 'POST',
      data: 'cmd='+(self.inav.view?'dst':'src')+'&x='+_X+'&y='+_Y+'&chan='+(self.inav.camera.channel<10?'0':'')+self.inav.camera.channel,
      dataType: 'text',
      async: false
    }).done(function(coords){
      console.log(_X+' '+_Y+' -> '+coords);
      var XCoords;
      var YCoords;
      var YX=coords.split(' ');
      if (self.inav.view==0) {
       /* 
      Xo=(parseFloat(YX[0])-self.inav.img[1].width/2)/(self.inav.img[1].width/2);
      Yo=(parseFloat(YX[1])-self.inav.img[1].height/2)/(self.inav.img[1].height/2);
      Xo=(parseFloat(YX[0])-self.inav.img[1].width/2);
      Yo=(parseFloat(YX[1])-self.inav.img[1].height/2);
      console.log('roll',roll);
      _X=Xo*cos(roll+0)-Yo*sin(roll+0);
      _Y=Xo*sin(roll+0)+Yo*cos(roll+0);
//      _X=_X*(self.inav.img[1].width/2)+(self.inav.img[1].width/2);
//      _Y=_Y*(self.inav.img[1].height/2)+(self.inav.img[1].height/2);
      var dX=dY=0;
//      var dX=self.inav.img[1].width/2-self.inav.img[1].height/2;
//      var dY=self.inav.img[1].height/2-self.inav.img[1].width/2;
      _X=_X+(self.inav.img[1].width/2)+dX;
      _Y=_Y+(self.inav.img[1].height/2)-dY;
*/
/*        switch(roll) {
        case 0:
          _Y=self.parseNum(YX[0]);
          _X=self.parseNum(YX[1]);
          break;
        case -90:
          _Y=self.parseNum(YX[0]);
          _X=self.parseNum(YX[1]);
          break;
        case 90:
          _Y=self.parseNum(YX[0]);
          _X=self.inav.img[1].width-self.parseNum(YX[1]);
          break;
        }
      console.log('yo',_X,_Y);
        XCoords=[X,self.parseNum(_X)];
        YCoords=[Y,self.parseNum(_Y)];
*/
        if (_mode.rotate) {
          switch(roll) {
          case 90:
            XCoords=[X,self.parseNum(self.inav.img[1].width-parseFloat(YX[1])-1)];
            YCoords=[Y,self.parseNum(YX[0])];
            break;
          case -90:
            XCoords=[X,self.parseNum(parseFloat(YX[1]))];
            YCoords=[Y,self.parseNum(self.inav.img[1].height-parseFloat(YX[0])-1)];
            break;
          default:
            XCoords=[X,self.parseNum(parseFloat(YX[0]))];
            YCoords=[Y,self.parseNum(parseFloat(YX[1]))];
          }
        } else {
            XCoords=[X,self.parseNum(parseFloat(YX[0]))];
            YCoords=[Y,self.parseNum(parseFloat(YX[1]))];
        }
        /*
        switch(self.inav.camera.channel) {
        case 24:
          XCoords=[X,self.inav.img[1-self.inav.view].width-self.parseNum(YX[1])];
          YCoords=[Y,self.parseNum(YX[0])];
          break;
        case 25:
          YCoords=[Y,self.inav.img[1-self.inav.view].height-self.parseNum(YX[0])];
          XCoords=[X,self.parseNum(YX[1])];
          break;
        default:
          XCoords=[X,self.inav.img[1-self.inav.view].width-self.parseNum(YX[1])];
          YCoords=[Y,self.parseNum(YX[0])];
          break;
        }
        */
      } else {
        if (_mode.rotate) {
          switch(roll) {
          case 90:
            //XCoords=[self.inav.img[0].width-self.parseNum(YX[0])-1,X];
            XCoords=[self.parseNum(YX[0]),X];
            YCoords=[self.parseNum(YX[1]),Y];
            break;
          case -90:
            XCoords=[self.parseNum(YX[0]),X];
            YCoords=[self.parseNum(YX[1]),Y];
            break;
          default:
            XCoords=[self.parseNum(YX[0]),X];
            YCoords=[self.parseNum(YX[1]),Y];
            break;
          }
        } else {
          XCoords=[self.parseNum(YX[0]),X];
          YCoords=[self.parseNum(YX[1]),Y];
        }
      }
      self.pos={
        x: offsetX,
        y: offsetY,
        xImg: XCoords,
        yImg: YCoords
      }
      self.inav.center={
        h: self.pos.xImg[self.inav.view],
        v: self.pos.yImg[self.inav.view],
        lock: true
      };
    });
  }
});

function addMarker(e) {
  if ($(e.target).hasClass('marker')) return;
  var offsetX=e.offsetX || (e.clientX - $(e.target).offset().left);
  var offsetY=e.offsetY || (e.clientY - $(e.target).offset().top);
  var _inav=getInav(e);

  var sx=_inav.canvas.width/_inav.srcWidth;
  var sy=_inav.canvas.height/_inav.srcHeight;

  var interpolate=true;//_inav.interpolate;
  if (!interpolate) {
    offsetX=Math.floor(offsetX-(offsetX%sx)+sx/2);
    offsetY=Math.floor(offsetY-(offsetY%sy)+sy/2);
  }

  var marker=_inav.marker;
  if (marker) {
    $(marker.div).remove();
    _inav_marker=null;
  }
  marker=_inav.marker=new Marker({
    inav: _inav
  });

  marker.setPos(offsetX,offsetY);

  marker.div
  .on('mousedown.marker',function markerMousedown(e){
    var marker=$(e.target).data('marker');
    var marker=e.target;
    _mode.drag=true;
    $('.info, .button',$(e.target).closest('.panel')).hide();

  $(document)
    .off('.marker')
    .on('mousemove.marker',function markerMousemove(e){
      var offsetX=e.offsetX || (e.clientX - $(e.target).offset().left);
      var offsetY=e.offsetY || (e.clientY - $(e.target).offset().top);
      $(marker).css({
          top: (offsetY+e.target.offsetTop-8),
          left: (offsetX+e.target.offsetLeft-8)
      });
    })
    .on('mouseup.marker',function markerMouseup(e){
      var marker=$(e.target).data('marker');
      $(document).off('mousemove.marker').off('mouseup.marker');
      _mode.drag=false;
      marker.setPos(marker.parseNum(marker.div.css('left'))+8,marker.parseNum(marker.div.css('top'))+8);
      marker.updatePos();
      marker.draw();
      $('.info, .button').show();
      marker.showInfo();
      showDistance();
    })
    .on('mousewheel.marker',mouseWheel);
  })
  .on('mouseover.marker',function(e){
    var div=e.target;
    if (_mode.drag) {
      $(div).attr('title','');
      return;
    }
    var marker=$(div).data('marker');
    $(div).attr('title',Math.round(marker.pos.xImg[0]*1000)/1000+', '+Math.round(marker.pos.yImg[0]*1000)/1000);
  })
  .on('mouseout.marker',function(e){
    var div=e.target;
    $(div).attr('title','');
  });

  marker.showInfo();
  showDistance();
}

function updateMarkers() {
  $('.marker').each(function updateMarkersLoop(){
    var marker=$(this).data('marker');
    if (marker) {
      marker.updatePos();
      marker.draw();
    }
  });
}

