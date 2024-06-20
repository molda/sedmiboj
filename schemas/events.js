NEWSCHEMA('Events', function(schema) {

    schema.define('id', 'String', true);
    schema.define('name', 'String', true);
    schema.define('counter', 'String');
    schema.define('date', 'Date', true);
    schema.define('init', 'Boolean');

	schema.setQuery(function($) {

		NOSQL('events').find().callback((err, response = [], meta) => {
            if (err)
                $.invalid('error');
            else
                $.callback(response);
        });
	});

	schema.setRead(function($) {

		NOSQL('events').one().where('id', $.params.id).callback((err, response, meta) => {
            if (err)
                $.invalid('error');
            else
                $.callback(response);
        });
	});

    schema.setUpdate(function($) {

		NOSQL('events').modify($.model, true).where('id', $.params.id).callback((err, response) => {

            $.success();

        });
	});

});
