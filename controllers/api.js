exports.install = function() {

	ROUTE('+GET  /api/meta/                     *Meta --> read');
	ROUTE('+POST /api/meta/                     *Meta --> update');

	ROUTE('+GET  /api/teams/                    *Teams --> query');
	ROUTE('+POST /api/teams/                    *Teams --> insert');
	ROUTE('+POST /api/teams/{id}                *Teams --> update');

	ROUTE('+GET  /api/matches/init              *Matches --> init', [30 * 1000]);
	ROUTE('+GET  /api/matches/{id}              *Matches --> read');
	ROUTE('+GET  /api/matches/                  *Matches --> query');
	ROUTE('+POST /api/matches/                  *Matches --> update');
    
};