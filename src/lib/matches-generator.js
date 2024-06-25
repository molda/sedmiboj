import crypto from 'crypto';

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

// 7 sports selected in event settings ['tennis', 'pingpong', 'football', 'voleyball', 'basketball', 'handball', 'netball']
export const initializeMatches = (event, teams, sports) => {
    console.log('initializeMatches', { event, teams, sports });
	var first2rounds = [];
    return new Promise((resolve) => {
		var all_matches = [];
        sports.forEach((sport, index) => {
            let i = 0;
            console.log(index, sport, first2rounds);
            while (true) {
                let matches = init2(event, teams, sport);

                var str = '';
                // first 4 matches in each sport should not be played by the same teams
                for (let i = 0; i < 3; i++) {
                    str += matches[i].team1 + ',';
                    str += matches[i].team2 + ',';
                }

                if (!first2rounds.some(team => str.includes(team + ','))) {
                    first2rounds.push(matches[0].team1, matches[0].team2, matches[1].team1, matches[1].team2);
                    matches.forEach(m => m.id = crypto.randomUUID());
                    all_matches = all_matches.concat(matches);
                    console.log('Loop', sport, i);	
                    break;
                }
                i++;
            }
        });
		resolve(all_matches);
    });
};

const init2 = (event, teams, sport) => {
	var teams2 = shuffle(teams.map(t => t));
	var matches = [];
	for (let i = 0; i < 16; i++)
		matches.push({ event, sport, team1: teams2.pop().id, team2: teams2.pop().id, id: 'match' + (i + 1), match: (i + 1), score1: 0, score2: 0, round: 1, winner: '', status: '' });

	for (let i = 16; i < 24; i++)
		matches.push({ event, sport, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score1: 0, score2: 0, round: 2, winner: '', status: '' });

	for (let i = 24; i < 28; i++)
		matches.push({ event, sport, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score1: 0, score2: 0, round: 3, winner: '', status: '' });

	for (let i = 28; i < 30; i++)
		matches.push({ event, sport, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score1: 0, score2: 0, round: 4, winner: '', status: '' });

	for (let i = 30; i < 31; i++)
		matches.push({ event, sport, team1: '', team2: '', id: 'match' + (i + 1), match: (i + 1), score1: 0, score2: 0, round: 5, winner: '', status: '' });

	matches[0].status = 'active';
	return matches;
};