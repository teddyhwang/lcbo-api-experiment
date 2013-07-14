// Client-side JavaScript, bundled and sent to client.


// Set template to listen for "lcbo_products"
Template.lcbo.products = function() {
    return Session.get('lcbo_products')
};

// Once the template has been created, fire the Meteor call to retrieve the API results
Template.lcbo.created = function() {
    Meteor.call('api_products', function(error, results) {
        var allProducts = results.data.result;
        products = [];

        // The API sometimes returns duplicate products because it can be individual cans or packs of 12 - clean the product list up and do not replicate product name
        for (var i=0; i < allProducts.length; i++) {
            var is_name_in_products = is_value_in_array(products, 'name', allProducts[i]['name']);

            if (allProducts[i].image_thumb_url && !is_name_in_products) {
                products.push(allProducts[i]);
            }
        }

        products = products.slice(0, 28);
        shuffle(products); // Randomize the array so similar products aren't side by side
        Session.set('lcbo_products', products);
    });
};

// Helper methods
function is_value_in_array(array, label, value) {
    for (var i=0; i<array.length; i++) {
        if (array[i][label] === value) {
            // Exists; a duplicate
            return true;
        }
    }

    return false;
}

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
