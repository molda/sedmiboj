NEWSCHEMA('Meta', function(schema) {

    schema.define('year', 'Number', true);
    schema.define('data', 'Object', true);

	schema.setRead(function($) {

        var year = $.query.year || new Date().getFullYear();
		NOSQL('meta').find().where('year', year).callback((err, response, meta) => {
            if (err)
                $.invalid('error');
            else
                $.callback(response.length ? response[0] : { year, data: {}});
        });
	});

    schema.setUpdate(function($) {

        var year = $.query.year || new Date().getFullYear();

		NOSQL('meta').modify($.model, true).where('year', year).callback((err, response) => {

            $.success();

        });
	});

	schema.addWorkflow('clear', function($){
		var year = $.query.year || new Date().getFullYear();
		NOSQL('matches_' + year).clear((err, response, meta) => {
            NOSQL('teams_' + year).clear((err, response, meta) => {
                NOSQL('meta').modify({ data: { init: false }}).where('year', year).callback((err, response) => {

                    $.success();
        
                });
            });
        });
	});

	schema.addWorkflow('clearmatches', function($){
		var year = $.query.year || new Date().getFullYear();
		NOSQL('matches_' + year).clear((err, response, meta) => {
            NOSQL('meta').modify({ data: { init: false }}).where('year', year).callback((err, response) => {

                $.success();
    
            });
        });
	});

});
