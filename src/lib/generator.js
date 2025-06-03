const shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generate = (eventId, teams, sport) => {
    const matches = [];

    // Generate 16 matches regardless of team count
    let shuffledTeams = shuffle(teams);

    // Create all 16 matches and fill 
    for (let i = 1; i < 17; i++) { // match 1-16
        const match = {
            event: eventId,
            sport,
            team1: shuffledTeams.pop().id,
            team2: shuffledTeams.pop()?.id, // this may not be filled, will check later in code
            id: sport + '_match_' + i,
            match: i,
            score1: 0,
            score2: 0,
            round: 1,
            winner: '',
            status: ''
        };

        matches.push(match);
    }

    let round = 2;
    for (let i = 17; i < 33; i++) { // match 17-32

        const match = {
            event: eventId,
            sport,
            team1: '',
            team2: '',
            id: sport + '_match_' + i,
            match: i,
            score1: 0,
            score2: 0,
            round: round,
            winner: '',
            status: ''
        };

        if (i === 24 || i === 28 || i === 30)
            round++;

        matches.push(match);
    }

    console.log('Remaining teams:', shuffledTeams);

    // Handle preliminary round if more than 32 teams
    if (shuffledTeams.length) {
        let index = 0;
        let matchIndexes = [7, 8, 6, 9, 5, 10, 4, 11, 3, 12, 2, 13, 1, 14, 0, 15]; // match indexes from midle outward

        // while we have teams left we start taking one team from existing matches and move them to preliminary round
        // and we create a new match with that team and a one from remaining
        for (let i = 0; i < shuffledTeams.length; i++) {
            // get team from existing match
            let match = matches[matchIndexes[index]];
            var team1 = match.team1;
            match.team1 = '';

            matches.push({
                event: eventId,
                sport: sport,
                team1: team1,
                team2: shuffledTeams[i].id,
                id: sport + '_match_prelim_' + matchIndexes[index],
                match: -matchIndexes[index],
                score1: 0,
                score2: 0,
                round: 0,
                winner: '',
                status: '',
                preliminary: true
            });

            index++;
        }
    }

    return matches;
};

export const generateMatches = (eventId, teams, sports) => {
    const matches = [];

    sports.forEach(sport => {
        matches.push(...generate(eventId, teams, sport));
    });

    return matches;
};