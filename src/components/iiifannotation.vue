<template>
  <div class="iiifannotation"  v-if="rendered === true">
    <select v-if="languages.length > 0" class="lang_drop" v-on:change="changeLang($event)" v-html="languages.join('')"></select>
    <div v-for="item in annotation_items" :key="item.id" :id="item.id">
    <span v-for="image in item.image" :key="image">
    <span v-html="image" id="annoimage"></span>
    </span>
    <img v-bind:src="item.fullImage" style="display:none;" id="fullimage" v-bind:alt="manifest['label']" v-bind:style="[settings.imagesettings !== undefined ? settings.imagesettings : '']">
    <div id="content" v-show="item.rendered_content && item.rendered_content !== '' && settings.image_only !== true" v-html="item.rendered_content"></div>
    <div v-show="settings.view_tags !== false" v-html="item.tags"></div>
    <button v-on:click="toggle($event)" class="togglebutton" v-show="item.fullImage && item.fullImage !== '' && settings.view_larger !== false">View Full Image</button>
    <div id="link_to_object" v-show="settings.view_full_object !== false && full_object && full_object !== '' && settings.image_only != true">
      Full object: <a v-bind:href="full_object" target="_blank">{{manifest["label"]}}</a>
    </div>
    <div>
  </div>
  </div>
  </div>
  <div v-else-if="rendered === false">
  "{{annotationlist}}{{annotationurl}}" did not render. Please ensure your annotation link is correct.<br>
  Make sure the annotation contains a link to a working manifest. If it does not add manifest url to tag using the "manifesturl" property.<br>
  Also ensure you did not sure the wrong property for your annotation (annotationlist for lists of annotations and annotationurl for single annotations)
  </div>
</template>

<script>
import axios from 'axios';
import shared from './shared';

export default {
  name: 'iiifannotation',
  props: {
    'annotationurl': {type: String, required: false},
    'annotationlist':{type: String, required: false},
    'manifesturl':{type: String, required: false},
    'styling': {type: String, required: false}
  },
  data: function() {
    return {
      anno: '',
      manifest: '',
      settings: {},
      manifestlink: '',
      annotation_items: [],
      rendered: '',
      annotation_json: '',
      languages: []
      }
  },
  created() {
    this.settings = shared.getsettings(this.styling);
    if (this.settings.height){
      var width = this.settings.width ? this.settings.width : 'auto';
      this.settings.imagesettings = {'height':this.settings.height, 'width':width};
    } else if (this.settings.width) {
      this.settings.imagesettings = {'width':this.settings.width};
    }
    this.annotation_json = this.annotationlist ? this.annotationlist : this.annotationurl;
    axios.get(this.annotation_json).then(response => {
      this.anno = response.data.resources ? response.data.resources : response.data.items ? response.data.items : response.data;
      this.anno = Array.isArray(this.anno) ? this.anno : [].concat(this.anno);
      this.manifestlink = shared.manifestlink(this.manifesturl, this.anno[0], response.data)
    }).catch((error) => {this.rendered = false;console.log(error);}).then(() => {
        if (this.manifestlink) {
          this.getManifestData()
        } else {
          this.annoloop(false)
        }
    })
  },
  methods: {
    toggle: function(event){
      var parent = event.target.parentElement;
      var fullImage = parent.querySelector("#fullimage");
      var change_html = event.srcElement !== undefined ?  event.srcElement : event.target;
      if (fullImage.style.display === 'none'){
        fullImage.style.display='inline-block';
        change_html.innerHTML = "Hide Full Image";
      } else {
        fullImage.style.display= 'none';
        change_html.innerHTML = "View Full Image";
      }
    },
    fullImage: function(baseImageUrl, canvasRegion){
      var fullImage =  canvasRegion !== "full" ? baseImageUrl + '/full/1200,/0/default.jpg' : '';
      return fullImage;

    },
    getManifestData: function(){
      axios.get(this.manifestlink).then(response => {
        this.manifest = response.data;
        this.annoloop(true);
      }).catch((error) => {this.rendered = false; console.log(error);})
    },
    changeLang: function(event){
      var lang = event.target ? event.target.value : event;
      for(var ai=0; ai<this.annotation_items.length; ai++){
        this.annotation_items[ai]['rendered_content'] = shared.createContent(this.annotation_items[ai]['content'], lang);
      }
    },
    annoloop: function(hasmanifest) {
      for (var i =0; i < this.anno.length; i++){
        var dictionary = this.getImageData(this.anno[i], this.annotation_json, i);
        var ondict = shared.on_structure(this.anno[i]);
        var canvasId = this.anno[i].target !== undefined ? this.anno[i].target : ondict[0].full ? ondict.map(element => element.full) : ondict.flatMap(element => element);
        canvasId = [].concat(canvasId);
        var size;
        if (this.manifestlink.indexOf('iiif/2.0') > -1){
          size = '1200,';
        } else {
          size = 'full';
        }
        if (hasmanifest) {
          var imagedata = this.getManifestCanvas(canvasId, this.anno[i], size, dictionary)
          dictionary['image'] = dictionary['image'].concat(imagedata['image']);
          dictionary['fullImage'] = imagedata['fullImage'];
        } else {
          for (var cn = 0; cn < canvasId.length; cn++){
            var canvasItem = canvasId[cn]
            var imagehtml;
            var canvasRegion = shared.canvasRegion(canvasItem, undefined);
            var imageurl = `${canvasRegion['canvasId']}/${canvasRegion['canvasRegion']}/${size}/0/default.jpg`
            var path = shared.getSVGoverlay(ondict[cn]);
            if (path) {
              imagehtml = this.createSVG(imageurl, canvasRegion['canvasRegion'], dictionary, path, cn)
            } else {
              imagehtml = document.createElement("img");
              imagehtml.setAttribute('src', imageurl);
              imagehtml.setAttribute('alt', dictionary['altText']);
            }
            for (var key in this.settings.imagesettings){
              imagehtml.style[key] = this.settings.imagesettings[key];
            }
            dictionary['image'].push(imagehtml.outerHTML);
            dictionary['fullImage'] = this.fullImage(canvasRegion['canvasId'], canvasRegion['canvasRegion']);
          }
        }
        if (!dictionary['image']){
          this.rendered = false;
        } else {
          this.rendered = true;
        }
        this.annotation_items.push(dictionary);
      }
    },
    createSVG: function(imageurl, regionCanvas, dictionary, path, position) {
      var id = dictionary['id'] + '-' + position;
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute('viewBox', regionCanvas.split(",").join(" "));
      svg.setAttribute('aria-label', dictionary['altText']);
      for (var key in this.settings.imagesettings){
        svg.style[key] = this.settings.imagesettings[key];
      }
      var inner = `<defs><pattern patternUnits="objectBoundingBox" id="${id}"  width="100%" height="100%">
      <image xlink:href="${imageurl}" width="100%" height="100%" x="0" y="0" />
      </pattern></defs>`
      path.setAttribute("fill", `url(#${id})`);
      path.setAttribute("fill-opacity", "1");
      path.setAttribute("stroke", "none")
      svg.innerHTML = inner + path.outerHTML;
      return svg;
    },
    getManifestCanvas: function(canvasId, anno, size, dictionary){
      var images = [];
      var fullImage;
      for (var cn = 0; cn < canvasId.length; cn++){
        var canvasItem = canvasId[cn];
        var ondict = shared.on_structure(anno);
        var canvasRegion = shared.canvasRegion(canvasItem, ondict[cn]);
        for(var idx = 0; idx < this.manifest.sequences[0].canvases.length; idx++){
          var existing = this.manifest.sequences[0].canvases[idx];
          if(existing['@id'].replace("https", "http") === canvasRegion['canvasId'].replace("https", "http")){
            var canvas = existing;
          }
        }
        var regionCanvas = canvasRegion['canvasRegion'];
        var baseImageUrl;
        if (canvas === undefined) {
          baseImageUrl = canvasItem.split("#")[0];
        } else {
          baseImageUrl  = canvas.images[0].resource.service['@id']  ? canvas.images[0].resource.service['@id'] : canvas.images[0].resource['@id'];
        }
        var path = shared.getSVGoverlay(ondict[cn])
        var imageurl = `${baseImageUrl}/${regionCanvas}/${size}/0/default.jpg`;
        var imagehtml;
        if (path) {
          imagehtml = this.createSVG(imageurl, regionCanvas, dictionary, path, cn)
        } else {
          imagehtml = document.createElement("img");
          imagehtml.setAttribute('src', imageurl);
          imagehtml.setAttribute('alt', dictionary['altText']);
        }
        for (var key in this.settings.imagesettings){
          imagehtml.style[key] = this.settings.imagesettings[key];
        }
        images.push(imagehtml.outerHTML)
        fullImage = this.fullImage(baseImageUrl, regionCanvas);
      }
      return {'fullImage': fullImage, 'image': images}
    },
    getImageData: function(anno, annotation_json, i){
      var dictionary = {'image':[]};
      if (this.settings.image_only !== true){
        var dict = shared.chars(anno);
        dict['authors'] = shared.getAuthor(anno);
        this.languages = dict['languages'] ? [...new Set(this.languages.concat(dict['languages']))] : this.languages;
        this.currentlang = this.currentlang ? this.currentlang : dict['textual_body'][0] && dict['textual_body'][0]['language'];
        dictionary['rendered_content'] = shared.createContent(dict, this.currentlang);
        dictionary['content'] = dict;
        dictionary['id'] = annotation_json.split("/").slice(-1).pop().replace(".json", "") + i;
        dictionary['altText'] = dict['ocr'].length > 0 ? dict['ocr'][0] : dict['label'] !== undefined ? dict['label'] : `Image section of "${this.manifest['label']}"`;
        dictionary['altText'] = dictionary['altText'].replace(/(\r\n|\n|\r)/gm, " ");
        dictionary['tags'] = dict['tags'].length > 0 ? `<div class="tagging">${dict['tags'].join('</div><div class="tagging">')}</div>` : "";
      } else {
        dictionary['altText'] = `Image section of "${this.manifest['label']}"`;
        dictionary['id'] = annotation_json.split("/").slice(-1).pop().replace(".json", "") + i;
        this.settings.view_larger = false;
      }
      return dictionary;
    }
  },
  computed: {
    full_object: function(){
      var link;
      var keys = Object.keys(this.manifest);
      if (keys.indexOf("related") > -1){
        if (typeof this.manifest.related === 'string'){
          link = this.manifest.related;
        } else {
          link = this.manifest.related['@id'];
        }
      } else {
          link = keys.indexOf("seeAlso") > -1 ? this.manifest.seeAlso['@id'] : '';
      }
      return link;
    }
  }
}
</script>

<style lang="scss">
@import '../iiif-annotation.scss'
</style>
