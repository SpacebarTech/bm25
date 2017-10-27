const consonant          = '[b-df-hj-np-tv-xz]';
const consonantY         = '[b-df-hj-np-tv-z]';
const consonants         = `${consonant}${consonantY}{0,}`;
const headConsonants     = `^(${consonants})?`;

const vowel              = '[aeiou]';
const vowelY             = '[aeiouy]';
const vowels             = `${vowelY}${vowel}{0,}`;
const tailVowels         = `(${vowels})?$`;

const vowelsConsonants   = `${vowels}${consonants}`;
const matchHeader        = `${headConsonants}${vowelsConsonants}`;

const mgr0               = matchHeader;
const meq1               = `${matchHeader}${tailVowels}`;
const mgr1               = `${matchHeader}${vowelsConsonants}`;
const vowelStem          = `${headConsonants}${vowel}`;

const dollaBillz         = '$1$2';
const nil                = '';

const nonAlphaNumeric    = /(\s+|\W)/g;
const pluralS            = /^(.+?)([^s])s/g;
const pluralSS           = /^(.+?)(ss|i)es$/;
const presentTense       = /^(.+?)eed$/;
const presentProgressive = /^(.+?)(ed|ing)/g;

const stateSuffixes      = /(at|bl|iz)$/;
const repeatedConsonants = /([^aeiouylsz])\1$/;
const endsWithConsonant  = new RegExp( `^${consonants}${vowel}[^aeiouwxy]$` );
const endsWithY          = /^(.+?)y$/;
const endsWithE          = /^(.+?)e$/;
const adSpeechSuffix     = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
const adSuffixShort      = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
const qualities          = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
const actions            = /^(.+?)(s|t)(ion)$/;
const doubleL            = /ll$/;


module.exports = {
	consonant,
	consonantY,
	consonants,
	headConsonants,
	vowel,
	vowelY,
	vowels,
	tailVowels,
	vowelsConsonants,
	matchHeader,
	mgr0,
	meq1,
	mgr1,
	vowelStem,
	dollaBillz,
	nil,
	nonAlphaNumeric,
	pluralS,
	pluralSS,
	presentTense,
	presentProgressive,
	stateSuffixes,
	repeatedConsonants,
	endsWithConsonant,
	endsWithY,
	endsWithE,
	adSpeechSuffix,
	adSuffixShort,
	qualities,
	actions,
	doubleL,
};
