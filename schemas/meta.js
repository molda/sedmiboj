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

});
