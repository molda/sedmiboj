
NEWSCHEMA('Matches', function(schema) {

	schema.define('id', 'String', true);
	schema.define('category', 'String', true);
	schema.define('match', 'Number', true);
	schema.define('round', 'Number', true);
	schema.define('team1', 'String', true);
	schema.define('team2', 'String', true);
	schema.define('winner', 'String');
	schema.define('score', 'Array');
	schema.define('active', 'Boolean')(false);
	schema.define('closed', 'Boolean')(false);

	schema.setQuery(function($) {

		var { category, eventid } = $.query;
		if (!eventid)
			return $.invalid('NOEVENTID');

		var builder = NOSQL('matches_' + eventid).find();
		category && builder.where('category', category);
		builder.sort('match_asc');
		builder.callback((err, response, meta) => {
			if (err)
				$.invalid('error');
			else
				$.callback(response);
		});
	});

	schema.setUpdate(function($){
		var eventid = $.query.eventid;
		if (!eventid)
			return $.invalid('NOEVENTID');

		console.log('UPDATING', eventid, $.model.id, $.model.category, $.model.score);
		var builder = NOSQL('matches_' + eventid).modify($.model);
		builder.first();
		builder.where('id', $.model.id);
		builder.where('category', $.model.category);
		builder.callback((err, response) => {
			console.log('UPDATED', err, response);
			if (err)
				$.invalid('error');
			else {
				$.model.closed && fillNewMatch(eventid, $.model.category, $.model.id);
				setTimeout(() => $.callback(response), 2000);
				console.log('Clear cache');
				CACHE('rankings', [], '5 seconds');
			}
		});
	});

	schema.addWorkflow('init', function($){
		var eventid = $.query.eventid;
		if (!eventid)
			return $.invalid('NOEVENTID');

		var ctrl = EXEC('GET Events --> read', function(err, response) {

			if (!err && response && !response.init) {

				var ctrl2 = EXEC('GET Teams --> query', function(err, response) {
					console.log('TEAMS', err, response);
					init(response, (matches) => matches.forEach(match => NOSQL('matches_' + eventid).insert(match)));
					NOSQL('events').modify({ init: true }).where('id', eventid).callback((err, response) => {

						setTimeout($.success.bind($), 3000);
			
					});
				});
				ctrl2.query = { eventid };

			} else {
				$.success(false, { error: err || 'Již slosováno.'});
			}

		});
		ctrl.query = { eventid };
	});

	schema.addWorkflow('isfree', function($){
		var eventid = $.query.eventid;
		if (!eventid)
			return $.invalid('NOEVENTID');

		var team = $.query.team;
		var builder = NOSQL('matches_' + eventid).find();
		builder.or(function() {
			builder.where('team1', team);
			builder.where('team2', team);
		});
		builder.callback((err, response, meta) => {
			var active = (response || []).filter(m => m.active).map(m => m.category);
			console.log('isfree', team, active);
			if (err)
				$.invalid('error');
			else
				$.callback({ active });
		});
	});

});

const matchPairs = {};
for (let i = 1; i < 33; i++) // { 1: 2, 2: 1, .... }
	matchPairs[i] = i % 2 === 0 ? i - 1 : i + 1;

const fillNewMatch = (eventid, category, id) => {
	var builder = NOSQL('matches_' + eventid).find();
	builder.where('category', category);
	builder.callback((err, matches) => {
		if (err || !matches || !matches.length)
			return console.log('[Schema:matches] failed at fillNewMatch');
		var match = matches.find(m => m.id === id);
		var nextmatchnum;
		var winner, winner2;
//console.log('MATCH', match);
//console.log('OTHER', matchPairs[match.match]);
		var othernum = matchPairs[match.match];
		var reverse = match.match > othernum;
		var matchnum = reverse ? match.match : othernum;
		var match2 = matches.find(m => m.match === othernum);

		if (!match2.closed)
			return;

		var [ s1, s2 ] = match.score;
		winner = s1 > s2 ? match.team1 : match.team2;
		var [ c1, c2 ] = match2.score;
		winner2 = c1 > c2 ? match2.team1 : match2.team2;

		if (reverse) {
			var tmp = winner;
			winner = winner2;
			winner2 = tmp;
		}

		// get smaller match num
		// get match num in next round 
		if (match.round === 1)
			nextmatchnum = 16 + (matchnum / 2);
		else if (match.round === 2)
			nextmatchnum = 24 + ((matchnum - 16) / 2);
		else if (match.round === 3)
			nextmatchnum = 28 + ((matchnum - 24) / 2);
		else if (match.round === 4)
			nextmatchnum = 30 + ((matchnum - 28) / 2) + 1;

		if (nextmatchnum > 32)
			return;

		//console.log('nextmatchnum', nextmatchnum, winner, winner2);
		//console.log(match, match2);

		var builder = NOSQL('matches_' + eventid).modify({ team1: winner, team2: winner2 });
		builder.first();
		builder.where('match', nextmatchnum);
		builder.where('category', category);
		builder.callback((err, response) => {
			if (err)
				console.log('[Schema:matches] failed at fillNewMatch, update new match');
			if (nextmatchnum === 32) {
				var looser = s1 < s2 ? match.team1 : match.team2;
				var looser2 = c1 < c2 ? match2.team1 : match2.team2;
				var builder = NOSQL('matches_' + eventid).modify({ team1: looser, team2: looser2 });
				builder.first();
				builder.where('match', nextmatchnum - 1);
				builder.where('category', category);
				builder.callback((err, response) => {

				});
			}
		});
	});
};

const shuffle = (array) => {
	let currentIndex = array.length, randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {

		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}

var init = (teams, callback) => {
	var first2rounds = [];
	['tennis', 'pingpong', 'football', 'voleyball', 'basketball', 'handball', 'netball'].forEach((category, index) => {
		let i = 0;
        console.log(index, category, first2rounds);
		while (true) {
			let matches = init2(teams, category);

            var str = '';
            for (let i = 0; i < 4; i++) {
                str += matches[i].team1 + ',';
                str += matches[i].team2 + ',';
            }

            if (!first2rounds.some(team => str.includes(team + ','))) {
				first2rounds.push(matches[0].team1, matches[0].team2, matches[1].team1, matches[1].team2);
				callback(matches);
    			console.log('Loop', category, i);	
				break;
			}
            i++;
		}
	});
};

const init2 = (teams, category) => {
	var teams2 = shuffle(teams.map(t => t));
	var matches = [];

	// 1st round - 16 matches
	for (let i = 0; i < 16; i++)
		matches.push({ category, team1: teams2.pop().id, team2: teams2.pop().id, id: 'match' + (i + 1), match: (i + 1), score: [0, 0], round: 1, active: false, closed: false });

	// 2nd round - 8 matches
	for (let i = 16; i < 24; i++)
		matches.push({ category, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score: [], round: 2, active: false, closed: false });

	// 3rd round - 4 matches
	for (let i = 24; i < 28; i++)
		matches.push({ category, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score: [], round: 3, active: false, closed: false });

	// 4th round - 2 matches
	for (let i = 28; i < 30; i++)
		matches.push({ category, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score: [], round: 4, active: false, closed: false });

	// 3rd/4th place
	matches.push({ category, team1: '', team2: '', id: 'match31', match: 31, score: [], round: 5, active: false, closed: false });

	// 1st/2nd place
	matches.push({ category, team1: '', team2: '', id: 'match32', match: 32, score: [], round: 6, active: false, closed: false });

	matches[0].active = true;
	return matches;
};
