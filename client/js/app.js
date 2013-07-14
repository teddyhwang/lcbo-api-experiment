// Client-side JavaScript, bundled and sent to client.

// Set template to listen for "lcbo_products"
Template.lcbo.products = function() {
    return Session.get('lcbo_products');
};

// Once the template has been created, fire the Meteor call to retrieve the API results
Template.lcbo.created = function() {
    Meteor.call('api_products', function(error, results) {
        var products = results.data.result;
        Session.set('lcbo_products', products);
    });
};


