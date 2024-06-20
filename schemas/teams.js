NEWSCHEMA('Teams', function(schema) {

    schema.define('id', 'String', true);
    schema.define('name', 'String', true);
    schema.define('number', 'Number', true);
    schema.define('player1', 'String');
    schema.define('player2', 'String');
    schema.define('notes', 'String');

	schema.setQuery(function($) {

        if (!$.query.eventid)
            return $.invalid('NOEVENTID');

		NOSQL('teams_' + $.query.eventid).find().sort('id').callback((err, response, meta) => {
            if (err)
                $.invalid('error');
            else
                $.callback(response);
        });
	});

    schema.setInsert(function($) {

        if (!$.query.eventid)
            return $.invalid('NOEVENTID');

		NOSQL('teams_' + $.query.eventid).insert($.model);

        $.success();
	});

    schema.setUpdate(function($) {

        if (!$.query.eventid)
            return $.invalid('NOEVENTID');

		NOSQL('teams_' + $.query.eventid).modify($.model).where('id', $.model.id).callback((err, response) => {

            $.success();

        });
	});

});

/*var surnames = 'Novák,Svoboda,Novotný,Černý,Procházka,Veselý,Horák,Krejčí,Marek,Němec,Pokorný,Pospíšil,Dvořák,Hájek,Jelínek,Růžička'.split(',');
var names = 'Petr,Karel,Tomáš,Jirka,Ladislav,Jaroslav,Miroslav,Petr,Pavel,Josef,Jan,Martin'.split(',');

const getRandomSurname = () => {
    var index = Math.floor(Math.random() * surnames.length);
    return surnames[index];
};

const getRandomName = () => {
    var index = Math.floor(Math.random() * names.length);
    return names[index];
};

for (let i = 0; i < 64; i = i + 2) {
    var num = i / 2;
    var data = { id: 'team' + num, number: num + 1, player1: getRandomName() + ' ' + getRandomSurname(), player2: getRandomName() + ' ' + getRandomSurname(), name: 'Tým č.' + (num + 1) };
    console.log('Insert', data);
    NOSQL('teams_id_20230702_dvojice-zen').insert(data);
}*/
