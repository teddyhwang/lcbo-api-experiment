// Server-side JavaScript to retrieve LCBO API results

var API_URLS = {
    lcbo: "http://lcboapi.com"
}

// Let the server make HTTP Get requests to the LCBO API
Meteor.methods({
    lcbo: function(parameters) {
        this.unblock();
        return Meteor.http.get(API_URLS.lcbo+parameters);
    }
});
