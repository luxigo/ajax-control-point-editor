/*
 * Copyright (c) 2011-2013 by David Calhoun (david.b.calhon@gmail.com).
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is furnished to do
 * so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var toXML = function(obj,config){
  // include XML header
  config = config || {};
  var CRLF='\n';
  var out = config.header ? '<?xml version="1.0" encoding="UTF-8"?>'+CRLF : '';
  
  var origIndent = config.indent || '';
  indent = '';

  if (config.wrapper) {
    out+='<'+config.wrapper+'>'+CRLF;
    indent+='  ';
  }
  var filter = function customFilter(txt) {
    if(!config.filter) return txt;
    var mappings = config.filter;
    var replacements = [];
    for(var map in mappings) {
      if(!mappings.hasOwnProperty(map)) continue;
      replacements.push(map);
    }
    return String(txt).replace(new RegExp('(' + replacements.join('|') + ')', 'g'), function(str, entity) {
      return mappings[entity] || '';
    });
  };
  
  // helper function to push a new line to the output
  var push = function(string){
    out += string + (origIndent ? CRLF : '');
  };
  
  /* create a tag and add it to the output
     Example:
     outputTag({
       name: 'myTag',      // creates a tag <myTag>
       indent: '  ',       // indent string to prepend
       closeTag: true,     // starts and closes a tag on the same line
       selfCloseTag: true,
       attrs: {            // attributes
         foo: 'bar',       // results in <myTag foo="bar">
         foo2: 'bar2'
       }
     });
  */
  var outputTag = function(tag){
    var attrsString = '';
    var outputString = '';
    var attrs = tag.attrs || '';
    
    // turn the attributes object into a string with key="value" pairs
    for(var attr in attrs){
      if(attrs.hasOwnProperty(attr)) {
        attrsString += ' ' + attr + '="' + attrs[attr] + '"';
      }
    }
    
    // assemble the tag
    outputString += (tag.indent || '') + '<' + (tag.closeTag ? '/' : '') + tag.name + (!tag.closeTag ? attrsString : '') + (tag.selfCloseTag ? '/' : '') + '>';
    
    // if the tag only contains a text string, output it and close the tag
    if(tag.text || tag.text === ''){
      outputString += filter(tag.text) + '</' + tag.name + '>';
    }
    
    push(outputString);
  };
  
  // custom-tailored iterator for input arrays/objects (NOT a general purpose iterator)
  var every = function(obj, fn, indent, outputTagObj){
    // array
    if(Array.isArray(obj)){
      var count=0;
      obj.every(function(elt){  // for each element in the array
        if (outputTagObj) {
          outputTagObj.closeTag=false;
          outputTag(outputTagObj);
          fn(elt, indent);
          outputTagObj.closeTag=true;
          outputTag(outputTagObj);
        } else {
          push(indent+'<i_'+count+'>');
          fn(elt, indent);
          push(indent+'</i_'+count+'>');
          ++count;
        }
        return true;            // continue to iterate
      });
      
      return;
    }
    
    // object with tag name
    if(obj._name){
      fn(obj, indent);
      return;
    }
    
    // iterable object
    for(var key in obj){
      var type = typeof obj[key];

      if(obj.hasOwnProperty(key) && (obj[key] || type === 'boolean' || type === 'number')){
        fn({_name: key, _content: obj[key]}, indent);
      //} else if(!obj[key]) {   // null value (foo:'')
      } else if(obj.hasOwnProperty(key) && obj[key] === null) {   // null value (foo:null)
        fn(key, indent);       // output the keyname as a string ('foo')
      } else if(obj.hasOwnProperty(key) && obj[key] === '') {
        // blank string
        outputTag({
          name: key,
          text: ''
        });
      }
    }
  };
  
  var convert = function convert(input, indent){
    var type = typeof input;
    
    if(!indent) indent = '';
    
    if(Array.isArray(input)) type = 'array';
    
    var path = {
      'string': function(){
        push(indent + filter(input));
      },

      'boolean': function(){
        push(indent + (input ? 'true' : 'false'));
      },
      
      'number': function(){
        push(indent + input);
      },
      
      'array': function(){
        every(input, convert, indent);
      },
      
      'function': function(){
        push(indent + input());
      },
      
      'object': function(){
        if(!input._name){
          every(input, convert, indent);
          return;
        }
        
        var outputTagObj = {
          name: input._name,
          indent: indent,
          attrs: input._attrs
        };
        
        var type = typeof input._content;

        if(type === 'undefined'){
          outputTagObj.selfCloseTag = true;
          outputTag(outputTagObj);
          return;
        }
        
        var objContents = {
          'string': function(){
            outputTagObj.text = input._content;
            outputTag(outputTagObj);
          },

          'boolean': function(){
            outputTagObj.text = (input._content ? 'true' : 'false');
            outputTag(outputTagObj);
          },
          
          'number': function(){
            outputTagObj.text = input._content.toString();
            outputTag(outputTagObj);
          },
          
          'object': function(){  // or Array
            if (!Array.isArray(input._content)) {
              outputTag(outputTagObj);
            }
            
            every(input._content, convert, indent + origIndent,$.extend(true,{},outputTagObj));
            
            if (!Array.isArray(input._content)) {
              outputTagObj.closeTag = true;
              outputTag(outputTagObj);
            }
          },
          
          'function': function(){
            outputTagObj.text = input._content();  // () to execute the fn
            outputTag(outputTagObj);
          }
        };
        
        if(objContents[type]) objContents[type]();
      }
      
    };
    
    if(path[type]) path[type]();
  };
  
  convert(obj, indent);
 
  if (config.wrapper) {
    out+=origIndent+'</'+config.wrapper+'>'+CRLF;
  }
  return out;
};

function xml_parse(xml,tagNames) {
  if (!Array.isArray(tagNames)) {
    tagNames=[];
  }       
  var lowerTagNames=[];
  $(tagNames).each(function(i,tag){
    lowerTagNames.push(tag.toLowerCase());
  });     
  var obj={};
  $(xml).each(function(){
    if (!this.tagName) {
      console.log(this);
      return true;
    }     
    var tag=this.tagName.toLowerCase();
    if (tag=="markers") {
      var wesh='yo';
    }     
    var match=lowerTagNames.indexOf(tag);
    if (match>=0) {
      tag=tagNames[match];
    }     
    var children=$(this).children();
    var value=(children.length)?xml_parse(children,tagNames):$(this).text();
    if (isNaN(value)) {
      switch(value) {
      case "true":
        value=true;
        break;                                                                                                                                                                                                       
      case "false":
        value=false;
        break;
      }   
    } else {
      value=parseFloat(value);
    }     
    if (obj[tag]==undefined) {
      obj[tag]=value;
    } else {
      if (Array.isArray(obj[tag])) {
        obj[tag].push(value);
      } else {
        obj[tag]=[obj[tag],value];
      }   
    }     
  });     
  return obj;
}         

