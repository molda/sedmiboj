
NEWSCHEMA('Users', function(schema) {

	schema.define('email', 'Email', true);
	schema.define('password', 'String', true);

	schema.setInsert(function($, model) {
		$.invalid('Internal server error');
	});

	schema.addWorkflow('login', function($, model) {
		$.invalid('Internal server error');
	});

});