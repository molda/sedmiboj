exports.install = function() {

	ROUTE('GET   /api/events/                  *Events --> query');
	ROUTE('GET   /api/events/{id}              *Events --> read');
	ROUTE('+POST /api/events/                  *Events --> update');

	ROUTE('GET   /api/meta/                    *Meta --> read');
	ROUTE('+POST /api/meta/                    *Meta --> update');
	ROUTE('+GET  /api/clear/                   *Meta --> clear');
	ROUTE('+GET  /api/clearmatches/            *Meta --> clearmatches');

	ROUTE('GET   /api/teams/                   *Teams --> query');
	ROUTE('+POST /api/teams/                   *Teams --> insert');
	ROUTE('+POST /api/teams/{id}               *Teams --> update');

	ROUTE('GET   /api/matches/init             *Matches --> init', [30 * 1000]);
	ROUTE('GET   /api/matches/isfree           *Matches --> isfree');
	ROUTE('GET   /api/matches/{id}             *Matches --> read');
	ROUTE('GET   /api/matches/                 *Matches --> query');
	ROUTE('+POST /api/matches/                 *Matches --> update');

	ROUTE('GET   /api/rankings/                *Rankings --> read');
    
};