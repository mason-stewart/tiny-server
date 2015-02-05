

/**
 * With only the keyLength parameter, the module will return a string
 * of five  words, chosen randomly from the  default word bank, 
 * separated by a '-'. 
 */

exports.getKey = function (keyLength, wordBank, delimiter) {
	var defaultWordBank = ['one', 'two', 'three', 'four', 'five', 'beep', 'boop', 'whir', 'click'],
	    defaultDelimiter = '-',
			defaultLength = 5;
      myKey = [];
	if (!keyLength || typeof keyLength !== 'number') { keyLength = defaultLength; }
	if (!wordBank || wordBank.constructor !== Array) { wordBank = defaultWordBank; }	
	if (!delimiter || typeof delimiter !== 'string') { delimiter = defaultDelimiter; }

	for (var i=0; i < keyLength; i++) {
		myKey.push(wordBank[Math.floor(Math.random() * (wordBank.length) )]);
	}
	return myKey.join(delimiter);
}
