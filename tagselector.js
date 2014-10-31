function TagSelector(settings) {
	if (settings.container == undefined || settings.input == undefined || settings.autocomplete == undefined) {
		console.error('invalid settings, failed to initialize tagselector');
		return;
	}

	this.__tags = [];
	this.__container = document.getElementById(settings.container);
	this.__input = document.getElementById(settings.input);
	this.__autocomplete = document.getElementById(settings.autocomplete);
	this.__list = this.__autocomplete.children[0];
	this.__defaultWidth = !!settings.inputWidth ? settings.inputWidth + 'px' : '40px';
 
	this.__hideAutocomplete();
	this.__initTagIndex();
}
 
TagSelector.prototype.init = function() {
	var that = this;
	that.__input.style.width = that.__defaultWidth;
	that.__input.focus();
 
	that.__container.onclick = function(){		
		that.__input.focus();
	};
 
	that.__input.onkeydown = function(e) {
		if (e.keyCode === 13 && this.value.length > 0) { // enter
			if (!that.__autocompleteHidden) {
				var selected = that.__getSelectedTag();
				if (selected != undefined && selected.innerHTML != '') {
					that.__addTag(selected.innerHTML);
				}
			} else {
				that.__addTag(this.value);
			}
		} else if (e.keyCode === 40) { // down
			if (that.__autocompleteHidden)
				return;
 
			that.__selectNextTag();
		} else if (e.keyCode === 38) { // up
			if (that.__autocompleteHidden)
				return;
 
			that.__selectPrevTag();
		} else if (e.keyCode === 8 && this.value.length === 0) { // backspace
			that.__removeLastTag();
		}
	};
 
	that.__input.onkeyup = function(e) {
		if (e.keyCode === 38 || e.keyCode === 40)
			return;
 
		if (this.value.length === 0) {
			this.style.width = that.__defaultWidth;
			that.__hideAutocomplete();
		} else {
			that.__updateAutocomplete();

			if (this.value.length > 4) {
				var width = this.style.width;
				this.style.width = this.value.length*9 + 'px';
			} else {
				this.style.width = that.__defaultWidth;
			}
		}
	};
 
	that.__input.onblur = function(e) {
		// use timeout to don't stoping li's onclick event 
		setTimeout(function() {
			that.__hideAutocomplete();
		}, 200);
	};
 
	that.__input.onfocus = function() {
		that.__updateAutocomplete();
	};
};
 
TagSelector.prototype.__addTag = function(text) {
	this.__input.value = '';
 
	var i;
	for (i = 0; i < this.__tags.length; ++i) {
		if (this.__tags[i] === text)
			return;
	}
 
	var that = this;
	var tag = document.createElement('div');
	tag.onclick = function() {
		that.__removeTag(text);
		this.remove();
	};
 
	tag.className = 'tag';
	tag.innerHTML = text;
 
	this.__container.insertBefore(tag, this.__input.parentNode);
	this.__tags.push(text);
};
 
TagSelector.prototype.__removeLastTag = function() {
	var tags = this.__container.children, i = tags.length-1;
	for (; i >= 0; --i) {
		if (tags[i].className === 'tag') {
			this.__removeTag(tags[i].innerHTML);
			tags[i].remove();
			return;
		}
	}
};
 
TagSelector.prototype.__removeTag = function(tag) {
	for (var i = 0; i < this.__tags.length; ++i) {
		if (this.__tags[i] === tag) {
			this.__tags.splice(i, 1);
			break;
		}
	}
};
 
TagSelector.prototype.__findTags = function(text) {
	if (text == '')
		return [];
 
	var tags = [],
		indexed = this.__tagIndex[text[0]] || [],
		i = 0;
 
	for (; i < indexed.length; ++i) {
		var tag = indexed[i];
		if (tag.indexOf(text) === 0 && this.__tags.indexOf(tag) === -1) {
			tags.push(indexed[i]);
 
			if (tags.length >= 10)
				break;
		}
	}
 
	tags.push(text);
	return tags;
};
 
TagSelector.prototype.__hideAutocomplete = function() {
	this.__autocomplete.style.display = 'none';
	this.__autocompleteHidden = true;
};
 
TagSelector.prototype.__showAutocomplete = function() {
	this.__autocomplete.style.display = 'block';
	this.__autocompleteHidden = false;
};
 
TagSelector.prototype.__addAutocompleteTags = function(items) {
	var that = this;
 
	that.__list.innerHTML = '';
 	
	for (var i = 0; i < items.length; ++i) {
		var item = document.createElement('li');
		item.onclick = function() {
			that.__addTag(this.innerHTML);
			that.__hideAutocomplete();
			that.__input.focus();
		};
		item.onmouseover = function() {
			var siblings = this.parentNode.children,
				i = 0;
			
			for (; i < siblings.length; ++i) {
				siblings[i].classList.remove('selected-tag');
			}

			this.classList.add('selected-tag');
		};
		item.onmouseleave = function() {
			var siblings = this.parentNode.children,
				i = 0;
			
			for (; i < siblings.length; ++i) {
				siblings[i].classList.remove('selected-tag');
			}

			siblings[0].classList.add('selected-tag');
		};
 
		item.innerHTML = items[i];
 
		if (i === 0)
			item.className = 'autocomplete-tag selected-tag';
		else
			item.className = 'autocomplete-tag';
 
		that.__list.appendChild(item);
	}
};
 
TagSelector.prototype.__updateAutocomplete = function() {
	var items = this.__findTags(this.__input.value);
	if (items.length > 1) {
		this.__addAutocompleteTags(items);
		this.__showAutocomplete();
	} else {
		this.__hideAutocomplete();
	}
};
 
TagSelector.prototype.__getSelectedTag = function() {
	return document.getElementsByClassName('autocomplete-tag selected-tag')[0];
};
 
TagSelector.prototype.__selectSiblingTag = function(algo) {
	var tags = document.getElementsByClassName('autocomplete-tag');
	var selectedIndex = 0, i = 1;
	
	for (; i < tags.length; ++i) {
		if (tags[i].classList.contains('selected-tag')) {
			selectedIndex = i;
			break;
		}
	}
 
	tags[selectedIndex].className = 'autocomplete-tag';
	selectedIndex = algo(selectedIndex, tags.length);
	tags[selectedIndex].className = 'autocomplete-tag selected-tag';
};
 
TagSelector.prototype.__prevIndexAlgo = function(idx, length) {
	if (idx === 0)
		return length-1;
	return idx-1;
}
 
TagSelector.prototype.__nextIndexAlgo = function(idx, length) {
	if (idx === length-1)
		return 0;
	return idx+1;
}
 
TagSelector.prototype.__selectNextTag = function() {
	this.__selectSiblingTag(this.__nextIndexAlgo);
};
 
TagSelector.prototype.__selectPrevTag = function() {
	this.__selectSiblingTag(this.__prevIndexAlgo);
};
 
TagSelector.prototype.__initTagIndex = function() {
	this.__tagIndex = {
		'a': ['ambient', 'alternative', 'acoustic', 'audio', 'acid', 'acid jazz', 'acid rock', 'afro', 'arabic', 'art'],
		'b': ['bass', 'beat', 'beats', 'band', 'beatboxing', 'beautiful', 'berlin school', 'breakbeat', 'breaks', 'brazil'],
		'c': ['club', 'city', 'cool', 'chill', 'chillout', 'chillstep', 'cover', 'classical', 'crazy', 'celtic', 'country', 'chanson'],
		'd': ['dub', 'dubstep', 'deep', 'deep house', 'dj', 'demo', 'dance', 'dancehall', 'dark ambient', 'dark progressive', 'disco', 'downtempo', 'drum & bass', 'drumstep', 'dutch'],
		'e': ['edm', 'edit', 'electro', 'electronica', 'electro house', 'eurodance', 'experimental', 'eurobeat', 'exotica'],
		'f': ['fun', 'feel', 'flow', 'folk', 'funk', 'free', 'fusion', 'future garage'],
		'g': ['goa', 'garage', 'glitch', 'gangsta rap', 'girl', 'gothic'],
		'h': ['house', 'hip-hop', 'hit', 'hardcore', 'hard rock'],
		'i': ['idm', 'ibiza', 'indie', 'indie pop', 'indie rock', 'instrumental', 'industrial', 'improvisation'],
		'j': ['jazz', 'jam', 'j-pop', 'jungle', 'jazz funk', 'jazz fusion'],
		'k': ['kick', 'kid', 'k-pop', 'krautrock'],
		'l': ['life', 'live', 'latin', 'lo-fi', 'light', 'loop', 'love', 'london'],
		'm': ['mix', 'mc', 'mind', 'music', 'mashup', 'melodic', 'metal', 'mexico', 'microhouse', 'minimal', 'minimal techno', 'minimal trance', 'mixtape', 'middle eastern'],
		'n': ['new', 'nudisco', 'nu jazz', 'nice', 'night', 'neurofunk', 'new wave', 'noise', 'neofolk', 'new york blues'],
		'o': ['old', 'oldschool', 'opera', 'other', 'original'],
		'p': ['pop', 'progressive', 'progressive house', 'progressive trance', 'punk', 'piano', 'party', 'power', 'people', 'promo', 'post-rock', 'pop rock', 'progressive rock', 'pixound'],
		'q': ['quality'],
		'r': ['rap', 'r & b', 'rock', 'radio', 'rave', 'reggae', 'relax', 'rhapsody', 'raga', 'remix', 'retro', 'release', 'rock & roll'],
		's': ['solo', 'slow', 'sad', 'sega music', 'soul', 'soulful', 'sound', 'sonata', 'swag', 'synth', 'synthpop'],
		't': ['tech', 'trap', 'techno', 'trash', 'techstep', 'tech house', 'tech trance', 'trance', 'trip-hop', 'tribal house', 'techno-industrial', 'theme'],
		'u': ['uk', 'uk garage', 'uk hard house', 'urban', 'uplifting', 'uplifting trance', 'underground'],
		'v': ['vocal', 'vinyl', 'voice', 'violin', 'vocal house', 'video game'],
		'w': ['wave', 'world', 'west']
	};
};