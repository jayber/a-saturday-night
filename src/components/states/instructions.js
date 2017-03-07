var getUrlParams = require('../../utils').getUrlParams;
var defaultDanceData = require('json!../../../assets/dance.json');

AFRAME.registerComponent('instructions', {
  init: function () {
    this.startButtonEl = document.querySelector('.start-button');
    this.startButtonEl.querySelector('span').innerHTML = 'Loading'
    this.startButtonEl.querySelector('span').classList.add('loading');
    this.onClicked = this.onClicked.bind(this);
    this.loading = true;
    this.downloadDance();
  },

  downloadDance: function () {
    var urlParams = getUrlParams();
    var self = this;
    if (urlParams.url) {
      this.el.sceneEl.systems['uploadcare'].download(urlParams.url, function (data) {
        self.danceData = data.content;
        self.setupStartButton();

      });
    } else {
      this.danceData = defaultDanceData;
      this.setupStartButton();
    }
  },

  setupStartButton: function () {
    var buttonLabelEl = this.startButtonEl.querySelector('span');
    buttonLabelEl.innerHTML = 'Start';
    buttonLabelEl.classList.remove('loading');
  },

  onClicked: function () {
    var el = this.el;
    document.querySelector('.instructions-overlay').style.display = 'none';
    el.setAttribute('game-state', 'state', 'replay');
    el.components['replay'].loadDance(this.danceData);
  },

  play: function () {
    this.startButtonEl.addEventListener('click', this.onClicked);
  },

  remove: function () {
    this.startButtonEl.removeEventListener('click', this.onClicked);
  }
});
