// Server-side JavaScript

var API_URLS = {
    products: "http://lcboapi.com/products/?per_page=100"
}

// Let the server make HTTP Get requests to the LCBO API
Meteor.methods({
    api_products: function() {
        this.unblock();
        return Meteor.http.get(API_URLS.products);
    }
});
