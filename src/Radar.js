define([
  'src/RadarDetector',
  'src/tools',
  'src/registry'
], function(
  RadarDetector,
  tools,
  registry
){

  // FIXME: key events do not belong here!

  var Radar = function(player){
    this.objects = [];
    this.nodes = [];
    this.radarDetector = new RadarDetector(player.camera, this.objects);
    this.cockpit = player.cockpit;
    this.camera = player.camera;

    this.input = registry.get('input');

    this.setup();
  };

  Radar.prototype = {

    cockpit: null,

    focusNext: false,

    focusedObject: null,

    isVisible: false,

    nodes: null,

    objects: null,

    radarDetector: null,

    radarNode: null,

    setup: function(){
      this.radarNode = document.createElement('div');
      this.radarNode.id = 'radar';
      this.cockpit.cockpitNode.appendChild(this.radarNode);

      this.infoNode = document.createElement('div');
      this.infoNode.id = 'radarInfo';
      this.radarNode.appendChild(this.infoNode);
    },

    addObject: function(object){
      var index = this.objects.length;
      object.radarIndex = index;
      this.objects[index] = object;
      this.nodes[index] = object.node = this.createObjectNode();
    },

    removeObject: function(id){
      var foundIndex = -1;
      this.objects.some(function(object){
        foundIndex = object.radarIndex;
        return object.id === id;
      });
      if(foundIndex >= 0){
        /* ... */
      }
    },

    focusNextObject: function(){
      var targetIndex = this.focusedObject ? this.focusedObject.radarIndex + 1 : 0;
      if(targetIndex == this.objects.length){
        targetIndex = 0;
      }
      this.focusedObject = this.objects[targetIndex];
    },

    createObjectNode: function(){
      var node = document.createElement('span');
      node.className = 'object';
      node.innerHTML = '&loz;';
      this.radarNode.appendChild(node);
      return node;
    },

    showRadar: function(){
      document.documentElement.classList.add('radar');
    },

    hideRadar: function(){
      document.documentElement.classList.remove('radar');
    },

    update: function(){
      if(!this.isVisible && !this.input.toggleRadar){
        return;
      }

      if(this.isVisible && this.input.toggleRadar){
        this.isVisible = false;
        this.input.toggleRadar = false;
        this.hideRadar();
        return;
      }

      this.radarDetector.update();
      if(this.input.focusNext){
        this.focusNextObject();
      }
      this.objects.forEach(function(object, index){
        // TODO: The following is a disaster regarding performance

        var oldLeft = object.radarLastLeft || Infinity,
            oldTop = object.radarLastTop || Infinity,
            left = object.radarLeft,
            top = object.radarTop,
            oldIsInFront = object.radarLastIsInFront,
            isInFront = object.radarIsInFront;

        var style = this.nodes[index].style;

        if(oldIsInFront !== isInFront){
          style.color = isInFront ? 'paleGreen' : 'silver';
          object.radarLastIsInFront = isInFront;
        }

        if(oldLeft.toFixed(1) != left.toFixed(1)){
          style.left = ( ( left / 2 + 50 ) - 3 ).toFixed(1) + '%'; // adjust by approx. half char-size
          object.radarLastLeft = left;
        }

        if(oldTop.toFixed(1) != top.toFixed(1)){
          style.top = ( ( top / 2 + 50) - 4 ).toFixed(1)  + '%'; // adjust by approx. half char-size
          object.radarLastTop = top;
        }

        if(this.input.focusNext){
          this.nodes[index].innerHTML = object.id == this.focusedObject.id ? '&diams;' : '&loz;';
        }
      }, this);

      if(this.input.focusNext){
        this.input.focusNext = false;
      }

      if(this.focusedObject){
        var dist = ( tools.getDistance(this.camera.position, this.focusedObject.model.position) / 1000 ).toFixed(2);
        this.infoNode.innerHTML = 'type: ' + this.focusedObject.name + ' | dist: ' + dist;
      }

      if(this.input.toggleRadar){
        this.isVisible = true;
        this.input.toggleRadar = false;
        this.showRadar();
      }
    },

    destroy: function(){
      // TODO: destroy nodes.
    }

  };

  return Radar;

});
