#Word-Key

###Super simple random key generation

This module is designed to make generating memorable, random keys a breeze. 

##Usage

- `module.getKey()` : returns a string of five words from a generic word bank separated by dashes. (Ex: 'three-four-boop-click-one')
- `module.getKey(3)` : returns a string of three words from a generic word bank separated by dashes. (Ex: 'five-beep-four')
- `module.getKey(3, ['dragon', 'fairy', 'werewolf'])` : returns a string of three words from the given array of mythological creatures separated by dashes (Ex: 'fairy-fairy-werewolf')
- `module.getKey(4, ['dragon', 'fairy', 'werewolf'], '*!')` : returns a string of four words from the given array of mythological creaturs separated by "*!". (Ex: 'dragon*!fairy*!dragon*!werewolf')
