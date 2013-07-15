// Client-side JavaScript, bundled and sent to client.

// Set template to listen for "lcbo_products"
Template.background_product_images.products = function() {
    return Session.get('product_images');
};

Template.search_results.hidden = function() {
    return Session.get('search_results_hidden');
};
Template.search_results.no_results = function() {
    return Session.get('no_results');
};

Template.search_results.products = function() {
    var response = Session.get('search_results_response');

    if (response) return response.result;
};

Template.search_results.query = function() {
    return Session.get('search_results_query');
};

Template.search_results.results_to_this_page = function() {
    var response = Session.get('search_results_response'),
        resultsToThisPage = parseFloat(response.pager.current_page) * parseFloat(response.pager.current_page_record_count);

    if (response.pager.is_final_page) {
        resultsToThisPage = response.pager.total_record_count - response.pager.current_page_record_count;
    }

    if (response) return resultsToThisPage;
};

Template.search_results.total_record_count = function() {
    var response = Session.get('search_results_response');

    if (response) return response.pager.total_record_count;
};

Template.search_results.previous_page = function() {
    var response = Session.get('search_results_response');

    if (response) return response.pager.previous_page;
};

Template.search_results.previous_page_path = function() {
    var response = Session.get('search_results_response');

    if (response) return response.pager.previous_page_path;
};

Template.search_results.next_page = function() {
    var response = Session.get('search_results_response');

    if (response) return response.pager.next_page;
};

Template.search_results.next_page_path = function() {
    var response = Session.get('search_results_response');

    if (response) return response.pager.next_page_path;
};

Template.product_detail.stores = function() {
    var response = Session.get('product_detail');

    if (response) return response.result;
};

Template.product_detail.product_name = function() {
    var response = Session.get('product_detail');

    if (response) return response.product.name;
};

// Once the template has been created, fire the Meteor call to retrieve the API results
Template.background_product_images.created = function() {
    Meteor.call('lcbo', '/products?per_page=100', function(error, results) {
        var allProducts = results.data.result;
        products = [];

        // The API sometimes returns duplicate products because it can be individual cans or packs of 12 - clean the product list up and do not replicate product name
        for (var i=0; i < allProducts.length; i++) {
            var is_name_already_in_products = is_value_in_array(products, 'name', allProducts[i]['name']);

            if (allProducts[i].image_thumb_url && !is_name_already_in_products) {
                products.push(allProducts[i]);
            }
        }

        products = products.slice(0, 28);
        shuffle(products); // Randomize the array so similar products aren't side by side
        Session.set('product_images', products);
    });
};

Template.search_products.events({
    'keypress #search-input': function(evt) {
        if (evt.which === 13) {
            evt.preventDefault();
            var query = $(evt.currentTarget).val();

            Session.set('search_results_query', query);
            Meteor.call('lcbo', '/products?per_page=20&q='+query, function(error, results) {
                if (results.data.result.length == 0) {
                    Session.set('no_results', true);
                } else {
                    Session.set('no_results', false);
                    Session.set('search_results_response', results.data);
                }
            });
        }

        return;
    }
});

Template.search_results.events({
    'click .pagination': function(evt) {
        evt.preventDefault();
        var pagePath = $(evt.currentTarget).data('page_path');

        // Reset results
        Session.set('search_results_response', null);

        Meteor.call('lcbo', pagePath, function(error, results) {
            Session.set('search_results_response', results.data);
        });
    },
    'click .where-to-buy': function(evt) {
        evt.preventDefault();
        var productId = $(evt.currentTarget).parents('li').data('id');
        Session.set('search_results_hidden', 'hidden');

        Meteor.call('lcbo', '/products/'+productId+'/stores?per_page=100', function(error, results) {
            Session.set('product_detail', results.data);
        });
    }
});

Template.product_detail.events({
    'click .back-to-results': function(evt) {
        evt.preventDefault();
        Session.set('search_results_hidden', '');
        Session.set('product_detail', '');
    }
});

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

function formatCurrency(num) {
    num = isNaN(num) || num === '' || num === null ? 0.00 : num;
    return parseFloat(num).toFixed(2);
}

Handlebars.registerHelper('price_in_dollar', function(cents) {
    var price = cents / 100;
    price = formatCurrency(price);

    return price;
});
