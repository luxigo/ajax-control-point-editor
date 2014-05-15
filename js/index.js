/*
 *  index.js
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

var inav=[];

var defaults={
  inav: [{
    view: 0,
    file: undefined,
    color: true,
    interpolate: true
  },{
    view: 0,
    file: undefined,
    color: true,
    interpolate:true
  }]
};

var saved_prefs=xml_parse($.cookie('prefs'),[
  'scrollLeft_value',
  'scrollTop_value',
  'interpolate',
  'xImg',
  'yImg'
]).prefs;
if (saved_prefs && saved_prefs.markers && !Array.isArray(saved_prefs.markers)) {
  saved_prefs.markers=[saved_prefs.markers];
}
var prefs=$.extend(true,{},defaults,saved_prefs);

/*
$(document).on('mousemove',function(e){
  var div=$('.mousecoords');
  if (!div.size()) {
    div=$('<div class="mousecoords">').appendTo('body');
    div.css({
        position: "fixed",
        top: 10,
        left: 10,
        color: "white",
        backgroundColor: "rgba(0,0,0,0.5)"
    });
  }
  var _inav=getInav(e);
  if (!_inav) return;
  var sx=_inav.canvas.width/_inav.srcWidth;
  var sy=_inav.canvas.height/_inav.srcHeight;
  var offsetX=e.offsetX || (e.clientX - $(e.target).offset().left);
  var offsetY=e.offsetY || (e.clientY - $(e.target).offset().top);

  var X=(_inav.scrollLeft_value+offsetX/sx);
  var Y=(_inav.scrollTop_value+offsetY/sy);
  div.html('x:'+X+' y:'+Y);
});
*/

var _mode={
  rotate: false
};

var image=[
  {
//    dir: 'data/imagej_processed',
//    timestamp: '1385738991_372910',
//    chan:'10',
    panel: '.left'
  },
  {
//    dir: 'data/imagej_processed',
//    timestamp: '1385738991_372910',
//    chan:'24',
    panel: '.right'
  }
];

function controlPoints_add() {
  $(cp).each(function(){
    var marker=inav[1].marker=new Marker({
        inav: inav[1],
        pos: {
          xImg: this.x,
          yImg: this.y
        },
        num: $('.marker',inav[1].target).length
    });
    $(marker.div).addClass('saved');
    marker=inav[0].marker=new Marker({
        inav: inav[0],
        pos: {
          xImg: this.X,
          yImg: this.Y
        },
        num: $('.marker',inav[0].target).length
    });
    $(marker.div).addClass('saved');
  });
}

function markers_load(markers) {
  $(markers).each(function(i,elem){
      var inum=elem.inum;
      var marker_details={
        inav: inav[inum],
        pos: elem.pos
      };
      if (elem.num) {
        marker_details.num=elem.num;
      }
      var marker=new Marker(marker_details);
      if (elem.num) {
        marker.div.addClass('saved');
      } else {
        inav[inum].marker=marker;
      }
  });
  $(markers).each(function(i,elem){
    if (elem.num) {
       var distance=getDistanceFromBase();
       get3DCoords(distance.value0);
    }
  });
}

function parseSearchString(){
  var search=document.location.href.replace(/^[^\?]+\?/,'').split('&');
  var obj={};

}

function xml2obj(xml) {
  var obj={};
  $(xml).each(function(){
    var val=parseFloat($(this).text());
    if (isNaN(val)) {
      val=$(this).text();
    }
    obj[this.tagName]=val;
  });
  return obj;
}

function getInav(e) {
  var _inav;
  $(inav).each(function(){
    if (!(this instanceof $.image_navigator)) return true;
    if ($(e.target.parentNode).closest('.panel').attr('class')==$(this.target).closest('.panel').attr('class')) {
      _inav=this;
      return false;
    }
  });
  return _inav;
}

function pointMatch() {
  if (!inav[0] || !inav[1] || !inav[0].marker || !inav[1].marker || Math.abs(inav[0].marker.getAzimuth()-inav[1].marker.getAzimuth())>1) {
    $('.info.range div:last').empty();
    _mode.pointmatch=false;
    try{inav[0].isGroupedBool=false;} catch(e) {}
    try{inav[1].isGroupedBool=false;} catch(e) {}
  } else {
    _mode.pointmatch=true;
    inav[0].isGroupedBool=true;
    inav[1].isGroupedBool=true;
  }
  return _mode.pointmatch;
}

function showDistance() {
  if (!inav[0] || !inav[0].marker || !inav[1] || !inav[1].marker) return;
  inav[0].marker.getCoords();
  inav[1].marker.getCoords();

  if (!pointMatch()) return;

  var distance=getDistanceFromBase();
  get3DCoords(distance.value0);
  reproject();

  var div=$('div.info.range','.container').show();
  if (!div.length) {
    div=$('<div class="info range"><div class="list"></div><div class="current"></div></div>').appendTo('.container');
    noWheeling();
  }
  var html='<div><table>';
  html+='<tr><td colspan="3"><input type="checkbox" class="keep"></td></tr>';
  html+='<tr><td>Disparity:</td><td>'+Math.round(getDisparity(1))+' px</td></tr>';
  //html+='<tr><td>Distance:</td><td>'+distance.value+' m</td>';
  //html+='<td>&plusmn;'+distance.delta+' m</td></tr>';
  html+='</table></div>';
  $('div.current',div).html(html);
}

function getDisparity(view) {
    return Math.abs(inav[0].marker.pos.yImg[view]-inav[1].marker.pos.yImg[view]);
    return Math.abs(inav[0].marker.pos.yImg[view]-inav[1].marker.pos.yImg[view]);
}

var interCameraVector=[];
function Base(){
  var cam=[inav[0].camera,inav[1].camera];
  var y0=cam[0].height;
  var r0=cam[0].radius;//+cam[0].entrancePupilForward;
  var x0=Math.abs(r0*sin(cam[0].azimuth));
  var z0=Math.abs(r0*cos(cam[0].azimuth));
  var y1=cam[1].height;
  var r1=cam[1].radius;//+cam[1].entrancePupilForward;
  var x1=Math.abs(r1*sin(cam[1].azimuth));
  var z1=Math.abs(r1*cos(cam[1].azimuth));
  var dx=x1-x0;
  var dy=y1-y0;
  var dz=z1-z0;
  console.log(dx,dy,dz);
  var base=Math.sqrt(dx*dx+dy*dy+dz*dz);
  interCameraVector[0]=Vector.create([dx,dy,dz]);
  interCameraVector[1]=Vector.create([-dx,-dy,-dz]);
  return base;
}

/**
 * return angle between a unit vector in image coordinates system
 * and the inter-camera vector in camera coordinates system
 * @param chan sensor channel
 * @param azimuth in image coordinate system
 * @param elevation in image coordinate system
 * @return angle between unit vector in image coordinates system and the inter-camera vector
*/
function angleFromBase(chan,azimuth,elevation) {
  // compute unit vector in camera coordinates system
  var cam=inav[chan].camera;
  var uZ=Vector.create([0,0,1]);
  var Rx=Matrix.RotationX(elevation*Math.PI/180);
  var Ry=Matrix.RotationY(azimuth*Math.PI/180);
  var tmp=Ry.multiply(uZ);
  var uC=Rx.multiply(tmp);

  // align y axis with inter-camera vector
  // 1. compute x rotation
  var v=interCameraVector[chan];
  var yz=Math.sqrt(v.elements[1]*v.elements[1]+v.elements[2]*v.elements[2]);
  var aX=Math.acos(v.elements[1]/yz);
  // 2. compute y rotation
  var r=interCameraVector[chan].modulus();
  var aY=Math.acos(yz/r);
  console.log('aX:'+aX,'aY:'+aY);
  // 3. rotate
  tmp=Matrix.RotationX(-aX).multiply(uC);
  var C=Matrix.RotationY(-aY).multiply(tmp);

  console.log('angle from 0:'+ C.angleFrom(interCameraVector[0])*180/Math.PI);
  console.log('angle from 1:'+ C.angleFrom(interCameraVector[1])*180/Math.PI);
  return C.angleFrom(interCameraVector[chan]);
}

function cos(x) {
  x=x%360;
  if (x==0) return 1;
  if (x==90) return 0;
  if (x==180) return -1;
  if (x==270) return 0;
  return Math.cos(x*Math.PI/180);
}
function sin(x) {
  x=x%360;
  if (x==0) return 0;
  if (x==90) return 1;
  if (x==180) return 0;
  if (x==270) return -1;
  return Math.sin(x*Math.PI/180);
}
function tan(x) {
  x=x%360;
  if (x==0) return 0;
  if (x==180) return 0;
  return Math.tan(x*Math.PI/180);
}

function focalLengthPix() {
  return (inav[0].camera.focalLengthPix+inav[1].camera.focalLengthPix)/2;
}

function get3DCoords(Z) {

  var marker=inav[0].marker;
  marker.coords={
    x: marker.pos.xImg[1] * inav[0].camera.pixelSize * Z / inav[0].camera.focalLength / 1000,
    y: marker.pos.yImg[1] * inav[0].camera.pixelSize * Z / inav[0].camera.focalLength / 1000,                  
    z: Z  
  }       
  marker.coords2=polarToRectangular(Z,marker.rel_azimuth,marker.rel_elevation);

  var marker=inav[1].marker;
  marker.coords={
    x: marker.pos.xImg[1] * inav[1].camera.pixelSize * Z / inav[1].camera.focalLength / 1000,
    y: marker.pos.yImg[1] * inav[1].camera.pixelSize * Z / inav[1].camera.focalLength / 1000,                  
    z: Z  
  }       
  marker.coords2=polarToRectangular(Z,marker.rel_azimuth,marker.rel_elevation);
}

function reproject() {
  var marker=inav[0].marker;
}

function getDistanceFromPreviousMarker() {
  $('.marker',inav[0].target).each(function(){
    var marker=$(this).data('marker');

    if (marker.distance) {
      return true;
    }

    var marker2=inav[0].getMarker(marker.num+1);
    if (marker2) {
      return true;
    }
    marker2=inav[0].marker;
    if (marker==marker2) {
      return true;
    }

    var dx=marker.coords.x-marker2.coords.x;
    var dy=marker.coords.y-marker2.coords.y;
    var dz=marker.coords.z-marker2.coords.z;
    marker.distance=Math.sqrt(dx*dx+dy*dy+dz*dz);
    console.log('distance from cam0:',marker.distance);
    return false;

  });

  $('.marker',inav[1].target).each(function(){
    var marker=$(this).data('marker');
    if (marker.distance) {
      return true;
    }
    var marker2=inav[1].getMarker(marker.num+1);
    if (marker2) {
      return true;
    }
    marker2=inav[1].marker;
    if (marker==marker2) {
      return true;
    }

    var dx=marker.coords.x-marker2.coords.x;
    var dy=marker.coords.y-marker2.coords.y;
    var dz=marker.coords.z-marker2.coords.z;
    marker.distance=Math.sqrt(dx*dx+dy*dy+dz*dz);
    console.log('distance from cam1:',marker.distance);
    return false;

  });
}

function polarToRectangular(r,azimuth,elevation) {
  return {
    x: r*sin(elevation)*cos(azimuth),
    y: r*sin(elevation)*sin(azimuth),
    z: r*cos(elevation)
  }
}

function getDistanceFromBase() {
  var base=Base();
  var distance0=base * focalLengthPix() / getDisparity(1);
  var distance=Math.round(distance0/10)/100;
  var delta0= distance0*distance0/base*Alpha()*0.3;
  var delta0= Math.abs(distance0-(base * focalLengthPix() / (getDisparity(1)+0.3)));
  var delta=Math.round(delta0)/1000;
  return {
    value: distance,
    value0: distance0,
    delta: delta
  };
}

function mouseWheel(e,delta,deltaX,deltaY) {
  var _inav=getInav(e);
  if (deltaY<0) {
    zoomWheel(e,_inav,'out',_inav.zout_iteration);
  }
  if (deltaY>0) {
    zoomWheel(e,_inav,'in',_inav.zin_iteration);
  }
}

function zoomWheel(e,_inav,way,iteration){
  if (_inav.wheeling!=way) {
    noWheeling();
    _inav.wheeling=way;
    if (_inav.isGrouped(e)) {
      $(inav).each(function(){
        this.wheeling=way;
        this.zoom_init();
        switch(way) {
        case 'in':
          if (this.zoom>_inav.zoom) {
            _inav.zoom=this.zoom;
          } else {
            this.zoom=_inav.zoom;
          }
          break;
        case 'out':
          if (this.zoom>_inav.zoom) {
            this.zoom=_inav.zoom;
          } else {
            _inav.zoom=this.zoom;
          }
          break;
        }
      });
    } else {
      _inav.zoom_init();
    }
  }
  if (_inav.isGrouped()) {
      $(inav).each(function(){
        this.mode.zooming=true;
        iteration.call(this);
        this.mode.zooming=false;
      });
  } else {
    _inav.mode.zooming=true;
    iteration.call(_inav);
    _inav.mode.zooming=false;
  }
}

function switchView(e) {
  var view;
  $.each(inav,function(){
    if (!(this instanceof $.image_navigator)) {
      return true;
    }
    if (view==undefined) {
      view=1-this.view;
    }
    this.setView(view);
  });

  updateMarkers();
}

function noWheeling() {
  $(inav).each(function(){
    this.wheeling=false;
  });
}

function Alpha(){
  return 360/inav[0].eqr.ImageFullWidth;
}

function setupInav(options) {

  var inum=options.inum;
  if (options.file) {
    image_load(options.file,$.extend({inum:inum},options),function(){
    });
    return;
  } else {
  }

  var panel=image[inum].panel;
  $('.panel'+panel).data('inum',inum);

  var basename;
  if (image[inum].dir!=undefined && image[inum].timestamp!=undefined && +image[inum].chan!=undefined) {
    basename=image[inum].dir+'/'+image[inum].timestamp+'-'+image[inum].chan+'-DECONV-RGB24';
    if (inav && inav[inum]) {
      inav[inum].img[0].src=basename+'_EQR.jpg';
      return;
    }
  }

  console.log('on');
  var $img=$('img:first',panel+' .img');
  var $img1=$('img:last',panel+' .img');
  if (!$img.data('events')) {
    $img
    .on('error'+panel,function (e){
      $.notify('Could not load image: '+$img.attr('src'));
    })
    .on('load'+panel,function imgLoad(e){
      console.log('load RECT',panel,e.target);
      var canvas;
      var ctx;
      var img;
      img=e.target;
      canvas=$('canvas',panel+' .img')[0];
      ctx=canvas.getContext('2d');
      $.ajax({
        url: 'calibration_data/'+image[inum].chan+'.xml',
        dataType: 'xml',
        success: function(xml){
          function v(tag){
            return parseFloat($(tag,xml).text());
          }
          var camera=$.extend(xml2obj($('properties *',xml)),{
            focalLengthPix: (v('focalLength')+v('entrancePupilForward'))/(v('pixelSize')/1000),
            //focalLengthPix: (v('focalLength'))/(v('pixelSize')/1000),
          });
          $.ajax({
            url: 'eqr_data/'+image[inum].chan+'.xml',
            dataType: 'xml',
            success: function(xml) {
              var _inav=$(img).data('inav');
              if (!_inav) {
                _inav=new $.image_navigator($.extend({
                  zoomin_elem: panel+' .zoomin',
                  zoomout_elem: panel+' .zoomout',
                  scrollleft_elem: panel+' .navleft',
                  scrollright_elem: panel+' .navright',
                  scrollup_elem: panel+' .navup',
                  scrolldown_elem: panel+' .navdown',
                  target: panel+' .img',
                  camera: camera,
                  eqr: xml2obj($('properties *',xml)),
                  img: [img],
                  ctx: ctx,
                  canvas: canvas,
                  view: 0,
                  color: true
                },options));
                inav=_inav.getList();
                $(img).data('inav',_inav);
                inav[options.inum]=_inav;
                $('.panel'+panel).data('inum',inum);
              } else {
                $.extend(_inav,{
                    ctx: ctx,
                    eqr: xml2obj($('properties *',xml)),
                    camera: camera
                },options);
                if (_inav.offscreen_canvas) _inav.offscreen_canvas.update=true;
                _inav.offscreen_canvas=null;
              }
              var src=$img.attr('src').replace(/_RECT/,'_EQR');
              $img1.attr('src',src);
            }
          });
        }
      });
    });
    $(panel+' .img')
    .on('click.'+panel+'Img','canvas',function(e) {
      addMarker(e);
      prefs_save();
      pointMatch();
    })
    .on('mousewheel.'+panel+'Img',mouseWheel);
    $img.data('events',true);
  }
  if (!$img1.data('events')) {
    $img1
    .on('error'+panel,function (e){
      $.notify('Could not load image: '+$img1.attr('src'));
    })
    .on('load'+panel,function(e){
      console.log('load persp',e);
      var _inav=$img.data('inav');
      var roll=_inav.camera.roll;
      roll=parseInt((roll+45*sign(roll))/90)*90;
      console.log('roll',roll);
      if (_mode.rotate && Math.abs(roll)==90) {
        var src=document.createElement('canvas');
        var dst=document.createElement('canvas');
        var w=e.target.width;
        var h=e.target.height;
        src.width=w;
        src.height=h;
        dst.width=h;
        dst.height=w;
        var ctx0=src.getContext('2d');
        var ctx1=dst.getContext('2d');
        ctx0.drawImage(e.target,0,0);
        var srcImageData=ctx0.getImageData(0,0,w,h);
        var dstImageData=ctx1.createImageData(h,w);

        switch(roll) {
        case 90:
          var yy=h;
          for(var y=0; y<h; ++y) {
            var srcOffset=4*(y*w);
            --yy;
            for (var x=0; x<w; ++x) {
              var dstOffset=4*(x*h+yy);
              dstImageData.data[dstOffset]=srcImageData.data[srcOffset];
              dstImageData.data[dstOffset+1]=srcImageData.data[srcOffset+1];
              dstImageData.data[dstOffset+2]=srcImageData.data[srcOffset+2];
              dstImageData.data[dstOffset+3]=srcImageData.data[srcOffset+3];
              srcOffset+=4;
            }
          }
          break;
        case -90:
          for(var y=0; y<h; ++y) {
            var srcOffset=4*(y*w);
            var xx=w;
            for (var x=0; x<w; ++x) {
              --xx;
              var dstOffset=4*(xx*h+y);
              dstImageData.data[dstOffset]=srcImageData.data[srcOffset];
              dstImageData.data[dstOffset+1]=srcImageData.data[srcOffset+1];
              dstImageData.data[dstOffset+2]=srcImageData.data[srcOffset+2];
              dstImageData.data[dstOffset+3]=srcImageData.data[srcOffset+3];
              srcOffset+=4;
            }
          }
        }
        ctx1.putImageData(dstImageData,0,0);
        src=null;
        _inav.img[1]=dst;
      } else {
        _inav.img[1]=e.target;
      }
      _inav.updateCanvas();
    });
    $img1.data('events',true);
  }
  console.log('src');
  if (basename) {
    $img.attr('src',basename+'_RECT.jpg');
  }
}

function setupButtons() {

  $('.button.text').each(function(){
    if ($(this).hasClass('relief')) return true;
    var className='.'+this.className.split(' ').join('.');
    $(className+'.relief').width($(className).width());
  });

  $('.button.view').on('click',switchView);
  $('.button.load').on('click',function(e){
    var inum=$(e.target).closest('.panel').data('inum');
    if (inum!=undefined) {
      channel_select(inum);
    }
  });
  $('.button.color').on('click',function(e){
    var inum=$(e.target).closest('.panel').data('inum');
    if (inum!=undefined) {
      inav[inum].color=(inav[inum].color!=true);
      inav[inum].updateCanvas();
    }
  });
  $('.button.interpolate').on('click',function(e){
    var inum=$(e.target).closest('.panel').data('inum');
    if (inum!=undefined) {
      inav[inum].interpolate=(inav[inum].interpolate!=true);
      inav[inum].updateCanvas();
    }
  });
}

function disableSelectAndDrag() {
  $(document).on('selectstart.unselectable dragstart.undraggable',function unselectable(e){
    return $(e.target).hasClass('ui-draggable');
  });
}

var prefs_save_timeout;
function prefs_save(now) {
  if (!now) {
    if (prefs_save_timeout) clearTimeout(prefs_save_timeout);
    setTimeout(function(){prefs_save(true)},300);
    return;
  }
  $([
      'zoom',
      'scrollLeft_value',
      'scrollTop_value',
      'interpolate',
      'color'
  ]).each(function(i,property){
    if (inav[0]) prefs.inav[0][property]=inav[0][property];
    if (inav[1]) prefs.inav[1][property]=inav[1][property];
  });
  var matches=[];
  $('.marker').each(function(i,e){
    var marker=$(e).data('marker');
    matches.push({
      num: marker.num,
      inum: marker.inav.inum,
      pos: {
        xImg: marker.pos.xImg,
        yImg: marker.pos.yImg
      }
    });
  });
  prefs.markers=matches;
  $.cookie('prefs',toXML(prefs,{header:true,wrapper:'prefs'}));
}

$(document).ready(function documentReady(){

  disableSelectAndDrag();

  setupButtons();

  setupInav($.extend({inum:0,view:0},prefs.inav[0]));
  setupInav($.extend({inum:1,view:0},prefs.inav[1]));

  $('.left, .right').selrect(function selrectCallback(what){
    switch(what) {
    case 'mousedown':
      if ($(this.event.target).hasClass('button')) return false;
      if (_mode.drag) return false;
      break;
    case 'mouseup':
      console.log(this.rect);
      var _inav=getInav(this.event);
      var zoom=_inav.zoom;
      if (!_inav) return;
      var offset=$(_inav.canvas).offset();
      var sratio=_inav.srcWidth/_inav.srcHeight;
      var dratio=this.rect.width/this.rect.height;
      var scale=_inav.srcWidth/_inav.canvas.width;
      _inav.center={
        h: _inav.scrollLeft_value+((this.rect.left-offset.left+this.rect.width/2)*scale),
        v: _inav.scrollTop_value+((this.rect.top-offset.top+this.rect.height/2)*scale),
        lock: true
      }
      if (this.rect.width>this.rect.height) {
        _inav.zoom=Math.sqrt(_inav.img[_inav.view].width/(this.rect.width*scale));
      } else {
        _inav.zoom=Math.sqrt(_inav.img[_inav.view].height/(this.rect.height*scale));
      }
      _inav.setupCanvasUpdate();
      _inav.updateCanvas();
      break;
    }
  });

  $(document).on('change','.keep',function(e){
    switch($(e.target).val()){
    case 'on':
      var div=$('.info.range div.current div')
      .remove();
//      .detach()
//      .appendTo('.info.range div.list');

      getDistanceFromPreviousMarker();
      $(inav).each(function(){
        this.marker.num=$('.marker',this.target).length;
        $(this.marker.div).addClass('saved');
        this.marker=null;
        prefs_save();
      });
      updateMarkers();
      break;

    case 'off':
      break;
    }
  });

  $(document).on('loaded',function(){
    markers_load(saved_prefs.markers);
  });

});

function channel(n) {
  var result;
  $.each(inav,function(i,_elem){
    if (_elem.camera.channel==n) {
      result=_elem;
      return false;
    }
  });
  if (!result) throw n+': no such camera channel';
  return result;
}

$.extend(true,$.image_navigator.prototype,{
  setView: function(view) {
    this.view=view;
    this.offscreen_canvas=null;
    if (this.marker) {
      this.center.h=this.marker.pos.xImg[view];
      this.center.v=this.marker.pos.yImg[view];
    }
    this.updateCanvas();
  },
  getMarker: function inav_getMarker(num) {
    var result;
    $('.marker',this.target).each(function(){
      var marker=$(this).data('marker');
      if (marker.num==num) {
        result=marker;
        return false;
      }
    });
    return result;
  },
  showCameraInfo: function inav_showCameraInfo(){
    var html='<table>';
    $.each(this.camera,function(property,value){
      html+='<tr><td>';
      html+=property;
      html+='</td><td>';
      html+=value;
      html+='</td></tr>';
    });
    html+='</table>';
    window.open('popup.php?body='+encodeURIComponent(btoa(html)),'channel '+this.camera.channel,'menubar=no,alwaysraised=yes,titlebar=no');
  },
  getCoords: function inav_getCoords(x,y) {
    return {
      azimuth: (this.eqr.XPosition+x)*360/this.eqr.ImageFullWidth,
      elevation: -180*(this.eqr.YPosition+y)/(this.eqr.ImageFullLength-1)+90
    };
  },
  isGrouped: function inav_isGrouped(e, elem){
    if (e) {
      this.isGroupedBool=e.shiftKey||_mode.pointmatch;
    }
    return this.isGroupedBool;
  },
  defaults: {
    callback: function imageNavigatorCallback(e){
      switch(e.type) {
      case 'mousedown':
        $('.info').hide();
        noWheeling();
        break;
      case 'mouseup':
      case 'mouseout':
        $('.info').show();
        break;
      case 'updatecanvas':
        if (saved_prefs && saved_prefs.loaded!=3) {
          saved_prefs.loaded|=1<<e.target.inum;
          if (saved_prefs.loaded==3) {
            setTimeout(function(){
              markers_load(saved_prefs.markers);
            },0);
          }
        }
        updateMarkers();
        prefs_save();
        break;
      }
      return true;
    }
  }
});

function channel_select(inum) {
  var div=$('#openFileDialog');
  if (!div.length) {
    div=$('<div id="openFileDialog">');
    div.fileTree({
      script: 'php/jqueryFileTree.php',
      folderEvent: 'click',
      loadMessage: 'Loading...'
    }, function(file) {
      var inum=div.data('inum');
      image_load(file,{inum:inum},function(){
        if (inav[inum]) {
          inav[inum].init({zoom:1});
        }
        div.dialog('close');
      });
    });
    div.wrap('<div id="wrap">');
  }
  div.data('inum',inum);
  div.dialog({
      container: '.panel'+image[inum].panel,
      modal: true,
      height: $('.panel'+image[inum].panel).height()-32,
      width: 480
  });
}

function image_load(file,options,callback) {
  var m=file.match(/(.*)\/([0-9_]+)\-([0-9]{2})\-DECONV\-RGB24/);
  var dir=m[1];
  var t=m[2];
  var chan=m[3];
  if (m) {
    $.ajax({
        url: 'php/convert.php',
        type: 'POST',
        data: 'dir=../data'+encodeURI(dir)+'&t='+encodeURI(t)+'&chan='+chan,
        async: false,
        fail: function() {
          console.log(arguments);
        },
    }).done(function(data){
      console.log('done');
      prefs.inav[options.inum].file=file;
      prefs_save();
      $.extend(image[options.inum],{
        chan: chan,
        timestamp: t,
        dir: 'jpg'
      });
      delete options.file;
      setupInav($.extend({},options));
      if (callback) callback();
    });
  }
}

function sign(value) {
  return (value<0)?-1:(value>0)?1:0;
}  
